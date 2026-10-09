// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it, vi } from "vitest";
import {
  assertSpellSnapshot,
  fetchSpellSnapshot,
  mapOpen5eSpell,
  prepareOpen5eSpells,
  spellDocument,
  thirdPartySpellDocuments,
  type Open5eSpellDocument,
  type Open5eSpellRecord,
  type Open5eSpellSnapshot,
} from "../../src/compendium/open5eSpells.ts";

/** Build API metadata for a third-party source. */
function document(key = "test"): Open5eSpellDocument {
  return {
    key,
    name: "Test Book",
    type: "SOURCE",
    publisher: { key: "publisher", name: "Publisher" },
    gamesystem: { key: "5e-2014", name: "5th Edition 2014" },
    licenses: [{ key: "ogl-10a", name: "OGL" }],
  };
}

/** Build a spell whose body and structured mechanics must remain distinct. */
function record(overrides: Partial<Open5eSpellRecord> = {}): Open5eSpellRecord {
  return {
    key: "test_fire",
    document: { key: "test" },
    name: "Fire",
    level: 1,
    school: { name: "Evocation" },
    classes: [{ name: "Wizard" }],
    casting_time: "action",
    range_text: "60 feet",
    duration: "Instantaneous",
    concentration: false,
    ritual: false,
    verbal: true,
    somatic: true,
    material: false,
    desc: "The target takes **2d6 fire damage**.\n\nA later effect requires a save.",
    higher_level: "The damage increases by 1d6.",
    casting_options: [{ damage_roll: "2d6" }],
    ...overrides,
  };
}

/** Build a reproducible raw cache for source-selection tests. */
function snapshot(records = [record()]): Open5eSpellSnapshot {
  return {
    documents: [document()],
    records,
    fetchedAt: "2026-10-08T00:00:00Z",
  };
}

describe("Open5e spell mapping", () => {
  it("uses namespaced stable API keys, preserves prose, and does not guess mechanics", () => {
    const original = record();
    const before = JSON.stringify(original);
    const spell = mapOpen5eSpell(original, document());
    expect(spell).toMatchObject({
      id: "publisher-test:fire",
      source: "publisher-test",
      edition: "5.0",
      name: "Fire",
      level: 1,
      school: "Evocation",
      classes: ["Wizard"],
      range: "60 feet",
    });
    expect(spell.text).toBe(
      `${original.desc}\n\n**At Higher Levels.** ${original.higher_level}`,
    );
    expect(spell.mechanics).toBeUndefined();
    expect(JSON.stringify(original)).toBe(before);
    expect(
      mapOpen5eSpell({ ...original, name: "Renamed" }, document()).id,
    ).toBe(spell.id);
  });

  it("retains reaction conditions, rituals, materials, and concentration display semantics", () => {
    const spell = mapOpen5eSpell(
      record({
        casting_time: "reaction",
        reaction_condition: "when a creature hits you",
        ritual: true,
        concentration: true,
        duration: "Concentration, up to 1 minute",
        material: true,
        material_specified: "a pearl worth 100 gp",
      }),
      document(),
    );
    expect(spell.castingTime).toBe(
      "reaction (when a creature hits you) or Ritual",
    );
    expect(spell.duration).toBe("up to 1 minute");
    expect(spell.components).toEqual({
      verbal: true,
      somatic: true,
      material: true,
      materials: "a pearl worth 100 gp",
    });
    expect(
      mapOpen5eSpell(
        record({ concentration: true, duration: "6 rounds" }),
        document(),
      ).duration,
    ).toBe("up to 6 rounds");
  });

  it("does not fabricate materials, class assignments, or A5E editions", () => {
    const original = record({
      material: true,
      material_specified: "",
      classes: [],
    });
    const metadata = {
      ...document(),
      gamesystem: { key: "a5e", name: "Advanced 5th Edition" },
    };
    const spell = mapOpen5eSpell(original, metadata);
    expect(spell.components.materials).toBeUndefined();
    expect(spell.classes).toBeUndefined();
    expect(spell.edition).toBeUndefined();
    expect(() =>
      prepareOpen5eSpells(
        { ...snapshot([original]), documents: [metadata] },
        "test",
      ),
    ).toThrow("Unsupported");
    const result = prepareOpen5eSpells(snapshot([original]), "test");
    expect(result.report.validation.warns).toBe(1);
    expect(result.report.fidelity).toHaveLength(2);
  });

  it("withholds missing fields, excludes reserved names, and keeps publishing blocked", () => {
    const result = prepareOpen5eSpells(
      snapshot([
        record(),
        record({ key: "test_missing", range_text: "" }),
        record({ key: "test_reserved", name: "Tasha’s Test" }),
      ]),
      "test",
    );
    expect(result.report).toMatchObject({
      rawCount: 3,
      keptCount: 1,
      publishable: false,
      exclusionsReviewed: false,
      preferredLicense: "ogl-10a",
    });
    expect(result.report.withheld[0].reason).toContain("range_text");
    expect(result.report.excluded).toHaveLength(1);
    expect(result.report.validation.errors).toBe(0);
    const cc = {
      ...document(),
      licenses: [
        { key: "ogl-10a", name: "OGL" },
        { key: "cc-by-40", name: "CC-BY" },
      ],
    };
    expect(
      prepareOpen5eSpells({ ...snapshot(), documents: [cc] }, "test").report
        .preferredLicense,
    ).toBe("cc-by-40");
  });

  it.each([
    { level: 10 },
    { level: -1 },
    { level: 1.5 },
    { school: { name: "" } },
    { classes: [{ name: "" }] },
    { desc: "" },
    { concentration: undefined },
    { material: undefined },
  ])("refuses to map incomplete display data: %j", (change) => {
    expect(() =>
      mapOpen5eSpell(record(change as Partial<Open5eSpellRecord>), document()),
    ).toThrow("Unmappable");
  });
});

