// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Spell } from '../schema/spell.ts'

// Evidence: docs/deep-magic-2020-review.md (main/specialty lists, visual checks, and publisher errata).
export const DEEP_MAGIC_2020_MISSING_CLASSES: Readonly<Record<string, readonly string[]>> = {
  'Acid Gate': ['Wizard'],
  'Alchemical Form': ['Wizard'],
  'Aspect of the Dragon': ['Sorcerer'],
  'Awaken Object': ['Druid'],
  'Beguiling Bet': ['Bard'],
  'Bestial Fury': ['Ranger'],
  'Black Well': ['Wizard'],
  'Blood Spoor': ['Ranger'],
  'Blood to Acid': ['Wizard'],
  'Bottled Arcana': ['Wizard'],
  'Bottomless Stomach': ['Wizard'],
  'Brimstone Infusion': ['Wizard'],
  'Carmello-Volta’s Irksome Preserves': ['Druid'],
  'Chains of the Goddess': ['Cleric'],
  'Champion’s Weapon': ['Paladin'],
  'Cloak of Shadow': ['Wizard'],
  'Cobra Fangs': ['Ranger'],
  'Compelling Fate': ['Wizard'],
  'Comprehend Wild Shape': ['Druid'],
  'Conjure Forest Defender': ['Druid'],
  'Conjure Minor Voidborn': ['Wizard'],
  'Conjure Voidborn': ['Wizard'],
  'Costly Victory': ['Cleric'],
  'Create Thunderstaff': ['Wizard'],
  'Crushing Curse': ['Wizard'],
  Daggerhawk: ['Wizard'],
  'Delay Potion': ['Wizard'],
  'Delayed Healing': ['Cleric'],
  'Destructive Resonance': ['Wizard'],
  'Doom of the Cracked Shield': ['Druid'],
  'Dryad’s Kiss': ['Druid'],
  'Earworm Melody': ['Bard'],
  'Echoes of Steel': ['Paladin'],
  'Flickering Fate': ['Wizard'],
  'Forest Native': ['Druid'],
  'Forest Sanctuary': ['Druid'],
  'Form of the Gods': ['Cleric'],
  'Glimpse of the Void': ['Wizard'],
  'Gluey Globule': ['Wizard'],
  'Icy Grasp of the Void': ['Wizard'],
  'Instant Fortification': ['Wizard'],
  'Instant Siege Weapon': ['Wizard'],
  'Kareef’s Entreaty': ['Cleric'],
  'Lair Sense': ['Wizard'],
  'Lava Stone': ['Wizard'],
  'Life Drain': ['Wizard'],
  'Life Hack': ['Wizard'],
  'Living Shadows': ['Wizard'],
  'Maddening Whispers': ['Wizard'],
  'Mephitic Croak': ['Wizard'],
  'Nether Weapon': ['Wizard'],
  'Primal Infusion': ['Ranger'],
  'Protective Ice': ['Cleric'],
  'Puff of Smoke': ['Sorcerer'],
  'Quick Time': ['Druid'],
  'Quicksilver Mantle': ['Wizard'],
  'Ray of Alchemical Negation': ['Wizard'],
  'Salt Lash': ['Wizard'],
  'Sand Ship': ['Wizard'],
  'Shadow Bite': ['Wizard'],
  'Shadow Trove': ['Wizard'],
  Silhouette: ['Wizard'],
  Slither: ['Wizard'],
  'Starry Vision': ['Wizard'],
  'Summon Star': ['Wizard'],
  'Thunder Bolt': ['Sorcerer'],
  Thunderstorm: ['Sorcerer'],
  'Torrent of Fire': ['Sorcerer'],
  'Treasure Chasm': ['Sorcerer'],
  'Tree Speak': ['Druid'],
  'Unleash Effigy': ['Wizard'],
  'Void Rift': ['Wizard'],
  'Void Strike': ['Wizard'],
  Waft: ['Sorcerer'],
  'Word of Misfortune': ['Wizard']
}

export const DEEP_MAGIC_2020_PALADIN_CORRECTIONS: Readonly<Record<string, boolean>> = {
  'Ancestor’s Strength': true,
  'Angelic Guardian': true,
  'Anticipate Arcana': true,
  'Anticipate Attack': true,
  'Aura of Protection or Destruction': true,
  'Binding Oath': true,
  'Blade of my Brother': true,
  'Blade of Wrath': true,
  'Blazing Chariot': true,
  'Blessed Halo': true,
  Stanch: false,
  'Vital Mark': false
}

