// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it } from "vitest";
import {
  correctBloodArmor,
  correctInstantSnare,
  correctDeepMagic2020BookText,
  correctDeepMagic2020Transcription,
  correctDeepMagic2020ClassSpelling,
  applyDeepMagic2020Errata,
  applyDeepMagic2020BookHeaders,
  DEEP_MAGIC_2020_HEADER_CORRECTIONS,
  DEEP_MAGIC_2020_RITUAL_HOLDS,
  consolidateAnchoringRope,
  prepareDeepMagic2020Spells,
} from "../../src/compendium/deepMagic2020Review.ts";
import type { Spell } from "../../src/schema/spell.ts";
import {
  DEEP_MAGIC_2020_MISSING_CLASSES,
  restoreDeepMagic2020Classes,
  DEEP_MAGIC_2020_PALADIN_CORRECTIONS,
  reconcileDeepMagic2020Paladin,
  DEEP_MAGIC_2020_WARLOCK_CORRECTIONS,
  reconcileDeepMagic2020Warlock,
  DEEP_MAGIC_2020_SORCERER_CORRECTIONS,
  reconcileDeepMagic2020Sorcerer,
  DEEP_MAGIC_2020_CLERIC_CORRECTIONS,
  DEEP_MAGIC_2020_DRUID_CORRECTIONS,
  DEEP_MAGIC_2020_WIZARD_CORRECTIONS,
  reconcileDeepMagic2020Cleric,
  reconcileDeepMagic2020Druid,
  reconcileDeepMagic2020Wizard,
} from "../../src/compendium/deepMagic2020Classes.ts";
import { validateSpellDataset } from "../../src/compendium/validate.ts";

const original: Spell = {
  id: "kobold-press-deepm:blood-armor",
  source: "kobold-press-deepm",
  edition: "5.0",
  name: "Blood Armor",
  level: 3,
  school: "Necromancy",
  castingTime: "bonus-action",
  range: "Self",
  duration: "1 hour",
  concentration: false,
  ritual: false,
  components: {
    verbal: true,
    somatic: true,
    material: false,
    materials: "you must have just struck a foe with a melee weapon",
  },
  text: "When you strike a foe with a melee weapon attack, you can immediately cast Blood Armor as a bonus action.",
};

it("preserves the source prerequisite and prose while removing the false material description", () => {
  const before = JSON.stringify(original);
  const corrected = correctBloodArmor(original);
  expect(corrected.components).toEqual({
    verbal: true,
    somatic: true,
    material: false,
  });
  expect(corrected.castingTime).toBe(
    "1 bonus action (you must have just struck a foe with a melee weapon)",
  );
  expect(corrected.text).toBe(original.text);
  expect(corrected.sourcePage).toBe(319);
  expect(corrected.mechanics).toBeUndefined();
  expect(JSON.stringify(original)).toBe(before);
  expect(validateSpellDataset([corrected]).warns).toBe(0);
});

it("consolidates the duplicate rope card while retaining both casting options", () => {
  const action: Spell = {
    ...original,
    id: "kobold-press-deepm:anchoring-rope",
    name: "Anchoring Rope",
    castingTime: "action",
    components: { verbal: true, somatic: true, material: false },
  };
  const reaction: Spell = {
    ...action,
    id: "kobold-press-deepm:anchoring-rope-reaction",
    name: "Anchoring Rope (Reaction)",
    castingTime: "reaction (that you take while falling)",
  };
  const before = JSON.stringify([action, reaction]);
  const corrected = consolidateAnchoringRope([action, reaction]);
  expect(corrected.id).toBe(action.id);
  expect(corrected.castingTime).toBe(
    "1 action, or 1 reaction that you take while falling",
  );
  expect(corrected.text).toBe(action.text);
  expect(corrected.sourcePage).toBe(37);
  expect(JSON.stringify([action, reaction])).toBe(before);
  expect(() => consolidateAnchoringRope([action])).toThrow("evidence changed");
  expect(() =>
    consolidateAnchoringRope([action, { ...reaction, text: "Changed effect" }]),
  ).toThrow("evidence changed");
});

