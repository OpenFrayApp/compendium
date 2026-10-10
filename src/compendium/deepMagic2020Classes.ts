// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Spell } from "../schema/spell.ts";

export const DEEP_MAGIC_2020_MISSING_CLASSES: Readonly<
  Record<string, readonly string[]>
> = {
  "Acid Gate": ["Wizard"],
  "Alchemical Form": ["Wizard"],
  "Aspect of the Dragon": ["Sorcerer"],
  "Awaken Object": ["Druid"],
  "Beguiling Bet": ["Bard"],
  "Bestial Fury": ["Ranger"],
  "Black Well": ["Wizard"],
  "Blood Spoor": ["Ranger"],
  "Blood to Acid": ["Wizard"],
  "Bottled Arcana": ["Wizard"],
  "Bottomless Stomach": ["Wizard"],
  "Brimstone Infusion": ["Wizard"],
  "Carmello-Volta’s Irksome Preserves": ["Druid"],
  "Chains of the Goddess": ["Cleric"],
  "Champion’s Weapon": ["Paladin"],
  "Cloak of Shadow": ["Wizard"],
  "Cobra Fangs": ["Ranger"],
  "Compelling Fate": ["Wizard"],
  "Comprehend Wild Shape": ["Druid"],
  "Conjure Forest Defender": ["Druid"],
  "Conjure Minor Voidborn": ["Wizard"],
  "Conjure Voidborn": ["Wizard"],
  "Costly Victory": ["Cleric"],
  "Create Thunderstaff": ["Wizard"],
  "Crushing Curse": ["Wizard"],
  Daggerhawk: ["Wizard"],
  "Delay Potion": ["Wizard"],
  "Delayed Healing": ["Cleric"],
  "Destructive Resonance": ["Wizard"],
  "Doom of the Cracked Shield": ["Druid"],
  "Dryad’s Kiss": ["Druid"],
  "Earworm Melody": ["Bard"],
  "Echoes of Steel": ["Paladin"],
  "Flickering Fate": ["Wizard"],
  "Forest Native": ["Druid"],
  "Forest Sanctuary": ["Druid"],
  "Form of the Gods": ["Cleric"],
  "Glimpse of the Void": ["Wizard"],
  "Gluey Globule": ["Wizard"],
  "Icy Grasp of the Void": ["Wizard"],
  "Instant Fortification": ["Wizard"],
  "Instant Siege Weapon": ["Wizard"],
  "Kareef’s Entreaty": ["Cleric"],
  "Lair Sense": ["Wizard"],
  "Lava Stone": ["Wizard"],
  "Life Drain": ["Wizard"],
  "Life Hack": ["Wizard"],
  "Living Shadows": ["Wizard"],
  "Maddening Whispers": ["Wizard"],
  "Mephitic Croak": ["Wizard"],
  "Nether Weapon": ["Wizard"],
  "Primal Infusion": ["Ranger"],
  "Protective Ice": ["Cleric"],
  "Puff of Smoke": ["Sorcerer"],
  "Quick Time": ["Druid"],
  "Quicksilver Mantle": ["Wizard"],
  "Ray of Alchemical Negation": ["Wizard"],
  "Salt Lash": ["Wizard"],
  "Sand Ship": ["Wizard"],
  "Shadow Bite": ["Wizard"],
  "Shadow Trove": ["Wizard"],
  Silhouette: ["Wizard"],
  Slither: ["Wizard"],
  "Starry Vision": ["Wizard"],
  "Summon Star": ["Wizard"],
  "Thunder Bolt": ["Sorcerer"],
  Thunderstorm: ["Sorcerer"],
  "Torrent of Fire": ["Sorcerer"],
  "Treasure Chasm": ["Sorcerer"],
  "Tree Speak": ["Druid"],
  "Unleash Effigy": ["Wizard"],
  "Void Rift": ["Wizard"],
  "Void Strike": ["Wizard"],
  Waft: ["Sorcerer"],
  "Word of Misfortune": ["Wizard"],
};

export const DEEP_MAGIC_2020_PALADIN_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  "Ancestor’s Strength": true,
  "Angelic Guardian": true,
  "Anticipate Arcana": true,
  "Anticipate Attack": true,
  "Aura of Protection or Destruction": true,
  "Binding Oath": true,
  "Blade of my Brother": true,
  "Blade of Wrath": true,
  "Blazing Chariot": true,
  "Blessed Halo": true,
  Stanch: false,
  "Vital Mark": false,
};