export const DEEP_MAGIC_2020_WARLOCK_CORRECTIONS: Readonly<Record<string, boolean>> = {
  'Angelic Guardian': false,
  Benediction: false,
  'Blade of Wrath': false,
  'Blazing Chariot': false,
  'Blessed Halo': false,
  'Create Ring Servant': false,
  'Deva’s Wings': false,
  'Enchant Ring': false,
  'Greater Seal of Sanctuary': false,
  'Heavenly Crown': false,
  Misstep: false,
  Quintessence: false,
  'Ring Ward': false,
  'Seal of Sanctuary': false,
  'Volley Shield': false,
  'Walk the Twisted Path': false
}

export const DEEP_MAGIC_2020_SORCERER_CORRECTIONS: Readonly<Record<string, boolean>> = {
  'Blood and Steel': false,
  'Calm of the Storm': false,
  Heartstop: false,
  'Mass Surge Dampener': false,
  'Paragon of Chaos': false,
  'Surge Dampener': false,
  'Wild Shield': false
}

export const DEEP_MAGIC_2020_CLERIC_CORRECTIONS: Readonly<Record<string, boolean>> = {
  Harry: false,
  Heartstop: false,
  Maim: false,
  Misstep: false
}

export const DEEP_MAGIC_2020_DRUID_CORRECTIONS: Readonly<Record<string, boolean>> = {
  'Icicle Daggers': false
}

export const DEEP_MAGIC_2020_WIZARD_CORRECTIONS: Readonly<Record<string, boolean>> = {
  'Heart-Seeking Arrow': true,
  Nightfall: false,
  'Seeping Death': false,
  'Stench of Rot': false
}

export const DEEP_MAGIC_2020_RITUAL_HOLDS = [
  'Afflict Line',
  'Bloom',
  'Celebration',
  'Clearing the Field',
  'Desolation',
  'Encroaching Shadows',
  'Guest of Honor',
  'Shadows Brought to Light',
  'Shadowy Retribution',
  'Song of the Forest',
  'Vine Trestle'
] as const

export const ERRATA: Readonly<
  Record<
    string,
    {
      fields?: Partial<Pick<Spell, 'castingTime' | 'range'>>
      replacements?: readonly { before: string; after: string }[]
      append?: string
    }
  >
> = {
  'Animated Scroll': {
    replacements: [
      {
        before:
          'It follows your commands to the best of its ability, including carrying messages to a recipient whose location you know.',
        after:
          'It follows your commands to the best of its ability, including carrying messages to a recipient whose location you know.\n\nYou can’t have more than one animated paper animal at a time. If you cast this spell while you already have an animated paper animal, you instead cause it to adopt a new form. Choose any beast that has a challenge rating of 0. Your animated paper animal transforms into the chosen creature.'
      }
    ]
  },
  'Memento Mori': {
    fields: { range: '5 feet' },
    replacements: [
      {
        before:
          'Each creature that can see you must succeed on a Charisma saving throw or be stunned until the end of your next turn.',
        after:
          'Each creature within range that can see you must succeed on a Charisma saving throw or be stunned until the end of its next turn.'
      }
    ]
  },
  'Torrent of Fire': { fields: { castingTime: '1 action' } },
  'Thunder Bolt': {
    append:
      'The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).'
  },
  'Shadow Hands': {
    replacements: [
      {
        before:
          'Any creature caught in the shadow takes 2d4 necrotic damage and is frightened; a successful Wisdom saving throw halves the damage and negates the frightened condition.',
        after:
          'Any creature caught in the shadow takes 2d4 necrotic damage and is frightened until the end of its next turn; a successful Wisdom saving throw halves the damage and negates the frightened condition.'
      }
    ]
  },
  Slither: {
    replacements: [
      {
        before: '\n\n\n**At Higher Levels.**',
        after:
          '\n\nWhile in shadow form, you can’t talk or manipulate objects, and any objects you are carrying or holding can’t be dropped, used, or otherwise interacted with. In addition, you can’t attack or cast spells while in shadow form.\n\n**At Higher Levels.**'
      }
    ]
  }
}

export const BOOK_TEXT_TAILS: Readonly<
  Record<string, { id: string; page: number; suffix: string }>
> = {
  'Hobble Mount': {
    id: 'kobold-press-deepm:hobble-mount',
    page: 81,
    suffix:
      '\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d6 for each slot level above 1st.'
  },
  'Mass Hobble Mount': {
    id: 'kobold-press-deepm:mass-hobble-mount',
    page: 95,
    suffix:
      '\n\nThis spell has no effect on a creature that your GM deems to not be a mount.\n\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.'
  },
  Drown: {
    id: 'kobold-press-deepm:drown',
    page: 65,
    suffix:
      '\n\nNOTE: Midgard Heroes Handbook has a very different [drown-heroes-handbook/drown](https://api.open5e.com/spells/drown) spell.'
  },
  'Candle’s Insight': {
    id: 'kobold-press-deepm:candles-insight',
    page: 48,
    suffix:
      '\n\n**Candle’s insight** is used across society: by merchants while negotiating deals, by inquisitors investigating heresy, and by monarchs as they interview foreign diplomats. In some societies, casting candle’s insight without the consent of the spell’s target is considered a serious breach of hospitality.'
  },
  'Freeze Blood': {
    id: 'kobold-press-deepm:freeze-blood',
    page: 272,
    suffix: '\n\nNOTE: This was previously a 5th-level spell that did 4d10 cold damage.'
  }
}

