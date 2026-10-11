// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from "vitest";
import {
  WARLOCK_CONTENT_BOUNDARIES,
  WARLOCK_EXCLUDED_SPELLS,
  omitWarlockExcludedRanges,
  prepareWarlockContentBoundaries,
  type WarlockSourceEntry,
} from "../../src/compendium/warlockContentBoundaries.ts";

describe("Warlock content boundaries", () => {
  it("accounts for the original 43 IDs with 35 reviewed, three withheld, and five excluded", () => {
    const ids = [...WARLOCK_CONTENT_BOUNDARIES, ...WARLOCK_EXCLUDED_SPELLS].map(
      (entry) => entry.id,
    );
    expect(ids).toHaveLength(43);
    expect(new Set(ids).size).toBe(43);
    expect(
      WARLOCK_CONTENT_BOUNDARIES.filter((entry) => entry.status === "reviewed"),
    ).toHaveLength(35);
    expect(
      WARLOCK_CONTENT_BOUNDARIES.filter(
        (entry) => entry.status === "withheld",
      ).map((entry) => entry.id),
    ).toEqual([
      "kobold-press-wz:reassemble",
      "kobold-press-wz:skull-road",
      "kobold-press-wz:summon-clockwork-beast",
    ]);
  });

  it("keeps source grants separate and binds every finding to printed pages and content", () => {
    const counts = {
      "grimoire-1": 0,
      "grimoire-2": 0,
      "grimoire-3": 0,
      liminal: 0,
    };
    for (const finding of WARLOCK_CONTENT_BOUNDARIES) {
      counts[finding.source]++;
      expect(finding.entrySha256).toMatch(/^[a-f0-9]{64}$/);
      expect(finding.printedPages.length).toBeGreaterThan(0);
      expect(finding.boundaryNotes.length).toBeGreaterThan(0);
    }
    expect(counts).toEqual({
      "grimoire-1": 10,
      "grimoire-2": 6,
      "grimoire-3": 9,
      liminal: 13,
    });
  });

  it("removes only the selected ranges, retaining intervening rules and numeric requirements", () => {
    const text = "Lore. Roll 6d6. Setting. Save DC 16.";
    expect(
      omitWarlockExcludedRanges(text, [
        { start: 0, end: 6, reason: "nonmechanical-preface" },
        { start: 16, end: 25, reason: "setting-lore" },
      ]),
    ).toBe("Roll 6d6. Save DC 16.");
    expect(omitWarlockExcludedRanges(text, [])).toBe(text);
  });

  it("rejects unsafe omission ranges", () => {
    const cases = [
      [{ start: -1, end: 2, reason: "test" }],
      [{ start: 0, end: 99, reason: "test" }],
      [{ start: 2, end: 2, reason: "test" }],
      [{ start: 0.5, end: 2, reason: "test" }],
      [
        { start: 2, end: 4, reason: "test" },
        { start: 1, end: 3, reason: "test" },
      ],
    ];
    for (const ranges of cases)
      expect(() => omitWarlockExcludedRanges("Rules", ranges)).toThrow(
        "Invalid Warlock omission range",
      );
  });

  it("rejects missing source evidence", () => {
    expect(() => prepareWarlockContentBoundaries([])).toThrow(
      "Incomplete Warlock boundary input",
    );
  });

  it("rejects unresolved or unknown spells before releasing any text", () => {
    const entry: WarlockSourceEntry = {
      id: WARLOCK_EXCLUDED_SPELLS[0].id,
      source: "liminal",
      printedPages: [1],
      text: "Synthetic source text",
    };
    expect(() => prepareWarlockContentBoundaries([entry])).toThrow(
      "Unreviewed Warlock entry",
    );
  });

  it("rejects changed source text, swapped source books, and changed page boundaries", () => {
    const finding = WARLOCK_CONTENT_BOUNDARIES[0];
    const entry: WarlockSourceEntry = {
      id: finding.id,
      source: finding.source,
      printedPages: finding.printedPages,
      text: "Synthetic source text",
    };
    for (const changed of [
      entry,
      { ...entry, source: "liminal" as const },
      { ...entry, printedPages: [999] },
    ])
      expect(() => prepareWarlockContentBoundaries([changed])).toThrow(
        "Warlock source boundary changed",
      );
  });
});