export const DEEP_MAGIC_2020_WARLOCK_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  "Angelic Guardian": false,
  Benediction: false,
  "Blade of Wrath": false,
  "Blazing Chariot": false,
  "Blessed Halo": false,
  "Create Ring Servant": false,
  "Deva’s Wings": false,
  "Enchant Ring": false,
  "Greater Seal of Sanctuary": false,
  "Heavenly Crown": false,
  Misstep: false,
  Quintessence: false,
  "Ring Ward": false,
  "Seal of Sanctuary": false,
  "Volley Shield": false,
  "Walk the Twisted Path": false,
};

export const DEEP_MAGIC_2020_SORCERER_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  "Blood and Steel": false,
  "Calm of the Storm": false,
  Heartstop: false,
  "Mass Surge Dampener": false,
  "Paragon of Chaos": false,
  "Surge Dampener": false,
  "Wild Shield": false,
};

export const DEEP_MAGIC_2020_CLERIC_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  Harry: false,
  Heartstop: false,
  Maim: false,
  Misstep: false,
};

export const DEEP_MAGIC_2020_DRUID_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  "Icicle Daggers": false,
};

export const DEEP_MAGIC_2020_WIZARD_CORRECTIONS: Readonly<
  Record<string, boolean>
> = {
  "Heart-Seeking Arrow": true,
  Nightfall: false,
  "Seeping Death": false,
  "Stench of Rot": false,
};

/** Reconcile one visually checked class membership while preserving all other assignments. */
function reconcileClassMembership(
  spell: Spell,
  className: string,
  corrections: Readonly<Record<string, boolean>>,
): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error(`Deep Magic 2020 ${className} review scope changed`);
  if (!Object.hasOwn(corrections, spell.name)) return spell;
  const included = corrections[spell.name];
  if (!spell.classes?.length || spell.classes.includes(className) === included)
    throw new Error(
      `Deep Magic 2020 ${className} evidence changed for ${spell.name}`,
    );
  const classes = included
    ? [...spell.classes, className]
    : spell.classes.filter((name) => name !== className);
  return { ...spell, classes: classes.sort() };
}

/** Reconcile twelve API assignments against the complete Paladin list on physical pages 16–17. */
export function reconcileDeepMagic2020Paladin(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Paladin",
    DEEP_MAGIC_2020_PALADIN_CORRECTIONS,
  );
}

/** Remove sixteen assignments absent from the printed Warlock lists, preserving appendix exceptions. */
export function reconcileDeepMagic2020Warlock(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Warlock",
    DEEP_MAGIC_2020_WARLOCK_CORRECTIONS,
  );
}

/** Remove seven assignments absent from the complete Sorcerer list on physical pages 19–23. */
export function reconcileDeepMagic2020Sorcerer(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Sorcerer",
    DEEP_MAGIC_2020_SORCERER_CORRECTIONS,
  );
}

/** Remove four assignments absent from the main and applicable specialty Cleric lists. */
export function reconcileDeepMagic2020Cleric(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Cleric",
    DEEP_MAGIC_2020_CLERIC_CORRECTIONS,
  );
}

/** Remove Icicle Daggers' Druid assignment, absent from both the main and winter lists. */
export function reconcileDeepMagic2020Druid(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Druid",
    DEEP_MAGIC_2020_DRUID_CORRECTIONS,
  );
}

/** Reconcile four assignments against the printed Wizard lists on physical pages 27–33. */
export function reconcileDeepMagic2020Wizard(spell: Spell): Spell {
  return reconcileClassMembership(
    spell,
    "Wizard",
    DEEP_MAGIC_2020_WIZARD_CORRECTIONS,
  );
}

/** Restore the 75 absent API class lists from visually checked 2020 book entries. */
export function restoreDeepMagic2020Classes(spell: Spell): Spell {
  if (spell.source !== "kobold-press-deepm" || spell.mechanics)
    throw new Error("Deep Magic 2020 class review scope changed");
  if (!Object.hasOwn(DEEP_MAGIC_2020_MISSING_CLASSES, spell.name)) return spell;
  if (spell.classes?.length)
    throw new Error(
      `Deep Magic 2020 class assumptions changed for ${spell.name}`,
    );
  return {
    ...spell,
    classes: [...DEEP_MAGIC_2020_MISSING_CLASSES[spell.name]],
  };
}