export const TRANSCRIPTION_CORRECTIONS: Readonly<
  Record<string, { id: string; page: number; before: string; after: string }>
> = {
  Bloodhound: {
    id: 'kobold-press-deepm:bloodhound',
    page: 46,
    before: 'using a 3rd-level spell slot,',
    after: 'using a spell slot of 3rd level or higher,'
  },
  'Conjure Spectral Dead': {
    id: 'kobold-press-deepm:conjure-spectral-dead',
    page: 55,
    before: 'or one [will-o’-wisp](https://api.open5e.com/monsters/will-o-wisp).',
    after:
      'or one [ghost](https://api.open5e.com/monsters/ghost) or a [wight](https://api.open5e.com/monsters/wight).'
  },
  'Heart to Heart': {
    id: 'kobold-press-deepm:heart-to-heart',
    page: 80,
    before: 'remain stable and unconscious if reduced to 0 hit points',
    after: 'remain stable and unconscious if one of you is reduced to 0 hit points'
  },
  'Killing Fields': {
    id: 'kobold-press-deepm:killing-fields',
    page: 89,
    before:
      "   ***Pack Hunters.*** A helped creature has advantage on attack rolls against a hindered creature if at least one helped ally is within 5 feet of the hindered creature and the helped ally isn't incapacitated. Slaying. Once per turn, when a helped creature hits with any weapon, the weapon deals an extra 1d6 damage of its type to a hindered creature. Tracking. A helped creature has advantage on Wisdom (Survival) and Dexterity (Stealth) checks against a hindered creature.",
    after:
      "\n**Pack Hunters.** A helped creature has advantage on attack rolls against a hindered creature if at least one helped ally is within 5 feet of the hindered creature and the helped ally isn't incapacitated.\n\n**Slaying.** Once per turn, when a helped creature hits with any weapon, the weapon deals an extra 1d6 damage of the same type dealt by its weapon to a hindered creature.\n\n**Tracking.** A helped creature has advantage on Wisdom (Survival) and Dexterity (Stealth) checks against a hindered creature."
  },
  'Frenzied Bolt': {
    id: 'kobold-press-deepm:frenzied-bolt',
    page: 185,
    before: 'Poision',
    after: 'Poison'
  },
  'Hedren’s Birds of Clay': {
    id: 'kobold-press-deepm:hedrens-birds-of-clay',
    page: 81,
    before: 'add 1 to your to your roll',
    after: 'add 1 to your roll'
  }
}

export const MISSPELLED_CLASS_CARDS = [
  'Dead Walking',
  'Frenzied Bolt',
  'Going in Circles',
  'Harry',
  'Harrying Hounds',
  'Heart to Heart',
  'Ill-Fated Word',
  'Maim',
  'Reposition'
] as const

export const DEEP_MAGIC_2020_HEADER_CORRECTIONS: Readonly<
  Record<
    string,
    {
      id: string
      page: number
      before: Partial<Pick<Spell, 'range' | 'duration' | 'school'>>
      after: Partial<Pick<Spell, 'range' | 'duration' | 'school'>>
    }
  >
