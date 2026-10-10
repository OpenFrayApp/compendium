// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import type { Spell } from "../schema/spell.ts";
import {
  reconcileDeepMagic2020Paladin,
  reconcileDeepMagic2020Warlock,
  reconcileDeepMagic2020Sorcerer,
  reconcileDeepMagic2020Cleric,
  reconcileDeepMagic2020Druid,
  reconcileDeepMagic2020Wizard,
  restoreDeepMagic2020Classes,
} from "./deepMagic2020Classes.ts";

export const DEEP_MAGIC_2020_PDF_SHA256 =
  "0f2e99f8184d8dbe93b9b1dcf0c90959cf7cd8c537d6ed327f1282e39fa486b8";
export const DEEP_MAGIC_2020_CANDIDATE_SHA256 =
  "29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6";

export const DEEP_MAGIC_2020_RITUAL_HOLDS = [
  "Afflict Line",
  "Bloom",
  "Celebration",
  "Clearing the Field",
  "Desolation",
  "Encroaching Shadows",
  "Guest of Honor",
  "Shadows Brought to Light",
  "Shadowy Retribution",
  "Song of the Forest",
  "Vine Trestle",
] as const;

const ERRATA: Readonly<
  Record<
    string,
    {
      fields?: Partial<Pick<Spell, "castingTime" | "range">>;
      replacements?: readonly { before: string; after: string }[];
      append?: string;
    }
  >
> = {
  "Animated Scroll": {
    replacements: [
      {
        before:
          "It follows your commands to the best of its ability, including carrying messages to a recipient whose location you know.",
        after:
          "It follows your commands to the best of its ability, including carrying messages to a recipient whose location you know.\n\nYou can’t have more than one animated paper animal at a time. If you cast this spell while you already have an animated paper animal, you instead cause it to adopt a new form. Choose any beast that has a challenge rating of 0. Your animated paper animal transforms into the chosen creature.",
      },
    ],
  },
  "Memento Mori": {
    fields: { range: "5 feet" },
    replacements: [
      {
        before:
          "Each creature that can see you must succeed on a Charisma saving throw or be stunned until the end of your next turn.",
        after:
          "Each creature within range that can see you must succeed on a Charisma saving throw or be stunned until the end of its next turn.",
      },
    ],
  },
  "Torrent of Fire": { fields: { castingTime: "1 action" } },
  "Thunder Bolt": {
    append:
      "The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
  },
  "Shadow Hands": {
    replacements: [
      {
        before:
          "Any creature caught in the shadow takes 2d4 necrotic damage and is frightened; a successful Wisdom saving throw halves the damage and negates the frightened condition.",
        after:
          "Any creature caught in the shadow takes 2d4 necrotic damage and is frightened until the end of its next turn; a successful Wisdom saving throw halves the damage and negates the frightened condition.",
      },
    ],
  },
  Slither: {
    replacements: [
      {
        before: "\n\n\n**At Higher Levels.**",
        after:
          "\n\nWhile in shadow form, you can’t talk or manipulate objects, and any objects you are carrying or holding can’t be dropped, used, or otherwise interacted with. In addition, you can’t attack or cast spells while in shadow form.\n\n**At Higher Levels.**",
      },
    ],
  },
};

/** Apply publisher errata dated May 29, 2025 to the six affected non-held candidates. */
export function applyDeepMagic2020Errata(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 errata scope changed");
  const errata = ERRATA[spell.name];
  if (!errata) return spell;
  let text = spell.text;
  for (const replacement of errata.replacements ?? []) {
    if (text.split(replacement.before).length !== 2)
      throw new Error(
        `Deep Magic 2020 errata anchor changed for ${spell.name}`,
      );
    text = text.replace(replacement.before, replacement.after);
  }
  if (errata.append) {
    if (text.includes(errata.append))
      throw new Error(
        `Deep Magic 2020 errata already present for ${spell.name}`,
      );
    text += `\n\n${errata.append}`;
  }
  return { ...spell, ...errata.fields, text };
}