it.each([
  [
    "Animated Scroll",
    "It follows your commands to the best of its ability, including carrying messages to a recipient whose location you know.",
    "You can’t have more than one animated paper animal at a time.",
  ],
  [
    "Memento Mori",
    "Each creature that can see you must succeed on a Charisma saving throw or be stunned until the end of your next turn.",
    "until the end of its next turn.",
  ],
  ["Thunder Bolt", "You cast a knot of thunder.", "17th level (4d8)."],
  [
    "Shadow Hands",
    "Any creature caught in the shadow takes 2d4 necrotic damage and is frightened; a successful Wisdom saving throw halves the damage and negates the frightened condition.",
    "frightened until the end of its next turn",
  ],
  [
    "Slither",
    "You become a shadow.\n\n\n**At Higher Levels.** More creatures.",
    "you can’t attack or cast spells while in shadow form.",
  ],
])(
  "applies exact publisher prose for %s without mutating the input",
  (name, text, expected) => {
    const spell = { ...original, name, text };
    const before = JSON.stringify(spell);
    expect(applyDeepMagic2020Errata(spell).text).toContain(expected);
    expect(JSON.stringify(spell)).toBe(before);
    expect(applyDeepMagic2020Errata(spell).mechanics).toBeUndefined();
  },
);

it("applies publisher range and casting-time corrections", () => {
  const memento = applyDeepMagic2020Errata({
    ...original,
    name: "Memento Mori",
    text: "Each creature that can see you must succeed on a Charisma saving throw or be stunned until the end of your next turn.",
  });
  expect(memento.range).toBe("5 feet");
  expect(
    applyDeepMagic2020Errata({
      ...original,
      name: "Torrent of Fire",
      castingTime: "round",
    }).castingTime,
  ).toBe("1 action");
  expect(() =>
    applyDeepMagic2020Errata({
      ...original,
      name: "Slither",
      text: "Changed anchor",
    }),
  ).toThrow("anchor changed");
});

it("records the eleven custom-ritual dependencies without dropping ordinary ritual spells", () => {
  expect(DEEP_MAGIC_2020_RITUAL_HOLDS).toHaveLength(11);
  expect(DEEP_MAGIC_2020_RITUAL_HOLDS).toContain("Celebration");
  expect(DEEP_MAGIC_2020_RITUAL_HOLDS).not.toContain("Find Kin");
});

it("restores only missing book-backed class lists and protects existing assignments", () => {
  expect(Object.keys(DEEP_MAGIC_2020_MISSING_CLASSES)).toHaveLength(75);
  const spell = { ...original, name: "Acid Gate" };
  const restored = restoreDeepMagic2020Classes(spell);
  expect(restored.classes).toEqual(["Wizard"]);
  expect(spell.classes).toBeUndefined();
  expect(
    restoreDeepMagic2020Classes({ ...original, name: "Puff of Smoke" }).classes,
  ).toEqual(["Sorcerer"]);
  expect(() =>
    restoreDeepMagic2020Classes({ ...spell, classes: ["Bard"] }),
  ).toThrow("assumptions changed");
  expect(
    restoreDeepMagic2020Classes({ ...original, name: "Unreviewed Name" }),
  ).toBeDefined();
  expect(() =>
    restoreDeepMagic2020Classes({ ...spell, source: "other" }),
  ).toThrow("scope changed");
});

it.each(Object.entries(DEEP_MAGIC_2020_PALADIN_CORRECTIONS))(
  "reconciles only the printed Paladin membership for %s",
  (name, included) => {
    const spell = {
      ...original,
      name,
      classes: included
        ? ["Cleric", "Warlock"]
        : ["Cleric", "Paladin", "Warlock"],
    };
    const before = JSON.stringify(spell);
    const corrected = reconcileDeepMagic2020Paladin(spell);
    expect(corrected.classes).toEqual(
      included ? ["Cleric", "Paladin", "Warlock"] : ["Cleric", "Warlock"],
    );
    expect(JSON.stringify(spell)).toBe(before);
    expect(corrected.text).toBe(spell.text);
    expect(() => reconcileDeepMagic2020Paladin(corrected)).toThrow(
      "evidence changed",
    );
  },
);

