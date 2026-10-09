// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from "vitest";
import {
  legacySpellDocument,
  recoverLegacySpellClasses,
  type LegacySpellClassSnapshot,
} from "../../src/compendium/open5eSpellClasses.ts";
import type { Open5eSpellRecord } from "../../src/compendium/open5eSpells.ts";

/** Build the fields read by class recovery, independently of spell projection. */
function record(over: Partial<Open5eSpellRecord> = {}): Open5eSpellRecord {
  return {
    key: "deepm_test",
    name: "Test",
    desc: "Original rules.\n\nNext paragraph.",
    classes: [],
    document: { key: "deepm" },
    ...over,
  } as Open5eSpellRecord;
}

/** Supply one complete legacy record from the matching document. */
function snapshot(): LegacySpellClassSnapshot {
  return {
    count: 1,
    next: null,
    results: [
      {
        slug: "test",
        name: "Test",
        desc: "Original rules. Next paragraph.",
        dnd_class: "Wizard, Ranger",
        document__slug: "dmag",
      },
    ],
  };
}

describe("legacy spell class recovery", () => {
  it("uses explicit source aliases", () => {
    expect(legacySpellDocument("deepm")).toBe("dmag");
    expect(legacySpellDocument("deepmx")).toBe("dmag-e");
    expect(legacySpellDocument("wz")).toBe("warlock");
    expect(legacySpellDocument("open5e")).toBe("o5e");
    expect(legacySpellDocument("toh")).toBe("toh");
  });

  it("accepts whitespace-only prose differences without mutating input", () => {
    const modern = record();
    const before = JSON.stringify(modern);
    expect(
      recoverLegacySpellClasses([modern], "deepm", snapshot()).get(modern.key),
    ).toEqual(["Wizard", "Ranger"]);
    expect(JSON.stringify(modern)).toBe(before);
  });

  it.each([
    { key: "deepm_other" },
    { key: "another_test" },
    { name: "Different name" },
    { desc: "Changed spell mechanics." },
    { document: { key: "other" } },
    { classes: [{ name: "Bard" }] },
  ])(
    "does not recover from a mismatched or already-populated record: %j",
    (over) => {
      expect(
        recoverLegacySpellClasses([record(over)], "deepm", snapshot()).size,
      ).toBe(0);
    },
  );

  it("leaves missing class lists missing", () => {
    const legacy = snapshot();
    legacy.results[0].dnd_class = "";
    expect(recoverLegacySpellClasses([record()], "deepm", legacy).size).toBe(0);
    expect(recoverLegacySpellClasses([record()], "deepm").size).toBe(0);
  });

  it("rejects incomplete pagination and duplicate keys", () => {
    expect(() =>
      recoverLegacySpellClasses([record()], "deepm", {
        ...snapshot(),
        count: 2,
      }),
    ).toThrow("Incomplete");
    expect(() =>
      recoverLegacySpellClasses([record()], "deepm", {
        ...snapshot(),
        next: "https://api.open5e.com/v1/spells/?page=2",
      }),
    ).toThrow("Incomplete");
    const legacy = snapshot();
    legacy.results.push(legacy.results[0]);
    legacy.count = 2;
    expect(() =>
      recoverLegacySpellClasses([record()], "deepm", legacy),
    ).toThrow("duplicate");
  });

  it("rejects another source even when its name, ID, and rules match", () => {
    const legacy = snapshot();
    legacy.results[0].document__slug = "wotc-srd";
    expect(() =>
      recoverLegacySpellClasses([record()], "deepm", legacy),
    ).toThrow("Mixed");
  });
});
