// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it } from "vitest";
import type { Spell } from "../../src/schema/spell.ts";
import {
  compareWarlockGrimoireSpell,
  reviewWarlockGrimoire,
} from "../../src/compendium/warlockGrimoireReview.ts";

const spell: Spell = {
  id: "kobold-press-wz:eternal-echo",
  source: "kobold-press-wz",
  edition: "5.0",
  name: "Eternal Echo",
  level: 3,
  school: "Necromancy",
  castingTime: "action",
  range: "60 feet",
  duration: "special",
  concentration: false,
  ritual: false,
  components: { verbal: true, somatic: false, material: false },
  text: "The target takes a -4 penalty. It makes a saving throw.",
};
const echo =
  "63 ETERNAL ECHO 3rd-level necromancy Casting Time: 1 action Range: 60 feet Components: V Duration: Concentration The target takes a −4 penalty. It makes a saving throw. REASSEMBLE 5th-level necromancy";

it("reports concentration without changing the draft, approving it, or inventing a numeric duration", () => {
  const before = JSON.stringify(spell);
  const result = compareWarlockGrimoireSpell(spell, echo);
  expect(result.approved).toBe(false);
  expect(result.printedPages).toEqual([63]);
  expect(result.headerDifferences).toEqual([
    { field: "concentration", draft: false, book: true },
  ]);
  expect(result.bodyComparison.status).toBe("normalized-match");
  expect(result.classEvidence).toBe("contextual-class-review-required");
  expect(JSON.stringify(spell)).toBe(before);
});

it("does not equate changed saving throws, lost words, or changed numeric signs", () => {
  for (const text of [
    "The target takes a -4 penalty.",
    "The target takes a +4 penalty. It makes a saving throw.",
    "The target takes a -4 penalty. It makes an ability check.",
  ])
    expect(
      compareWarlockGrimoireSpell({ ...spell, text }, echo).bodyComparison
        .status,
    ).toBe("difference");
});

it("ignores typography and Markdown without losing word order", () => {
  expect(
    compareWarlockGrimoireSpell(
      {
        ...spell,
        text: "The target takes a -4 penalty. **It makes a saving throw.**",
      },
      echo,
    ).bodyComparison.status,
  ).toBe("normalized-match");
});

it.each([
  ["missing page", echo.replace("63 ", "64 ")],
  ["duplicate page", echo + "\n\n63 Duplicate"],
  ["changed heading", echo.replace("ETERNAL ECHO", "Eternal Echo")],
  [
    "mention without header",
    echo.replace(
      "ETERNAL ECHO 3rd-level necromancy",
      "ETERNAL ECHO is known here",
    ),
  ],
  ["missing boundary", echo.replace("REASSEMBLE", "OTHER HEADING")],
  ["duplicate boundary", echo + " REASSEMBLE"],
  [
    "changed source duration",
    echo.replace("Duration: Concentration", "Duration: 1 hour"),
  ],
])("rejects incomplete or ambiguous entry evidence: %s", (_label, content) => {
  expect(() => compareWarlockGrimoireSpell(spell, content)).toThrow();
});

it("rejects an unreviewed ID even when its title appears in narrative text", () => {
  expect(() =>
    compareWarlockGrimoireSpell(
      { ...spell, id: "kobold-press-wz:rive", name: "Rive" },
      "63 The River carries spells.",
    ),
  ).toThrow("No reviewed Grimoire entry");
});

it("reports omitted materials and stops before adjacent setting prose", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:vagrants-nondescript-cloak",
    name: "Vagrant's Nondescript Cloak",
    level: 2,
    school: "Abjuration",
    range: "Touch",
    duration: "1 hour",
    components: { verbal: true, somatic: true, material: true },
    text: "The target is warded.",
  };
  const source =
    "229 VAGRANT’S NONDESCRIPT CLOAK 2nd-level abjuration Casting Time: 1 action Range: Touch Components: V, S, M (a harmless test component) Duration: 1 hour The target is warded. Story Seeds Setting prose excluded.";
  const result = compareWarlockGrimoireSpell(candidate, source);
  expect(result.headerDifferences).toEqual([
    {
      field: "components.materials",
      draft: null,
      book: "a harmless test component",
    },
  ]);
  expect(result.bodyComparison.status).toBe("normalized-match");
});