it("protects the Paladin review scope and unrelated assignments", () => {
  expect(Object.keys(DEEP_MAGIC_2020_PALADIN_CORRECTIONS)).toHaveLength(12);
  expect(reconcileDeepMagic2020Paladin(original)).toBe(original);
  expect(() =>
    reconcileDeepMagic2020Paladin({
      ...original,
      name: "Stanch",
      source: "other",
    }),
  ).toThrow("scope changed");
});

it.each(Object.keys(DEEP_MAGIC_2020_WARLOCK_CORRECTIONS))(
  "removes the non-printed Warlock assignment for %s",
  (name) => {
    const spell = {
      ...original,
      name,
      classes: ["Cleric", "Warlock", "Wizard"],
    };
    const corrected = reconcileDeepMagic2020Warlock(spell);
    expect(corrected.classes).toEqual(["Cleric", "Wizard"]);
    expect(spell.classes).toContain("Warlock");
    expect(() => reconcileDeepMagic2020Warlock(corrected)).toThrow(
      "evidence changed",
    );
  },
);

it("retains printed Warlock assignments missed by OCR", () => {
  expect(Object.keys(DEEP_MAGIC_2020_WARLOCK_CORRECTIONS)).toHaveLength(16);
  for (const name of [
    "Avoid Grievous Injury",
    "Avronin’s Astral Assembly",
    "Kobold’s Fury",
    "Steam Whistle",
    "Demon Within",
  ]) {
    const spell = { ...original, name, classes: ["Warlock", "Wizard"] };
    expect(reconcileDeepMagic2020Warlock(spell)).toBe(spell);
  }
});

it.each(Object.keys(DEEP_MAGIC_2020_SORCERER_CORRECTIONS))(
  "removes the non-printed Sorcerer assignment for %s",
  (name) => {
    const spell = {
      ...original,
      name,
      classes: ["Bard", "Sorcerer", "Wizard"],
    };
    const corrected = reconcileDeepMagic2020Sorcerer(spell);
    expect(corrected.classes).toEqual(["Bard", "Wizard"]);
    expect(spell.classes).toContain("Sorcerer");
    expect(() => reconcileDeepMagic2020Sorcerer(corrected)).toThrow(
      "evidence changed",
    );
  },
);

it("retains printed Sorcerer assignments missed by OCR", () => {
  expect(Object.keys(DEEP_MAGIC_2020_SORCERER_CORRECTIONS)).toHaveLength(7);
  for (const name of ["Ill-Fated Word", "Hematomancy"]) {
    const spell = { ...original, name, classes: ["Sorcerer", "Wizard"] };
    expect(reconcileDeepMagic2020Sorcerer(spell)).toBe(spell);
  }
});

it.each([
  ["Cleric", reconcileDeepMagic2020Cleric, DEEP_MAGIC_2020_CLERIC_CORRECTIONS],
  ["Druid", reconcileDeepMagic2020Druid, DEEP_MAGIC_2020_DRUID_CORRECTIONS],
  ["Wizard", reconcileDeepMagic2020Wizard, DEEP_MAGIC_2020_WIZARD_CORRECTIONS],
] as const)(
  "reconciles only the source-backed %s assignments",
  (className, reconcile, corrections) => {
    for (const [name, included] of Object.entries(corrections)) {
      const spell = {
        ...original,
        name,
        classes: included ? ["Ranger"] : [className, "Ranger"],
      };
      const before = JSON.stringify(spell);
      const corrected = reconcile(spell);
      expect(corrected.classes).toEqual(
        (included ? [className, "Ranger"] : ["Ranger"]).sort(),
      );
      expect(JSON.stringify(spell)).toBe(before);
      expect(() => reconcile(corrected)).toThrow("evidence changed");
    }
  },
);

