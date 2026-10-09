// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  extractStdsSpells,
  prepareStdsSpells,
} from "../../src/compendium/spellsThatDontSuck.ts";

/** Build a compact page with licensing evidence and repeated names outside the spell section. */
function page(body: string): string {
  return `<html><body><script>Never execute this source</script>${body}<h2>Changelog</h2><p>Not spell rules.</p>
    <h4>Test</h4><p><em>Replaced With: Other</em></p><p>Design commentary.</p>
    <section><h2>Credits &amp; References</h2><p>Omega Ankh &amp; somanyrobots. Creative Commons Attribution 4.0 International. Includes KibblesTasty spells.</p></section></body></html>`;
}

/** Build a spell heading and metadata in the publisher's rendered structure. */
function heading(
  name: string,
  header = "2nd-level evocation",
  extra = "",
): string {
  return `<h4>${name}</h4><p><em>${header}</em></p><hr><ul>
    <li><strong>Classes:</strong> Sorcerer, Wizard</li><li><strong>Casting Time:</strong> 1 action</li>
    <li><strong>Range:</strong> 60 feet</li><li><strong>Components:</strong> V, S, M (a pearl (worth 100 gp))</li>
    <li><strong>Duration:</strong> Concentration, 1 minute</li>${extra}</ul><hr>`;
}

