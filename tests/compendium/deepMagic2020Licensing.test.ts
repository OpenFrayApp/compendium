// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it } from "vitest";
import type { Spell } from "../../src/schema/spell.ts";
import {
  DEEP_MAGIC_2020_LICENSE_FINDINGS,
  reviewDeepMagic2020Licensing,
} from "../../src/compendium/deepMagic2020Licensing.ts";

const spell: Spell = {
  id: "kobold-press-deepm:example",
  source: "kobold-press-deepm",
  name: "Example",
  level: 1,
  school: "Evocation",
  castingTime: "action",
  range: "30 feet",
  duration: "instantaneous",
  concentration: false,
  ritual: false,
  components: { verbal: true, somatic: true, material: false },
  text: "You deal fire damage.",
};

it("records the accepted provenance basis without granting publication approval", () => {
  const before = JSON.stringify(spell);
  const report = reviewDeepMagic2020Licensing([spell]);
  expect(report.selectionBasis).toBe(
    "accepted-open5e-subset-under-2020-publisher-grant",
  );
  expect(report.selectionCount).toBe(1);
  expect(report.exceptions).toEqual([]);
  expect(report.publishable).toBe(false);
  expect(report.approvedCount).toBe(0);
  expect(report.requiredAttribution).toContain("35-notice Section 15");
  expect(JSON.stringify(spell)).toBe(before);
});

it("flags specific names without treating all possessive titles as protected", () => {
  const report = reviewDeepMagic2020Licensing([
    { ...spell, name: "Althea’s Travel Tent" },
    { ...spell, id: "kobold-press-deepm:other", name: "Ancestor’s Strength" },
  ]);
  expect(report.exceptions).toHaveLength(1);
  expect(report.exceptions[0].namedReferences).toEqual(["Althea"]);
  expect(report.exceptions[0].status).toBe("pending-targeted-exception-review");
});

it.each([
  "short-term madness",
  "short‑term madness",
  "long-term madness",
  "indefinite madness",
])("retains the supporting-rule lead for %s", (text) => {
  expect(
    reviewDeepMagic2020Licensing([{ ...spell, text }]).exceptions[0]
      .supportingRules,
  ).toEqual(["Madness"]);
});

it("reports combined dependencies without confusing ley-line flavor with a rule dependency", () => {
  const report = reviewDeepMagic2020Licensing([
    {
      ...spell,
      text: "Gain Void taint, a flesh warp, and short-term madness.",
    },
    {
      ...spell,
      id: "kobold-press-deepm:other",
      text: "Harness fire contained in ley lines.",
    },
  ]);
  expect(report.exceptions).toHaveLength(1);
  expect(report.exceptions[0].supportingRules).toEqual([
    "Void taint",
    "Flesh warping",
    "Madness",
  ]);
});

it("retains a reviewed supporting-rule reference only when its identity and text are unchanged", () => {
  const reviewed = {
    ...spell,
    id: "kobold-press-deepm:warp-mind-and-matter",
    name: "Warp Mind and Matter",
    text: "A creature you can see within range undergoes a baleful transmogrification. The target must make a successful Wisdom saving throw or suffer a flesh warp and be afflicted with a form of indefinite madness.",
  };
  const report = reviewDeepMagic2020Licensing([reviewed]);
  expect(Object.keys(DEEP_MAGIC_2020_LICENSE_FINDINGS)).toHaveLength(17);
  expect(report.pendingExceptionCount).toBe(0);
  expect(report.exceptions[0].status).toBe(
    "reviewed-under-accepted-selection-basis",
  );
  expect(report.exceptions[0].supportingRules).toEqual([
    "Flesh warping",
    "Madness",
  ]);
  expect(report.exceptions[0].physicalPages).toEqual([343]);
  expect(report.publishable).toBe(false);
  expect(report.approvedCount).toBe(0);
  for (const changed of [
    { ...reviewed, text: "A changed effect with no remaining keywords." },
    { ...reviewed, name: "Changed name" },
  ]) {
    expect(reviewDeepMagic2020Licensing([changed]).pendingExceptionCount).toBe(
      1,
    );
  }
});

it("keeps new custom-rule flags pending instead of clearing them by selection alone", () => {
  const report = reviewDeepMagic2020Licensing([
    { ...spell, text: "Use a Ritual Focus for group spellcasting." },
  ]);
  expect(report.pendingExceptionCount).toBe(1);
  expect(report.exceptions[0].supportingRules).toEqual(["Custom ritual rules"]);
});

it("rejects foreign sources and duplicate identities", () => {
  expect(() =>
    reviewDeepMagic2020Licensing([{ ...spell, source: "other" }]),
  ).toThrow("scope changed");
  expect(() => reviewDeepMagic2020Licensing([spell, spell])).toThrow(
    "scope changed",
  );
});