it("preserves supplemental-list assignments missing from the main-list OCR", () => {
  for (const name of ["Fusillade of Ice", "Guiding Star", "Searing Sun"]) {
    const spell = { ...original, name, classes: ["Druid", "Ranger", "Wizard"] };
    expect(reconcileDeepMagic2020Druid(spell)).toBe(spell);
  }
  expect(
    reconcileDeepMagic2020Cleric({
      ...original,
      name: "Searing Sun",
      classes: ["Cleric"],
    }).classes,
  ).toEqual(["Cleric"]);
  for (const name of [
    "Glacial Cascade",
    "Demon Within",
    "Avronin’s Astral Assembly",
    "Hedren’s Birds of Clay",
    "Gloomwrought Barrier",
  ]) {
    const spell = { ...original, name, classes: ["Wizard"] };
    expect(reconcileDeepMagic2020Wizard(spell)).toBe(spell);
  }
});

it("retains the printed Alteration school without inventing a correction", () => {
  const spell = {
    ...original,
    name: "Encrypt / Decrypt",
    id: "kobold-press-deepm:encrypt-decrypt",
    school: "Transmutation",
  };
  expect(applyDeepMagic2020BookHeaders(spell).school).toBe("Alteration");
  expect(applyDeepMagic2020BookHeaders(spell).sourcePage).toBe(67);
  expect(spell.school).toBe("Transmutation");
  expect(() =>
    applyDeepMagic2020BookHeaders({ ...spell, school: "Illusion" }),
  ).toThrow("evidence changed");
});

it.each(Object.entries(DEEP_MAGIC_2020_HEADER_CORRECTIONS))(
  "restores the visually checked header for %s and rejects changed assumptions",
  (name, evidence) => {
    const spell = { ...original, id: evidence.id, name, ...evidence.before };
    const before = JSON.stringify(spell);
    const corrected = applyDeepMagic2020BookHeaders(spell);
    expect(corrected).toMatchObject(evidence.after);
    expect(corrected.sourcePage).toBe(evidence.page);
    expect(corrected.text).toBe(spell.text);
    expect(corrected.components).toEqual(spell.components);
    expect(JSON.stringify(spell)).toBe(before);
    expect(() => applyDeepMagic2020BookHeaders(corrected)).toThrow(
      "evidence changed",
    );
    expect(() =>
      applyDeepMagic2020BookHeaders({ ...spell, id: "changed" }),
    ).toThrow("evidence changed");
  },
);

it("restores Bloodshot's printed range while preserving its components and effect", () => {
  const spell = {
    ...original,
    id: "kobold-press-deepm:bloodshot",
    name: "Bloodshot",
    range: "40 feet",
  };
  const before = JSON.stringify(spell);
  const corrected = applyDeepMagic2020BookHeaders(spell);
  expect(corrected.range).toBe("30 feet");
  expect(corrected.sourcePage).toBe(320);
  expect(corrected.components).toEqual(spell.components);
  expect(corrected.text).toBe(spell.text);
  expect(JSON.stringify(spell)).toBe(before);
  expect(() =>
    applyDeepMagic2020BookHeaders({ ...spell, range: "60 feet" }),
  ).toThrow("evidence changed");
  expect(() =>
    applyDeepMagic2020BookHeaders({ ...spell, id: "changed" }),
  ).toThrow("evidence changed");
});

it("restores Instant Snare scaling from the printed source, not an inferred rebalance", () => {
  const spell = {
    ...original,
    name: "Instant Snare",
    id: "kobold-press-deepm:instant-snare",
    level: 2,
    text: "When you cast this spell using a spell slot of 3rd level or higher, you can create one additional snare for each slot level above 3rd.",
  };
  expect(correctInstantSnare(spell).text).toContain(
    "slot of 3rd level or higher",
  );
  expect(correctInstantSnare(spell).text).toContain(
    "for each slot level above 2nd.",
  );
  expect(spell.text).toContain("for each slot level above 3rd.");
  expect(() => correctInstantSnare({ ...spell, level: 3 })).toThrow(
    "evidence changed",
  );
  expect(() =>
    correctInstantSnare({ ...spell, text: "No known anchor" }),
  ).toThrow("evidence changed");
});