describe("direct Spells That Don’t Suck extraction", () => {
  it("replays cached HTML through the CLI without approving publication", () => {
    const dir = mkdtempSync(join(tmpdir(), "openfray-direct-spells-"));
    try {
      const html = page(`<section>${heading("Test")}<p>Rules.</p></section>`);
      const input = join(dir, "cached.html");
      writeFileSync(input, html);
      const script = fileURLToPath(
        new URL(
          "../../scripts/prepare-spells-that-dont-suck.ts",
          import.meta.url,
        ),
      );
      const result = spawnSync(process.execPath, [script, input], {
        cwd: dir,
        encoding: "utf8",
      });
      expect(result.status, result.stderr).toBe(0);
      const root = join(dir, "output/spells-that-dont-suck-preparation");
      expect(readFileSync(join(root, "source.html"), "utf8")).toBe(html);
      const report = JSON.parse(
        readFileSync(join(root, "report.json"), "utf8"),
      );
      expect(report).toMatchObject({
        keptCount: 1,
        input: "offline",
        publishable: false,
        license: "CC-BY-4.0",
      });
      expect(report.sha256).toMatch(/^[a-f0-9]{64}$/);
      const strict = spawnSync(process.execPath, [script, input, "--strict"], {
        cwd: dir,
        encoding: "utf8",
      });
      expect(strict.status, strict.stderr).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("extracts spell blocks without design notes, changelog, art, or executable page content", () => {
    const html = page(
      `<section>${heading("Test &amp; Spell", undefined, "<li><strong>Replaces:</strong> Old Spell</li>")}<p>You deal <strong>2d6 fire damage</strong>.</p><img src="never-fetch-art.png"></section>`,
    );
    const result = prepareStdsSpells(html);
    expect(result.report.rawCount).toBe(1);
    expect(result.spells[0]).toMatchObject({
      name: "Test & Spell",
      id: "somanyrobots-spells-that-dont-suck:test-spell",
      level: 2,
      school: "Evocation",
      concentration: true,
      duration: "up to 1 minute",
      classes: ["Sorcerer", "Wizard"],
    });
    expect(result.spells[0].components.materials).toBe(
      "a pearl (worth 100 gp)",
    );
    expect(result.spells[0].text).toBe("You deal **2d6 fire damage**.");
    expect(result.spells[0].mechanics).toBeUndefined();
    expect(result.report.replacements).toEqual([
      { name: "Test & Spell", replaces: "Old Spell" },
    ]);
    expect(result.report.publishable).toBe(false);
    expect(result.report.validation.errors).toBe(0);
  });

  it("retains a Replaces label without a colon, as printed for Stream of Flame", () => {
    const result = prepareStdsSpells(
      page(
        `<section>${heading("Stream of Flame", undefined, "<li><strong>Replaces</strong> <em>Old Spell</em></li>")}<p>Rules.</p></section>`,
      ),
    );
    expect(result.report.replacements).toEqual([
      { name: "Stream of Flame", replaces: "Old Spell" },
    ]);
    expect(result.report.withheld).toEqual([]);
  });

  it("preserves nested stat blocks and tables while omitting advice panels", () => {
    const html =
      page(`<section>${heading("Summon Test", "3rd-level conjuration (ritual)")}
      <p>You summon a spirit.</p><table><tr><th>Roll</th><th>Result</th></tr><tr><td>1</td><td>Cold <em>or</em> fire</td></tr></table>
      <blockquote><p>GM advice that must not ship.</p></blockquote>
      <blockquote><h3>Spirit</h3><p><strong>Armor Class</strong> 14</p><p><strong>Hit Points</strong> 30</p><h4>Attack</h4><p>Hit: 1d6 damage.</p></blockquote></section>`);
    const result = prepareStdsSpells(html);
    expect(result.spells[0].ritual).toBe(true);
    expect(result.spells[0].castingTime).toBe("1 action or Ritual");
    expect(result.spells[0].text).toContain(
      "| Roll | Result |\n| --- | --- |\n| 1 | Cold _or_ fire |",
    );
    expect(result.spells[0].text).toContain("**Hit Points** 30");
    expect(result.spells[0].text).not.toContain("GM advice");
    expect(result.report.omittedAdvice[0].panels).toEqual([
      "GM advice that must not ship.",
    ]);
  });

  it("uses document order across page breaks instead of truncating a spell to its HTML section", () => {
    const html =
      page(`<div class="phb"><section>${heading("First")}<p>Beginning.</p></section><div class="pageNumber">99</div></div>
      <div class="phb"><p>Continued rules.</p><section>${heading("Second", "evocation cantrip")}<p>Separate rules.</p></section></div>`);
    const result = prepareStdsSpells(html);
    expect(result.spells[0].text).toBe("Beginning.\n\nContinued rules.");
    expect(result.spells[1].level).toBe(0);
    expect(result.spells[1].text).toBe("Separate rules.");
  });

  it("attaches exact named summon stat blocks even when their printed placement differs", () => {
    const html =
      page(`<section>${heading("Animal")}<p>It uses the Animal Spirit stat block.</p>
      <blockquote><h2>Animal Spirit</h2><p><em>Medium Beast</em></p><p>Armor Class 12. Hit Points 25.</p><p>Animal-only rules.</p></blockquote>
      <blockquote><h2>Golem Spirit</h2><p><em>Medium Construct</em></p><p>Armor Class 14. Hit Points 35.</p><p>Golem-only rules.</p></blockquote>
      ${heading("Golem")}<p>It uses the Golem Spirit stat block.</p>
      ${heading("Other")}<p>Unrelated rules.</p>
      <blockquote><h2>Corpse Puppet</h2><p><em>Medium Undead</em></p><p>Armor Class 13. Hit Points 15.</p><p>Puppet-only rules.</p></blockquote>
      ${heading("Puppets")}<p>Use the Corpse Puppet stat block below.</p></section>`);
    const result = prepareStdsSpells(html);
    const text = (name: string) =>
      result.spells.find((spell) => spell.name === name)!.text;
    expect(text("Animal")).toContain("Animal-only rules.");
    expect(text("Animal")).not.toContain("Golem-only rules.");
    expect(text("Golem")).toContain("Golem-only rules.");
    expect(text("Puppets")).toContain("Puppet-only rules.");
    expect(text("Other")).toBe("Unrelated rules.");
  });

  it("does not discard later spells nested beneath a stat block section by GM Binder", () => {
    const html =
      page(`<section>${heading("First")}<p>It uses the Spirit stat block.</p>
      <blockquote><section><h2>Spirit</h2><p><em>Medium Beast</em></p><p>Armor Class 12. Hit Points 20.</p>
      <section><h3>Actions</h3><p>Stat block action.</p><section>${heading("Later")}<p>Later spell rules.</p></section></section></section></blockquote></section>`);
    const result = prepareStdsSpells(html);
    expect(result.report.withheld).toEqual([]);
    expect(
      result.spells.find((spell) => spell.name === "First")!.text,
    ).toContain("Stat block action.");
    expect(
      result.spells.find((spell) => spell.name === "First")!.text,
    ).not.toContain("Later spell rules.");
    expect(result.spells.find((spell) => spell.name === "Later")!.text).toBe(
      "Later spell rules.",
    );
  });

  it("withholds incomplete display blocks and rejects missing publisher licensing evidence", () => {
    const html = page(
      `<section>${heading("Broken").replace("<li><strong>Range:</strong> 60 feet</li>", "")}<p>Rules.</p></section>`,
    );
    const result = prepareStdsSpells(html);
    expect(result.report.withheld).toEqual([
      { name: "Broken", reason: "Missing Range: Broken" },
    ]);
    expect(result.spells).toEqual([]);
    expect(() =>
      extractStdsSpells(
        html.replace(
          "Creative Commons Attribution 4.0 International",
          "All rights reserved",
        ),
      ),
    ).toThrow("licensing");
    expect(() =>
      extractStdsSpells("<html><body>No spells here.</body></html>"),
    ).toThrow("No spell");
  });
});