/** Apply only visually verified corrections to the pinned, still-unapproved 2020 candidates. */
export function prepareDeepMagic2020Spells(content: string): Spell[] {
  if (
    createHash("sha256").update(content).digest("hex") !==
    DEEP_MAGIC_2020_CANDIDATE_SHA256
  )
    throw new Error(
      "Deep Magic 2020 candidate snapshot changed; renew source review",
    );
  const spells: Spell[] = JSON.parse(content);
  if (
    spells.length !== 515 ||
    new Set(spells.map((spell) => spell.id)).size !== 515 ||
    spells.some(
      (spell) => spell.source !== "kobold-press-deepm" || spell.mechanics,
    )
  )
    throw new Error("Deep Magic 2020 candidate scope changed");
  const ropes = spells.filter((spell) =>
    spell.name.startsWith("Anchoring Rope"),
  );
  const rope = consolidateAnchoringRope(ropes);
  return spells
    .flatMap((spell) => {
      if (spell.id === "kobold-press-deepm:anchoring-rope-reaction") return [];
      if (spell.id === rope.id) return [rope];
      if (
        (DEEP_MAGIC_2020_RITUAL_HOLDS as readonly string[]).includes(spell.name)
      )
        return [];
      let corrected =
        spell.name === "Blood Armor" ? correctBloodArmor(spell) : spell;
      corrected = applyDeepMagic2020BookHeaders(corrected);
      corrected = correctInstantSnare(corrected);
      corrected = correctDeepMagic2020BookText(corrected);
      corrected = correctDeepMagic2020Transcription(corrected);
      corrected = restoreDeepMagic2020Classes(corrected);
      corrected = correctDeepMagic2020ClassSpelling(corrected);
      corrected = reconcileDeepMagic2020Paladin(corrected);
      corrected = reconcileDeepMagic2020Warlock(corrected);
      corrected = reconcileDeepMagic2020Sorcerer(corrected);
      corrected = reconcileDeepMagic2020Cleric(corrected);
      corrected = reconcileDeepMagic2020Druid(corrected);
      corrected = reconcileDeepMagic2020Wizard(corrected);
      return [applyDeepMagic2020Errata(corrected)];
    })
    .map(({ edition: _edition, ...reference }) => reference);
}

const BOOK_TEXT_TAILS: Readonly<
  Record<string, { id: string; page: number; suffix: string }>
> = {
  "Hobble Mount": {
    id: "kobold-press-deepm:hobble-mount",
    page: 81,
    suffix:
      "\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d6 for each slot level above 1st.",
  },
  "Mass Hobble Mount": {
    id: "kobold-press-deepm:mass-hobble-mount",
    page: 95,
    suffix:
      "\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.",
  },
  Drown: {
    id: "kobold-press-deepm:drown",
    page: 65,
    suffix:
      "\n\nNOTE: Midgard Heroes Handbook has a very different [drown-heroes-handbook/drown](https://api.open5e.com/spells/drown) spell.",
  },
  "Candle’s Insight": {
    id: "kobold-press-deepm:candles-insight",
    page: 48,
    suffix:
      "\n\n**Candle’s insight** is used across society: by merchants while negotiating deals, by inquisitors investigating heresy, and by monarchs as they interview foreign diplomats. In some societies, casting candle’s insight without the consent of the spell’s target is considered a serious breach of hospitality.",
  },
  "Freeze Blood": {
    id: "kobold-press-deepm:freeze-blood",
    page: 272,
    suffix:
      "\n\nNOTE: This was previously a 5th-level spell that did 4d10 cold damage.",
  },
};

/** Remove verified API-only or non-mechanical tails while retaining printed spell mechanics. */
export function correctDeepMagic2020BookText(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 text review scope changed");
  if (!Object.hasOwn(BOOK_TEXT_TAILS, spell.name)) return spell;
  const correction = BOOK_TEXT_TAILS[spell.name];
  if (
    spell.id !== correction.id ||
    !spell.text.endsWith(correction.suffix) ||
    spell.text.split(correction.suffix).length !== 2
  )
    throw new Error(`Deep Magic 2020 text evidence changed for ${spell.name}`);
  return {
    ...spell,
    sourcePage: correction.page,
    text: spell.text.slice(0, -correction.suffix.length),
  };
}

const TRANSCRIPTION_CORRECTIONS: Readonly<
  Record<string, { id: string; page: number; before: string; after: string }>