it.each([
  [
    "Hobble Mount",
    "hobble-mount",
    81,
    "\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d6 for each slot level above 1st.",
  ],
  [
    "Mass Hobble Mount",
    "mass-hobble-mount",
    95,
    "\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.",
  ],
  [
    "Drown",
    "drown",
    65,
    "\n\nNOTE: Midgard Heroes Handbook has a very different [drown-heroes-handbook/drown](https://api.open5e.com/spells/drown) spell.",
  ],
  [
    "Freeze Blood",
    "freeze-blood",
    272,
    "\n\nNOTE: This was previously a 5th-level spell that did 4d10 cold damage.",
  ],
] as const)(
  "removes only the visually verified API-only tail for %s",
  (name, slug, page, suffix) => {
    const spell = {
      ...original,
      name,
      id: `kobold-press-deepm:${slug}`,
      text: `Printed mechanics.${suffix}`,
    };
    const corrected = correctDeepMagic2020BookText(spell);
    expect(corrected.text).toBe("Printed mechanics.");
    expect(corrected.sourcePage).toBe(page);
    expect(spell.text).toBe(`Printed mechanics.${suffix}`);
    expect(() =>
      correctDeepMagic2020BookText({
        ...spell,
        text: `${spell.text} Unexpected text.`,
      }),
    ).toThrow("evidence changed");
    expect(() =>
      correctDeepMagic2020BookText({ ...spell, id: "changed" }),
    ).toThrow("evidence changed");
  },
);

it.each([
  ["Frenzied Bolt", "frenzied-bolt", "Poision", "Poison", 185],
  [
    "Bloodhound",
    "bloodhound",
    "using a 3rd-level spell slot,",
    "using a spell slot of 3rd level or higher,",
    46,
  ],
  [
    "Heart to Heart",
    "heart-to-heart",
    "remain stable and unconscious if reduced to 0 hit points",
    "remain stable and unconscious if one of you is reduced to 0 hit points",
    80,
  ],
  [
    "Hedren’s Birds of Clay",
    "hedrens-birds-of-clay",
    "add 1 to your to your roll",
    "add 1 to your roll",
    81,
  ],
] as const)(
  "restores the printed transcription for %s",
  (name, slug, before, after, page) => {
    const spell = {
      ...original,
      id: `kobold-press-deepm:${slug}`,
      name,
      text: `Rules: ${before}.`,
    };
    const corrected = correctDeepMagic2020Transcription(spell);
    expect(corrected.text).toBe(`Rules: ${after}.`);
    expect(corrected.sourcePage).toBe(page);
    expect(spell.text).toBe(`Rules: ${before}.`);
    expect(() =>
      correctDeepMagic2020Transcription({ ...spell, text: "Changed" }),
    ).toThrow("evidence changed");
    expect(() =>
      correctDeepMagic2020Transcription({ ...spell, id: "changed" }),
    ).toThrow("evidence changed");
  },
);

it("restores Conjure Spectral Dead's printed ghost or wight options without importing their stat blocks", () => {
  const spell = {
    ...original,
    id: "kobold-press-deepm:conjure-spectral-dead",
    name: "Conjure Spectral Dead",
    text: "When you cast this spell with a spell slot of 4th level or higher, you can choose to summon four [shrouds](https://api.open5e.com/monsters/shroud) or one [will-o’-wisp](https://api.open5e.com/monsters/will-o-wisp).",
  };
  const corrected = correctDeepMagic2020Transcription(spell);
  expect(corrected.text).toContain("four [shrouds]");
  expect(corrected.text).toContain("or one [ghost]");
  expect(corrected.text).toContain("or a [wight]");
  expect(corrected.text).not.toContain("will-o");
  expect(corrected.sourcePage).toBe(55);
  expect(corrected.mechanics).toBeUndefined();
  expect(spell.text).toContain("will-o");
  expect(() => correctDeepMagic2020Transcription(corrected)).toThrow(
    "evidence changed",
  );
});