describe("Open5e spell snapshots", () => {
  it("recovers legacy classes without changing the raw snapshot or adding mechanics", () => {
    const original = snapshot([record({ classes: [] })]);
    const before = JSON.stringify(original);
    const result = prepareOpen5eSpells(original, "test", {
      count: 1,
      next: null,
      results: [
        {
          slug: "fire",
          name: original.records[0].name,
          desc: original.records[0].desc,
          dnd_class: "Wizard, Sorcerer",
          document__slug: "test",
        },
      ],
    });
    expect(result.spells[0].classes).toEqual(["Wizard", "Sorcerer"]);
    expect(result.spells[0].mechanics).toBeUndefined();
    expect(JSON.stringify(original)).toBe(before);
    expect(result.report.classRecovery).toEqual([
      {
        key: "test_fire",
        classes: ["Wizard", "Sorcerer"],
      },
    ]);
    expect(
      result.report.fidelity.some(
        (entry) =>
          entry.message === "No class assignments supplied by the API.",
      ),
    ).toBe(false);
  });

  it("selects all third-party 5e books, including Black Flag, but excludes A5E and core SRDs", () => {
    const keys = [
      "deepm",
      "deepmx",
      "vom",
      "wz",
      "bfrd",
      "toh",
      "kp",
      "open5e",
    ];
    const documents = [
      ...keys.map((key) => document(key)),
      document("srd-2014"),
      {
        ...document("srd-2024"),
        gamesystem: { key: "5e-2024", name: "5e 2024" },
      },
      { ...document("a5e-ag"), gamesystem: { key: "a5e", name: "A5E" } },
      { ...document("other"), gamesystem: { key: "other", name: "Other" } },
    ];
    const selected = thirdPartySpellDocuments({ ...snapshot([]), documents });
    expect(selected.map((entry) => entry.key)).toEqual(keys);
    expect(() =>
      spellDocument({ ...snapshot([]), documents }, "a5e-ag"),
    ).toThrow("Unsupported");
  });

  it("rejects duplicate keys and source metadata, unmatched records, and unsafe document names", () => {
    expect(() => assertSpellSnapshot(snapshot([record(), record()]))).toThrow(
      "duplicate",
    );
    expect(() =>
      assertSpellSnapshot({
        ...snapshot(),
        documents: [document(), document()],
      }),
    ).toThrow("duplicate");
    expect(() =>
      assertSpellSnapshot(snapshot([record({ document: { key: "other" } })])),
    ).toThrow("unmatched");
    expect(() =>
      assertSpellSnapshot(snapshot([record({ key: "other_fire" })])),
    ).toThrow("unmatched");
    expect(() =>
      assertSpellSnapshot({
        ...snapshot(),
        documents: [document("../console")],
      }),
    ).toThrow("metadata");
    for (const key of [
      "toString",
      "../console",
      "srd-2024",
      "srd-2014",
      "spells-that-dont-suck",
    ]) {
      expect(() =>
        spellDocument({ ...snapshot(), documents: [document(key)] }, key),
      ).toThrow("Unsupported");
    }
  });

  it("follows complete pagination and selects the exact document", async () => {
    const fetchJson = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockResolvedValueOnce({
        count: 2,
        next: "/v2/spells/?page=2",
        results: [record()],
      })
      .mockResolvedValueOnce({
        count: 2,
        next: null,
        results: [record({ key: "test_second" })],
      });
    const result = await fetchSpellSnapshot(fetchJson, "test");
    expect(result.records).toHaveLength(2);
    expect(fetchJson.mock.calls[1][0]).toContain("document__key=test");
    expect(fetchJson.mock.calls[2][0]).toContain("format=json");
  });

  it("never requests or caches excluded sources, even when downloading all sources", async () => {
    const fetchJson = vi.fn(async (url: string) => {
      const parsed = new URL(url);
      if (parsed.pathname === "/v2/documents/")
        return {
          count: 7,
          next: null,
          results: [
            document(),
            document("second"),
            document("srd-2014"),
            document("srd-2024"),
            document("spells-that-dont-suck"),
            { ...document("a5e-ag"), gamesystem: { key: "a5e", name: "A5E" } },
            { ...document("core"), type: "MISC" },
          ],
        };
      const key = parsed.searchParams.get("document__key");
      expect(["test", "second"]).toContain(key);
      return {
        count: 1,
        next: null,
        results: [record({ key: `${key}_fire`, document: { key: key! } })],
      };
    });
    const result = await fetchSpellSnapshot(fetchJson);
    expect(result.documents.map((entry) => entry.key)).toEqual([
      "test",
      "second",
    ]);
    expect(result.records.map((entry) => entry.document.key)).toEqual([
      "test",
      "second",
    ]);
    expect(fetchJson).toHaveBeenCalledTimes(3);
  });

  it.each(["srd-2014", "srd-2024", "spells-that-dont-suck"])(
    "refuses %s before making any spell request",
    async (key) => {
      const fetchJson = vi
        .fn()
        .mockResolvedValue({ count: 1, next: null, results: [document(key)] });
      await expect(fetchSpellSnapshot(fetchJson, key)).rejects.toThrow(
        "Unsupported spell source",
      );
      expect(fetchJson).toHaveBeenCalledTimes(1);
    },
  );

  it("rejects pagination that changes the document filter or responses from another source", async () => {
    const changed = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockResolvedValueOnce({
        count: 2,
        next: "/v2/spells/?document__key=srd-2014&page=2",
        results: [record()],
      });
    await expect(fetchSpellSnapshot(changed)).rejects.toThrow(
      "Document filter changed",
    );
    expect(changed).toHaveBeenCalledTimes(2);
    const mixed = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockResolvedValueOnce({
        count: 1,
        next: null,
        results: [record({ document: { key: "srd-2014" } })],
      });
    await expect(fetchSpellSnapshot(mixed)).rejects.toThrow(
      "Mixed spell documents",
    );
  });

  it("rejects foreign pagination, cycles, incomplete counts, and count drift", async () => {
    for (const next of ["https://example.com/v2/spells/", "/v2/creatures/"]) {
      const fetchJson = vi
        .fn()
        .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
        .mockResolvedValueOnce({ count: 2, next, results: [record()] });
      await expect(fetchSpellSnapshot(fetchJson)).rejects.toThrow(
        "Unexpected pagination",
      );
    }
    const cycle = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockImplementation(async (url) => ({
        count: 2,
        next: url,
        results: [record()],
      }));
    await expect(fetchSpellSnapshot(cycle)).rejects.toThrow("cycle");
    const incomplete = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockResolvedValueOnce({ count: 2, next: null, results: [record()] });
    await expect(fetchSpellSnapshot(incomplete)).rejects.toThrow("Incomplete");
    const drift = vi
      .fn()
      .mockResolvedValueOnce({ count: 1, next: null, results: [document()] })
      .mockResolvedValueOnce({
        count: 2,
        next: "/v2/spells/?page=2",
        results: [record()],
      })
      .mockResolvedValueOnce({
        count: 3,
        next: null,
        results: [record({ key: "test_second" })],
      });
    await expect(fetchSpellSnapshot(drift)).rejects.toThrow("Count changed");
  });
});
