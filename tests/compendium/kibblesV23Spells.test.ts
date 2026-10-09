// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  prepareKibblesV23Spells,
  type KibblesV23Snapshot,
} from "../../src/compendium/kibblesV23Spells.ts";

/** Build an extractor-shaped fixture with the verified newer mechanics and physical PDF provenance. */
function snapshot(): KibblesV23Snapshot {
  return {
    version: "2.3",
    scope: "all-spells",
    detectedHeaders: 295,
    pdfPages: 86,
    sha256: "a".repeat(64),
    licenseEvidence:
      "Kibbles’ Casting Compendium by KibblesTasty Homebrew LLC. Spell text: CC-BY-4.0. No art included.",
    blocks: Array.from({ length: 295 }, (_, index) => ({
      name:
        index === 0
          ? "Become Stone"
          : index === 1
            ? "Crashing Wave"
            : `Fixture Spell ${index}`,
      sourcePage: (index % 86) + 1,
      header: "2nd-level transmutation (arcane, primal)",
      fields: {
        Classes: "Druid, Spellblade, Wizard",
        "Casting Time": "1 action",
        Range: "Self",
        Components: "V, S",
        Duration: "1 round",
      },
      text:
        index === 0
          ? "You gain 15 temporary hit points."
          : index === 1
            ? "A 15-foot cone increases to a 30 foot cone with displaced water."
            : "Conditional advantage stays prose.",
      removedAdvice: [],
    })),
  };
}

describe("Kibbles v2.3 full collection", () => {
  it("preserves PDF values and does not fold in the ancestry document or infer rollable fields", () => {
    const input = snapshot();
    const original = JSON.stringify(input);
    const { spells, report } = prepareKibblesV23Spells(input);
    expect(spells).toHaveLength(295);
    expect(spells.find((spell) => spell.name === "Become Stone")?.text).toBe(
      "You gain 15 temporary hit points.",
    );
    expect(
      spells.find((spell) => spell.name === "Crashing Wave")?.text,
    ).toContain("15-foot cone");
    expect(spells[0].source).toBe("kibblestasty-casting-compendium-v2.3");
    expect(spells[0].sourcePage).toBe(1);
    expect(spells.every((spell) => !spell.mechanics && !spell.edition)).toBe(
      true,
    );
    expect(report.scope).toBe("all-spells");
    expect(report.publishable).toBe(false);
    expect(report.validation.errors).toBe(0);
    expect(JSON.stringify(input)).toBe(original);
  });

  it("rejects version, scope, count, license, hash, and page drift", () => {
    for (const change of [
      { version: "2.0" },
      { scope: "eleven-elemental-spells" },
      { blocks: snapshot().blocks.slice(1) },
      { licenseEvidence: "All rights reserved" },
      { sha256: "bad" },
      { pdfPages: 0 },
    ]) {
      expect(() =>
        prepareKibblesV23Spells({ ...snapshot(), ...change }),
      ).toThrow("snapshot");
    }
    const input = snapshot();
    input.blocks[0].sourcePage = 87;
    expect(() => prepareKibblesV23Spells(input)).toThrow("provenance");
  });

  it("reports duplicate IDs and rejects potentially reserved names", () => {
    const duplicate = snapshot();
    duplicate.blocks[1] = { ...duplicate.blocks[0] };
    expect(prepareKibblesV23Spells(duplicate).report.validation.errors).toBe(1);
    const input = snapshot();
    input.blocks[0].text = "A Beholder appears.";
    expect(prepareKibblesV23Spells(input).report.withheld[0].reason).toContain(
      "reserved",
    );
  });

  it("preserves psionic display fields, compound ritual tags, and missing class assignments", () => {
    const input = snapshot();
    input.blocks[2].header = "1st-level psionic";
    delete input.blocks[2].fields.Classes;
    input.blocks[3].header = "1st-level divination (blood magic, ritual)";
    const result = prepareKibblesV23Spells(input);
    const psionic = result.spells.find(
      (spell) => spell.name === "Fixture Spell 2",
    )!;
    expect(psionic.school).toBe("Psionic");
    expect(psionic.classes).toBeUndefined();
    expect(
      result.report.fidelity.filter((finding) => finding.name === psionic.name),
    ).toHaveLength(2);
    expect(
      result.spells.find((spell) => spell.name === "Fixture Spell 3")?.ritual,
    ).toBe(true);
  });

  it("retains separately credited items and withholds unknown credit chains", () => {
    const input = snapshot();
    input.blocks[2].creditedSource = "So Many Spells";
    input.blocks[2].creditEvidence = "Drawn from somanyrobots’ So Many Spells.";
    input.blocks[3].creditedSource = "Unknown source";
    input.blocks[4].extractionIssues = ["Unresolved source boundary"];
    const result = prepareKibblesV23Spells(input);
    expect(result.report.separatelyCredited).toHaveLength(2);
    expect(result.report.withheld).toHaveLength(2);
    expect(result.spells).toHaveLength(293);
  });

  it("replays the full collection offline and keeps publication blocked", () => {
    const dir = mkdtempSync(join(tmpdir(), "openfray-kibbles-v23-"));
    try {
      const input = join(dir, "snapshot.json");
      writeFileSync(input, JSON.stringify(snapshot()));
      const script = fileURLToPath(
        new URL("../../scripts/prepare-kibbles-v23-spells.ts", import.meta.url),
      );
      const result = spawnSync(process.execPath, [script, input], {
        cwd: dir,
        encoding: "utf8",
      });
      expect(result.status, result.stderr).toBe(0);
      const report = JSON.parse(
        readFileSync(
          join(dir, "output/kibbles-casting-v23-preparation/report.json"),
          "utf8",
        ),
      );
      expect(report).toMatchObject({
        keptCount: 295,
        version: "2.3",
        scope: "all-spells",
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