it("joins a continuation without including the following entry", () => {
  const candidate = {
    ...spell,
    id: "kobold-press-wz:reassemble",
    name: "Reassemble",
    level: 5,
    range: "Touch",
    castingTime: "1hour",
    duration: "instantaneous",
    text: "The target is healed. The penalty lasts.",
    components: { verbal: true, somatic: true, material: false },
  };
  const source =
    "63 REASSEMBLE 5th-level necromancy Casting Time: 1 hour Range: Touch Components: V, S Duration: Instantaneous The target is healed.\n\n64 The penalty lasts. SKULL ROAD 5th-level conjuration Unrelated rules.";
  expect(
    compareWarlockGrimoireSpell(candidate, source).bodyComparison.status,
  ).toBe("normalized-match");
});

it("preserves the second book’s unusual duration without imposing a fixed timer", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:storm-of-axes",
    name: "Storm of Axes",
    level: 4,
    school: "Conjuration",
    range: "25 feet",
    duration: "1 round",
    text: "The target takes damage.",
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materials: "a test handle",
    },
  };
  const source =
    "178 STORM OF AXES 4th-level conjuration (battle) Casting Time: 1 action Range: 25 feet Components: V, S, M (a test handle) Duration: concentration + 1 round The target takes damage. Dwarven Magical Items of the Cantons Setting prose.";
  const result = compareWarlockGrimoireSpell(candidate, source, 2);
  expect(result.grimoire).toBe(2);
  expect(result.headerDifferences).toEqual([
    { field: "duration", draft: "1 round", book: "concentration + 1 round" },
    { field: "concentration", draft: false, book: true },
  ]);
  expect(candidate.duration).toBe("1 round");
  expect(result.licensingReview.join(" ")).toContain(
    "fixed 1-round timer would change the rule",
  );
});

it("does not transfer first-volume coverage to the second volume", () => {
  expect(() => compareWarlockGrimoireSpell(spell, echo, 2)).toThrow(
    "No reviewed Grimoire entry",
  );
});

it("holds interleaved columns while parsing the explicitly printed primary school and ritual", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:summon-clockwork-beast",
    name: "Summon Clockwork Beast",
    level: 5,
    school: "Conjuration",
    castingTime: "10minutes or Ritual",
    range: "10 feet",
    duration: "1 hour",
    ritual: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materials: "a test gear",
    },
    text: "The beast appears.",
  };
  const source =
    "20 SUMMON CLOCKWORK BEAST 5th-level clockwork (conjuration) (ritual) Casting time: 10 minutes Range: 10 ft. Components: V, S, M (a test gear) Duration: 1 hour The beast appears. Unrelated feature inserted.\n\n21 The spell continues. CLOCKWORK BEAST Creature statistics.";
  const result = compareWarlockGrimoireSpell(candidate, source, 2);
  expect(result.approved).toBe(false);
  expect(result.headerDifferences).toEqual([]);
  expect(result.bodyComparison.status).toBe("manual-layout-review-required");
  expect(result.bodyComparison.firstDifference).toBeNull();
  expect(result.licensingReview.join(" ")).toContain(
    "verify designation identity",
  );
});

it("reports the actual Fortitude rule without converting it to a supported save", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:remove-insulation",
    name: "Remove Insulation",
    level: 4,
    range: "30 feet",
    duration: "8 hours",
    text: "The target makes a Fortitude saving throw.",
    components: { verbal: true, somatic: true, material: false },
  };
  const source =
    "165 REMOVE INSULATION 4th-level necromancy Casting Time: 1 action Range: 30 feet Components: V, S Duration: 8 hours The target makes a Fortitude saving throw.";
  const result = compareWarlockGrimoireSpell(candidate, source, 2);
  expect(result.bodyComparison.status).toBe("normalized-match");
  expect(result.licensingReview.join(" ")).toContain(
    "Do not silently convert it to Constitution",
  );
  expect(candidate.mechanics).toBeUndefined();
  expect(candidate.text).toContain("Fortitude");
});

it("joins the second-volume concentration spell and excludes the next entry", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:battle-chant",
    name: "Battle Chant",
    level: 2,
    school: "Enchantment",
    castingTime: "1minute or Ritual",
    range: "60 feet",
    duration: "5 minutes",
    ritual: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materials: "test incense",
    },
    text: "Allies gain damage. The chant continues.",
  };
  const source =
    "176 BATTLE CHANT 2nd-level enchantment (ritual) Casting Time: 1 minute Range: 60 feet Components: V, S, M (test incense) Duration: Concentration, up to 5 minutes Allies gain damage.\n\n177 The chant continues. HEDGEHOG DOZEN 3rd-level illusion Other rules.";
  const result = compareWarlockGrimoireSpell(candidate, source, 2);
  expect(result.bodyComparison.status).toBe("normalized-match");
  expect(result.headerDifferences).toEqual([
    { field: "concentration", draft: false, book: true },
  ]);
});