> = {
  Bloodhound: {
    id: "kobold-press-deepm:bloodhound",
    page: 46,
    before: "using a 3rd-level spell slot,",
    after: "using a spell slot of 3rd level or higher,",
  },
  "Conjure Spectral Dead": {
    id: "kobold-press-deepm:conjure-spectral-dead",
    page: 55,
    before:
      "or one [will-o’-wisp](https://api.open5e.com/monsters/will-o-wisp).",
    after:
      "or one [ghost](https://api.open5e.com/monsters/ghost) or a [wight](https://api.open5e.com/monsters/wight).",
  },
  "Heart to Heart": {
    id: "kobold-press-deepm:heart-to-heart",
    page: 80,
    before: "remain stable and unconscious if reduced to 0 hit points",
    after:
      "remain stable and unconscious if one of you is reduced to 0 hit points",
  },
  "Killing Fields": {
    id: "kobold-press-deepm:killing-fields",
    page: 89,
    before:
      "   ***Pack Hunters.*** A helped creature has advantage on attack rolls against a hindered creature if at least one helped ally is within 5 feet of the hindered creature and the helped ally isn't incapacitated. Slaying. Once per turn, when a helped creature hits with any weapon, the weapon deals an extra 1d6 damage of its type to a hindered creature. Tracking. A helped creature has advantage on Wisdom (Survival) and Dexterity (Stealth) checks against a hindered creature.",
    after:
      "\n**Pack Hunters.** A helped creature has advantage on attack rolls against a hindered creature if at least one helped ally is within 5 feet of the hindered creature and the helped ally isn't incapacitated.\n\n**Slaying.** Once per turn, when a helped creature hits with any weapon, the weapon deals an extra 1d6 damage of the same type dealt by its weapon to a hindered creature.\n\n**Tracking.** A helped creature has advantage on Wisdom (Survival) and Dexterity (Stealth) checks against a hindered creature.",
  },
  "Frenzied Bolt": {
    id: "kobold-press-deepm:frenzied-bolt",
    page: 185,
    before: "Poision",
    after: "Poison",
  },
  "Hedren’s Birds of Clay": {
    id: "kobold-press-deepm:hedrens-birds-of-clay",
    page: 81,
    before: "add 1 to your to your roll",
    after: "add 1 to your roll",
  },
};

/** Restore visually checked source wording and rule subheads on pinned API cards. */
export function correctDeepMagic2020Transcription(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 transcription scope changed");
  if (!Object.hasOwn(TRANSCRIPTION_CORRECTIONS, spell.name)) return spell;
  const correction = TRANSCRIPTION_CORRECTIONS[spell.name];
  if (
    spell.id !== correction.id ||
    spell.text.split(correction.before).length !== 2
  )
    throw new Error(
      `Deep Magic 2020 transcription evidence changed for ${spell.name}`,
    );
  return {
    ...spell,
    sourcePage: correction.page,
    text: spell.text.replace(correction.before, correction.after),
  };
}

const MISSPELLED_CLASS_CARDS = [
  "Dead Walking",
  "Frenzied Bolt",
  "Going in Circles",
  "Harry",
  "Harrying Hounds",
  "Heart to Heart",
  "Ill-Fated Word",
  "Maim",
  "Reposition",
] as const;

/** Restore the printed Sorcerer class spelling for nine pinned API assignments. */
export function correctDeepMagic2020ClassSpelling(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 class-spelling scope changed");
  if (!(MISSPELLED_CLASS_CARDS as readonly string[]).includes(spell.name))
    return spell;
  if (
    !spell.classes?.includes("Sorceror") ||
    spell.classes.includes("Sorcerer")
  )
    throw new Error(`Deep Magic 2020 class spelling changed for ${spell.name}`);
  return {
    ...spell,
    classes: spell.classes.map((name) =>
      name === "Sorceror" ? "Sorcerer" : name,
    ),
  };
}

/** Restore Instant Snare's printed scaling from physical page 87. */
export function correctInstantSnare(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 scaling review scope changed");
  if (spell.name !== "Instant Snare") return spell;
  const before = "for each slot level above 3rd.";
  if (
    spell.id !== "kobold-press-deepm:instant-snare" ||
    spell.level !== 2 ||
    spell.text.split(before).length !== 2
  )
    throw new Error("Instant Snare source evidence changed");
  return {
    ...spell,
    sourcePage: 86,
    text: spell.text.replace(before, "for each slot level above 2nd."),
  };
}

export const DEEP_MAGIC_2020_HEADER_CORRECTIONS: Readonly<
  Record<
    string,
    {
      id: string;
      page: number;
      before: Partial<Pick<Spell, "range" | "duration" | "school">>;
      after: Partial<Pick<Spell, "range" | "duration" | "school">>;
    }
  >