it("restores Killing Fields' three printed rule subheads without baking in conditional advantage", () => {
  const text =
    "   ***Pack Hunters.*** A helped creature has advantage on attack rolls against a hindered creature if at least one helped ally is within 5 feet of the hindered creature and the helped ally isn't incapacitated. Slaying. Once per turn, when a helped creature hits with any weapon, the weapon deals an extra 1d6 damage of its type to a hindered creature. Tracking. A helped creature has advantage on Wisdom (Survival) and Dexterity (Stealth) checks against a hindered creature.";
  const spell = {
    ...original,
    id: "kobold-press-deepm:killing-fields",
    name: "Killing Fields",
    text,
  };
  const corrected = correctDeepMagic2020Transcription(spell);
  expect(corrected.text).toContain("\n**Pack Hunters.**");
  expect(corrected.text).toContain("\n\n**Slaying.**");
  expect(corrected.text).toContain("\n\n**Tracking.**");
  expect(corrected.text).toContain("of the same type dealt by its weapon");
  expect(corrected.text).toContain(
    "if at least one helped ally is within 5 feet",
  );
  expect(corrected.sourcePage).toBe(89);
  expect(corrected.mechanics).toBeUndefined();
  expect(spell.text).toBe(text);
  expect(() =>
    correctDeepMagic2020Transcription({ ...spell, text: "Changed" }),
  ).toThrow("evidence changed");
});

it("omits Candle’s Insight's setting-use paragraph without removing its honesty rules", () => {
  const suffix =
    "\n\n**Candle’s insight** is used across society: by merchants while negotiating deals, by inquisitors investigating heresy, and by monarchs as they interview foreign diplomats. In some societies, casting candle’s insight without the consent of the spell’s target is considered a serious breach of hospitality.";
  const spell = {
    ...original,
    id: "kobold-press-deepm:candles-insight",
    name: "Candle’s Insight",
    text: `Printed honesty rules.${suffix}`,
  };
  const corrected = correctDeepMagic2020BookText(spell);
  expect(corrected.text).toBe("Printed honesty rules.");
  expect(corrected.sourcePage).toBe(48);
  expect(spell.text).toContain("hospitality");
  expect(() =>
    correctDeepMagic2020BookText({ ...spell, text: "Changed" }),
  ).toThrow("evidence changed");
});

it.each([
  "Dead Walking",
  "Frenzied Bolt",
  "Going in Circles",
  "Harry",
  "Harrying Hounds",
  "Heart to Heart",
  "Ill-Fated Word",
  "Maim",
  "Reposition",
])("restores only the class spelling for %s", (name) => {
  const spell = { ...original, name, classes: ["Bard", "Sorceror", "Wizard"] };
  expect(correctDeepMagic2020ClassSpelling(spell).classes).toEqual([
    "Bard",
    "Sorcerer",
    "Wizard",
  ]);
  expect(spell.classes).toContain("Sorceror");
  expect(() =>
    correctDeepMagic2020ClassSpelling({ ...spell, classes: ["Wizard"] }),
  ).toThrow("spelling changed");
});

it("rejects changed source assumptions and a substituted edition snapshot", () => {
  expect(() =>
    correctBloodArmor({
      ...original,
      source: "kobold-press-deep-magic-volume-1",
    }),
  ).toThrow("evidence changed");
  expect(() =>
    correctBloodArmor({
      ...original,
      components: { ...original.components, material: true },
    }),
  ).toThrow("evidence changed");
  expect(() => prepareDeepMagic2020Spells("[]")).toThrow("snapshot changed");
});
