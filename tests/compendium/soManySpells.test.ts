// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { prepareSoManySpells } from "../../src/compendium/soManySpells.ts";
import { prepareStdsSpells } from "../../src/compendium/spellsThatDontSuck.ts";

/** Build creator-licensed source HTML with specialized schools and non-SRD classes. */
function source(header = "4th-level necromancy (shadow magic)"): string {
  return `<section><h4>Test Spell</h4><p><em>${header}</em></p><hr><ul>
    <li><strong>Classes:</strong> Necromancer, Occultist, Wizard</li><li><strong>Casting Time:</strong> 1 action</li>
    <li><strong>Range:</strong> 60 feet</li><li><strong>Components:</strong> V, S</li><li><strong>Duration:</strong> 1 minute</li>
    </ul><p>If the target is in shadow, the next attack has advantage.</p></section>
    <section><h2>Credits &amp; References</h2><p>So Many Spells by somanyrobots. Creative Commons Attribution 4.0 International.</p>
    <p>System Reference Document 5.1 by Wizards of the Coast LLC.</p><p>Omega Ankh and KibblesTasty credited in Spells That Don’t Suck.</p></section>`;
}

describe("So Many Spells direct source", () => {
  it.each([
    "4th-level necromancy (shadow magic)",
    "abjuration cantrip (ferromancy)",
    "5th-level transmutation (blood magic)",
  ])("preserves custom metadata and prose: %s", (header) => {
    const result = prepareSoManySpells(source(header));
    expect(result.spells).toHaveLength(1);
    expect(result.spells[0].classes).toEqual([
      "Necromancer",
      "Occultist",
      "Wizard",
    ]);
    expect(result.spells[0].text).toBe(
      "If the target is in shadow, the next attack has advantage.",
    );
    expect(result.spells[0].mechanics).toBeUndefined();
    expect(result.spells[0].edition).toBeUndefined();
    expect(result.report.specializations).toEqual([
      { name: "Test Spell", header },
    ]);
    expect(result.report.source).toBe("somanyrobots-so-many-spells");
    expect(result.report.publishable).toBe(false);
    expect(result.report.validation.errors).toBe(0);
  });

  it("keeps same-name spells independent and verifies the document’s distinct creator credits", () => {
    const html = source();
    expect(prepareSoManySpells(html).spells[0].id).not.toBe(
      prepareStdsSpells(html).spells[0].id,
    );
    expect(() =>
      prepareSoManySpells(
        html.replace("Wizards of the Coast LLC", "Other publisher"),
      ),
    ).toThrow("licensing");
    expect(prepareSoManySpells(html).report.attribution).toContain(
      "System Reference Document 5.1",
    );
  });

  it("withholds potentially reserved creature names even when a third-party document declares CC-BY", () => {
    const html = source().replace(
      "If the target is in shadow, the next attack has advantage.",
      "The summoned creature can take the Vargouille option.",
    );
    const result = prepareSoManySpells(html);
    expect(result.spells).toEqual([]);
    expect(result.report.withheld[0].reason).toContain("Vargouille");
    expect(result.blocks[0].text).toContain("Vargouille");
  });

  it("supports offline CLI replay and keeps the publishing gate closed", () => {
    const dir = mkdtempSync(join(tmpdir(), "openfray-so-many-spells-"));
    try {
      const input = join(dir, "source.html");
      writeFileSync(input, source());
      const script = fileURLToPath(
        new URL("../../scripts/prepare-so-many-spells.ts", import.meta.url),
      );
      const prepared = spawnSync(process.execPath, [script, input], {
        cwd: dir,
        encoding: "utf8",
      });
      expect(prepared.status, prepared.stderr).toBe(0);
      const report = JSON.parse(
        readFileSync(
          join(dir, "output/so-many-spells-preparation/report.json"),
          "utf8",
        ),
      );
      expect(report).toMatchObject({
        keptCount: 1,
        source: "somanyrobots-so-many-spells",
        input: "offline",
        publishable: false,
      });
      const strict = spawnSync(process.execPath, [script, input, "--strict"], {
        cwd: dir,
        encoding: "utf8",
      });
      expect(strict.status, strict.stderr).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