> = {
  Bloodshot: {
    id: "kobold-press-deepm:bloodshot",
    page: 320,
    before: { range: "40 feet" },
    after: { range: "30 feet" },
  },
  "Encrypt / Decrypt": {
    id: "kobold-press-deepm:encrypt-decrypt",
    page: 67,
    before: { school: "Transmutation" },
    after: { school: "Alteration" },
  },
  "Bottled Arcana": {
    id: "kobold-press-deepm:bottled-arcana",
    page: 166,
    before: { duration: "24 hours" },
    after: { duration: "see below" },
  },
  "Curse of Yig": {
    id: "kobold-press-deepm:curse-of-yig",
    page: 338,
    before: { duration: "up to 1 hour" },
    after: { duration: "up to 10 minutes" },
  },
  "Glyph of Shifting": {
    id: "kobold-press-deepm:glyph-of-shifting",
    page: 76,
    before: { duration: "instantaneous" },
    after: { duration: "24 hours" },
  },
  Harry: {
    id: "kobold-press-deepm:harry",
    page: 79,
    before: { duration: "up to instantaneous" },
    after: { duration: "up to 1 hour" },
  },
  "Aura of Protection or Destruction": {
    id: "kobold-press-deepm:aura-of-protection-or-destruction",
    page: 41,
    before: { range: "Self" },
    after: { range: "Self (30-foot radius)" },
  },
  "Caustic Torrent": {
    id: "kobold-press-deepm:caustic-torrent",
    page: 167,
    before: { range: "Self" },
    after: { range: "Self (60-foot line)" },
  },
  "Clash of Glaciers": {
    id: "kobold-press-deepm:clash-of-glaciers",
    page: 270,
    before: { range: "Self" },
    after: { range: "Self (100-foot line)" },
  },
  "Destructive Resonance": {
    id: "kobold-press-deepm:destructive-resonance",
    page: 332,
    before: { range: "Self" },
    after: { range: "Self (15-foot cone)" },
  },
  "Doom of Serpent Coils": {
    id: "kobold-press-deepm:doom-of-serpent-coils",
    page: 63,
    before: { range: "Self" },
    after: { range: "Self (10-foot radius)" },
  },
  "Dragon Breath": {
    id: "kobold-press-deepm:dragon-breath",
    page: 201,
    before: { range: "Self" },
    after: { range: "Self (15-foot cone or 30-foot line)" },
  },
  "Echoes of Steel": {
    id: "kobold-press-deepm:echoes-of-steel",
    page: 67,
    before: { range: "Self" },
    after: { range: "Self (30-foot radius)" },
  },
  "Fusillade of Ice": {
    id: "kobold-press-deepm:fusillade-of-ice",
    page: 273,
    before: { range: "Self" },
    after: { range: "Self (30-foot cone)" },
  },
  "Glacial Cascade": {
    id: "kobold-press-deepm:glacial-cascade",
    page: 273,
    before: { range: "Self" },
    after: { range: "Self (30-foot-radius sphere)" },
  },
  "Heavenly Crown": {
    id: "kobold-press-deepm:heavenly-crown",
    page: 80,
    before: { range: "Self" },
    after: { range: "Self (30-foot radius)" },
  },
  "Keening Wail": {
    id: "kobold-press-deepm:keening-wail",
    page: 88,
    before: { range: "Self" },
    after: { range: "Self (15-foot cone)" },
  },
  "Lay to Rest": {
    id: "kobold-press-deepm:lay-to-rest",
    page: 91,
    before: { range: "Self" },
    after: { range: "Self (15-foot-radius sphere)" },
  },
  "Mephitic Croak": {
    id: "kobold-press-deepm:mephitic-croak",
    page: 167,
    before: { range: "Self" },
    after: { range: "Self (15-foot cone)" },
  },
  Quintessence: {
    id: "kobold-press-deepm:quintessence",
    page: 178,
    before: { range: "Self" },
    after: { range: "Self (120-foot radius)" },
  },
  "Rolling Thunder": {
    id: "kobold-press-deepm:rolling-thunder",
    page: 104,
    before: { range: "Self" },
    after: { range: "Self (30-foot line)" },
  },
  "Semblance of Dread": {
    id: "kobold-press-deepm:semblance-of-dread",
    page: 341,
    before: { range: "Self" },
    after: { range: "Self (10-foot radius)" },
  },
  "Shadow Hands": {
    id: "kobold-press-deepm:shadow-hands",
    page: 252,
    before: { range: "Self" },
    after: { range: "Self (10-foot cone)" },
  },
  "Sign of Koth": {
    id: "kobold-press-deepm:sign-of-koth",
    page: 341,
    before: { range: "Self" },
    after: { range: "Self (60-foot radius)" },
  },
  "Sleep of the Deep": {
    id: "kobold-press-deepm:sleep-of-the-deep",
    page: 342,
    before: { range: "60 feet" },
    after: { range: "60-foot radius" },
  },
  "Steam Whistle": {
    id: "kobold-press-deepm:steam-whistle",
    page: 110,
    before: { range: "Self" },
    after: { range: "Self (30-foot radius)" },
  },
  "Tidal Barrier": {
    id: "kobold-press-deepm:tidal-barrier",
    page: 116,
    before: { range: "Self" },
    after: { range: "Self (10-foot radius)" },
  },
  "Voorish Sign": {
    id: "kobold-press-deepm:voorish-sign",
    page: 343,
    before: { range: "Self" },
    after: { range: "Self (20-foot radius)" },
  },
  "Wind Tunnel": {
    id: "kobold-press-deepm:wind-tunnel",
    page: 122,
    before: { range: "Self" },
    after: { range: "Self (60-foot line)" },
  },
  "Winter's Radiance": {
    id: "kobold-press-deepm:winters-radiance",
    page: 278,
    before: { range: "400 feet" },
    after: { range: "400 feet (30-foot cube)" },
  },
};