it("reads an explicit third-volume Druid class without inferring it from surrounding prose", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:charming-aesthetics",
    name: "Charming Aesthetics",
    level: 3,
    school: "Enchantment",
    range: "60 feet",
    duration: "1 day",
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materials: "a test flower",
    },
    classes: ["Warlock"],
    text: "The target is charmed.",
  };
  const source =
    "57 CHARMING AESTHETICS 3rd-level enchantment (druid) Casting Time: 1 action Range: 60 feet Components: V, S, M (a test flower) Duration: 1 day The target is charmed. TOXIC POLLEN Another entry.";
  const result = compareWarlockGrimoireSpell(candidate, source, 3);
  expect(result.grimoire).toBe(3);
  expect(result.classEvidence).toBe("explicit-header-list");
  expect(result.headerDifferences).toEqual([
    { field: "classes", draft: ["Warlock"], book: ["druid"] },
  ]);
  expect(candidate.classes).toEqual(["Warlock"]);
});

it("retains the third-volume cone header and diagnoses Sorceror spelling", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:bombardment-of-stings",
    name: "Bombardment of Stings",
    level: 2,
    school: "Evocation",
    range: "Self",
    duration: "Instantaneous",
    text: "The target takes damage.",
    components: { verbal: true, somatic: true, material: false },
    classes: ["Druid", "Ranger", "Sorceror", "Wizard"],
  };
  const source =
    "202 BOMBARDMENT OF STINGS 2nd-level evocation (druid, ranger, sorcerer, wizard) Casting Time: 1 action Range: Self (30-foot cone) Components: V, S Duration: Instantaneous The target takes damage. FIND THE MOONLIT PATH Another entry.";
  expect(
    compareWarlockGrimoireSpell(candidate, source, 3).headerDifferences,
  ).toEqual([
    { field: "range", draft: "Self", book: "Self (30-foot cone)" },
    {
      field: "classes",
      draft: candidate.classes,
      book: ["druid", "ranger", "sorcerer", "wizard"],
    },
  ]);
});

it("diagnoses extra Concentration without changing a source-original Fortitude rule", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:suppress-regeneration",
    name: "Suppress Regeneration",
    level: 1,
    school: "Transmutation",
    range: "30 feet",
    duration: "1 minute",
    concentration: true,
    components: { verbal: true, somatic: true, material: false },
    classes: ["Ranger", "Sorcerer", "Warlock", "Wizard"],
    text: "The target makes a Fortitude saving throw.",
  };
  const source =
    "204 SUPPRESS REGENERATION 1st-level transmutation (ranger, sorcerer, warlock, wizard) Casting Time: 1 action Range: 30 feet Components: V, S Duration: 1 minute The target makes a Fortitude saving throw.";
  const result = compareWarlockGrimoireSpell(candidate, source, 3);
  expect(result.headerDifferences).toEqual([
    { field: "concentration", draft: true, book: false },
  ]);
  expect(result.licensingReview.join(" ")).toContain(
    "Do not silently convert it to Constitution",
  );
  expect(candidate.concentration).toBe(true);
  expect(candidate.mechanics).toBeUndefined();
});

it("keeps a printed but undescribed Material component pending source clarification", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:zymurgic-aura",
    name: "Zymurgic Aura",
    level: 7,
    range: "Self",
    duration: "Instantaneous",
    components: { verbal: true, somatic: false, material: true },
    classes: ["Druid"],
    text: "The target takes damage.",
  };
  const source =
    "264 ZYMURGIC AURA 7th-level necromancy (druid) Casting Time: 1 action Range: Self Components: V, M Duration: Instantaneous The target takes damage. Druid Background: Zymurgist Background text.";
  const result = compareWarlockGrimoireSpell(candidate, source, 3);
  expect(result.headerDifferences).toEqual([]);
  expect(result.bodyComparison.status).toBe("normalized-match");
  expect(result.licensingReview.join(" ")).toContain(
    "specifies no material description",
  );
  expect(candidate.components.materials).toBeUndefined();
});

it("does not transfer second-volume named coverage to the third", () => {
  expect(() =>
    compareWarlockGrimoireSpell(
      { ...spell, id: "kobold-press-wz:remove-insulation" },
      "165 REMOVE INSULATION",
      3,
    ),
  ).toThrow("No reviewed Grimoire entry");
});

it("fails closed for changed artifacts instead of extending an old approval", () => {
  expect(() => reviewWarlockGrimoire("[]", echo, new Uint8Array())).toThrow(
    "Draft snapshot changed",
  );
});