> = {
  Bloodshot: {
    id: 'kobold-press-deepm:bloodshot',
    page: 320,
    before: { range: '40 feet' },
    after: { range: '30 feet' }
  },
  'Encrypt / Decrypt': {
    id: 'kobold-press-deepm:encrypt-decrypt',
    page: 67,
    before: { school: 'Transmutation' },
    after: { school: 'Alteration' }
  },
  'Bottled Arcana': {
    id: 'kobold-press-deepm:bottled-arcana',
    page: 166,
    before: { duration: '24 hours' },
    after: { duration: 'see below' }
  },
  'Curse of Yig': {
    id: 'kobold-press-deepm:curse-of-yig',
    page: 338,
    before: { duration: 'up to 1 hour' },
    after: { duration: 'up to 10 minutes' }
  },
  'Glyph of Shifting': {
    id: 'kobold-press-deepm:glyph-of-shifting',
    page: 76,
    before: { duration: 'instantaneous' },
    after: { duration: '24 hours' }
  },
  Harry: {
    id: 'kobold-press-deepm:harry',
    page: 79,
    before: { duration: 'up to instantaneous' },
    after: { duration: 'up to 1 hour' }
  },
  'Aura of Protection or Destruction': {
    id: 'kobold-press-deepm:aura-of-protection-or-destruction',
    page: 41,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot radius)' }
  },
  'Caustic Torrent': {
    id: 'kobold-press-deepm:caustic-torrent',
    page: 167,
    before: { range: 'Self' },
    after: { range: 'Self (60-foot line)' }
  },
  'Clash of Glaciers': {
    id: 'kobold-press-deepm:clash-of-glaciers',
    page: 270,
    before: { range: 'Self' },
    after: { range: 'Self (100-foot line)' }
  },
  'Destructive Resonance': {
    id: 'kobold-press-deepm:destructive-resonance',
    page: 332,
    before: { range: 'Self' },
    after: { range: 'Self (15-foot cone)' }
  },
  'Doom of Serpent Coils': {
    id: 'kobold-press-deepm:doom-of-serpent-coils',
    page: 63,
    before: { range: 'Self' },
    after: { range: 'Self (10-foot radius)' }
  },
  'Dragon Breath': {
    id: 'kobold-press-deepm:dragon-breath',
    page: 201,
    before: { range: 'Self' },
    after: { range: 'Self (15-foot cone or 30-foot line)' }
  },
  'Echoes of Steel': {
    id: 'kobold-press-deepm:echoes-of-steel',
    page: 67,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot radius)' }
  },
  'Fusillade of Ice': {
    id: 'kobold-press-deepm:fusillade-of-ice',
    page: 273,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot cone)' }
  },
  'Glacial Cascade': {
    id: 'kobold-press-deepm:glacial-cascade',
    page: 273,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot-radius sphere)' }
  },
  'Heavenly Crown': {
    id: 'kobold-press-deepm:heavenly-crown',
    page: 80,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot radius)' }
  },
  'Keening Wail': {
    id: 'kobold-press-deepm:keening-wail',
    page: 88,
    before: { range: 'Self' },
    after: { range: 'Self (15-foot cone)' }
  },
  'Lay to Rest': {
    id: 'kobold-press-deepm:lay-to-rest',
    page: 91,
    before: { range: 'Self' },
    after: { range: 'Self (15-foot-radius sphere)' }
  },
  'Mephitic Croak': {
    id: 'kobold-press-deepm:mephitic-croak',
    page: 167,
    before: { range: 'Self' },
    after: { range: 'Self (15-foot cone)' }
  },
  Quintessence: {
    id: 'kobold-press-deepm:quintessence',
    page: 178,
    before: { range: 'Self' },
    after: { range: 'Self (120-foot radius)' }
  },
  'Rolling Thunder': {
    id: 'kobold-press-deepm:rolling-thunder',
    page: 104,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot line)' }
  },
  'Semblance of Dread': {
    id: 'kobold-press-deepm:semblance-of-dread',
    page: 341,
    before: { range: 'Self' },
    after: { range: 'Self (10-foot radius)' }
  },
  'Shadow Hands': {
    id: 'kobold-press-deepm:shadow-hands',
    page: 252,
    before: { range: 'Self' },
    after: { range: 'Self (10-foot cone)' }
  },
  'Sign of Koth': {
    id: 'kobold-press-deepm:sign-of-koth',
    page: 341,
    before: { range: 'Self' },
    after: { range: 'Self (60-foot radius)' }
  },
  'Sleep of the Deep': {
    id: 'kobold-press-deepm:sleep-of-the-deep',
    page: 342,
    before: { range: '60 feet' },
    after: { range: '60-foot radius' }
  },
  'Steam Whistle': {
    id: 'kobold-press-deepm:steam-whistle',
    page: 110,
    before: { range: 'Self' },
    after: { range: 'Self (30-foot radius)' }
  },
  'Tidal Barrier': {
    id: 'kobold-press-deepm:tidal-barrier',
    page: 116,
    before: { range: 'Self' },
    after: { range: 'Self (10-foot radius)' }
  },
  'Voorish Sign': {
    id: 'kobold-press-deepm:voorish-sign',
    page: 343,
    before: { range: 'Self' },
    after: { range: 'Self (20-foot radius)' }
  },
  'Wind Tunnel': {
    id: 'kobold-press-deepm:wind-tunnel',
    page: 122,
    before: { range: 'Self' },
    after: { range: 'Self (60-foot line)' }
  },
  "Winter's Radiance": {
    id: 'kobold-press-deepm:winters-radiance',
    page: 278,
    before: { range: '400 feet' },
    after: { range: '400 feet (30-foot cube)' }
  }
}