/** Restore visually verified printed headers without inferring replacement mechanics. */
export function applyDeepMagic2020BookHeaders(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 book-header scope changed");
  if (!Object.hasOwn(DEEP_MAGIC_2020_HEADER_CORRECTIONS, spell.name))
    return spell;
  const correction = DEEP_MAGIC_2020_HEADER_CORRECTIONS[spell.name];
  if (
    spell.id !== correction.id ||
    Object.entries(correction.before).some(
      ([key, value]) => spell[key as keyof typeof correction.before] !== value,
    )
  )
    throw new Error(`${spell.name} source evidence changed`);
  return { ...spell, ...correction.after, sourcePage: correction.page };
}

/** Restore the printed dual casting time and omit the API's duplicate reaction-only card. */
export function consolidateAnchoringRope(spells: Spell[]): Spell {
  const action = spells.find(
    (spell) => spell.id === "kobold-press-deepm:anchoring-rope",
  );
  const reaction = spells.find(
    (spell) => spell.id === "kobold-press-deepm:anchoring-rope-reaction",
  );
  if (
    spells.length !== 2 ||
    !action ||
    !reaction ||
    action.name !== "Anchoring Rope" ||
    reaction.name !== "Anchoring Rope (Reaction)" ||
    action.source !== "kobold-press-deepm" ||
    action.mechanics ||
    reaction.mechanics ||
    action.castingTime !== "action" ||
    reaction.castingTime !== "reaction (that you take while falling)" ||
    JSON.stringify(action) !==
      JSON.stringify({
        ...reaction,
        id: action.id,
        name: action.name,
        castingTime: action.castingTime,
      })
  )
    throw new Error("Anchoring Rope source evidence changed");
  return {
    ...action,
    sourcePage: 37,
    castingTime: "1 action, or 1 reaction that you take while falling",
  };
}

/** Preserve Blood Armor's printed casting prerequisite without presenting it as a material. */
export function correctBloodArmor(spell: Spell): Spell {
  const prerequisite = "you must have just struck a foe with a melee weapon";
  if (
    spell.id !== "kobold-press-deepm:blood-armor" ||
    spell.source !== "kobold-press-deepm" ||
    spell.name !== "Blood Armor" ||
    spell.mechanics ||
    spell.components.material ||
    !spell.components.verbal ||
    !spell.components.somatic ||
    spell.components.materials !== prerequisite ||
    spell.castingTime !== "bonus-action"
  )
    throw new Error("Blood Armor source evidence changed");
  const { materials: _materials, ...components } = spell.components;
  return {
    ...spell,
    sourcePage: 319,
    components,
    castingTime: `1 bonus action (${prerequisite})`,
  };
}
