// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone
//
// License by layer — this file mixes code, open game data, and protected content:
//   • Code (this module, its types and structure): AGPL-3.0-or-later, per the SPDX line
//     above, like the rest of the tooling.
//   • Stat blocks / mechanics — every creature field EXCEPT `description`: original OpenFray
//     content under CC-BY-4.0. Reuse the crunch, with attribution to OpenFray.
//   • Lore, art, and prose — each creature's `description` text, plus any future images and
//     "family" lore: © OpenFray, all rights reserved. Shown in the app, but not licensed
//     for reuse — don't copy it into other products.
// See CREDITS.md.

// "Brood & Bloom" — original OpenFray creatures (not SRD or third-party OGL content), so
// they are authored here directly rather than extracted from a PDF.

import type { Creature } from '../../schema/creature.ts'

export const parasitesAndLazaretCreatures: Creature[] = [
  {
    "id": "openfray-brood-and-bloom:latchling",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Latchling",
    "size": "Tiny",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A blind, mindless grub the size of a thumb joint. It fastens to a living creature and stays: its first feeding roots a graft, and days of feeding grow the latchling itself into the form its host’s nature sets. Every attaching parasite in this brood begins as a latchling, and every sated adult ends by laying a clutch of them.",
    "ac": 13,
    "maxHp": 5,
    "hpFormula": "2d4",
    "speed": {
      "walk": 20,
      "climb": 20,
      "swim": 20
    },
    "initiative": 3,
    "abilities": {
      "str": 2,
      "dex": 16,
      "con": 10,
      "int": 3,
      "wis": 10,
      "cha": 4
    },
    "skills": {
      "stealth": 7
    },
    "senses": {
      "blindsight": 10,
      "passivePerception": 10
    },
    "cr": 0,
    "xp": 10,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the latchling is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover."
      },
      {
        "name": "Extraction",
        "text": "While the latchling is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 10 Wisdom (Medicine) check. Success: The latchling is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 2 (1d4) Piercing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      }
    ],
    "actions": [
      {
        "id": "latch",
        "name": "Latch",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 1 Piercing damage, and if the target doesn’t already have a latchling attached, the latchling attaches to it."
      },
      {
        "id": "feed",
        "name": "Feed",
        "kind": "utility",
        "toHit": null,
        "text": "The latchling draws a thread of sustenance from its host. The host gains 1 Depth and, if it carries no graft, the feeding leaves one, of the line the host’s own body sets (see What a graft is). The host notices nothing until later, as a faint tiredness following its next Long Rest. Growth: A latchling that stays attached to a host for 1d4 + 2 days grows into the form set by the host’s highest ability score — a physical score (Strength, Dexterity, or Constitution) makes a Mudspit Cyst; Intelligence, a Chantry Louse; Wisdom or Charisma, a Gaol Worm. The graft it left belongs to the same line."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the latchling relocates within it. The next Extraction check made against the latchling before the start of its next turn has Disadvantage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:mudspit-cyst",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Mudspit Cyst",
    "size": "Tiny",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A weeping gray-green sac that rides a strong or hardy host through swamp and floodplain, drinking off its vigor. It is what a latchling becomes on a body whose strength was the best thing on offer, and the first rung of the sallow line. Fed long enough, it deepens into a sallow fluke.",
    "ac": 12,
    "maxHp": 10,
    "hpFormula": "4d4",
    "speed": {
      "walk": 10,
      "swim": 20
    },
    "initiative": 2,
    "abilities": {
      "str": 4,
      "dex": 14,
      "con": 10,
      "int": 2,
      "wis": 10,
      "cha": 4
    },
    "skills": {
      "stealth": 4
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 10
    },
    "cr": 0.25,
    "xp": 50,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the cyst is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the cyst that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the cyst is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 11 Wisdom (Medicine) check. Success: The cyst is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 2 (1d4) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Water-Bound",
        "text": "The cyst dies if it ends an hour neither attached to a creature nor immersed in fresh water."
      }
    ],
    "actions": [
      {
        "id": "latch",
        "name": "Latch",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d4+2",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) Piercing damage. If the target is a creature that doesn’t already have a cyst attached, the cyst attaches to it."
      },
      {
        "id": "sap",
        "name": "Sap",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "1d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 10,
          "onSave": "half"
        },
        "text": "While attached to a host, the cyst draws off the fluid in its legs. Constitution Saving Throw: DC 10, the host. Failure: 3 (1d6) Poison damage, and the host’s Speed decreases by 5 feet. Success: Half damage only, and the host’s Speed doesn’t decrease. Failure or Success: The host gains 1 Depth, and if it carries no sallow graft, the feeding leaves one. If the host’s Speed drops to 0, it has the Prone condition and can’t stand up. Speed reductions last until the host finishes a Short or Long Rest with no cyst attached."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the cyst relocates within it. The next Extraction check made against the cyst before the start of its next turn has Disadvantage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:sallow-fluke",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Sallow Fluke",
    "size": "Tiny",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A flat, pale ribbon of muscle folded against the host's spine, working the body like a bellows to draw off strength and breath. When it has taken enough, it drops away into warm mud to lay, and the cycle starts again.",
    "ac": 13,
    "maxHp": 22,
    "hpFormula": "5d4+10",
    "speed": {
      "walk": 5,
      "swim": 30
    },
    "initiative": 3,
    "abilities": {
      "str": 3,
      "dex": 16,
      "con": 14,
      "int": 4,
      "wis": 12,
      "cha": 6
    },
    "saves": {
      "dex": 5,
      "con": 4
    },
    "skills": {
      "stealth": 5
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 11
    },
    "cr": 1,
    "xp": 200,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the fluke is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the fluke that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the fluke is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 13 Wisdom (Medicine) check. Success: The fluke is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 3 (1d6) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Water-Bound",
        "text": "The fluke dies if it ends an hour neither attached to a creature nor immersed in fresh water."
      }
    ],
    "actions": [
      {
        "id": "bore",
        "name": "Bore",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage. If the target is a creature that doesn’t already have a fluke attached, the fluke attaches to it."
      },
      {
        "id": "deepen",
        "name": "Deepen",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d4",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "While attached to a host, the fluke feeds. Constitution Saving Throw: DC 12, the host. Failure: 5 (2d4) Necrotic damage, and the host’s Hit Point maximum decreases by an amount equal to the damage taken. Success: Half damage only, and the host’s Hit Point maximum doesn’t decrease. Failure or Success: The host gains 1 Depth, and if it carries no sallow graft, the feeding leaves one. If the host’s Hit Point maximum drops to 0, it dies. Reductions last until the host finishes a Long Rest with no fluke attached."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the fluke relocates within it. The next Extraction check made against the fluke before the start of its next turn has Disadvantage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:chantry-louse",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Chantry Louse",
    "size": "Tiny",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A black, chitinous tick the size of a fist that clings behind the ear and drinks the magic in a caster's blood. A latchling that fed on a body bright with magic hardens into one. Sated, it withdraws to a quiet, spell-soaked place to lay.",
    "ac": 14,
    "maxHp": 45,
    "hpFormula": "10d4+20",
    "speed": {
      "walk": 10,
      "climb": 20
    },
    "initiative": 3,
    "abilities": {
      "str": 5,
      "dex": 17,
      "con": 15,
      "int": 11,
      "wis": 14,
      "cha": 14
    },
    "saves": {
      "dex": 5,
      "wis": 4
    },
    "skills": {
      "arcana": 2,
      "stealth": 5
    },
    "resistances": [
      "Force",
      "Psychic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 12
    },
    "languages": [
      "understands Common but can’t speak"
    ],
    "cr": 3,
    "xp": 700,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the louse is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the louse that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the louse is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 14 Wisdom (Medicine) check. Success: The louse is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 5 (2d4) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Arcane Tropism",
        "text": "The louse has Advantage on attack rolls against a creature that is Concentrating or that has expended a spell slot since the end of the louse’s last turn."
      }
    ],
    "actions": [
      {
        "id": "proboscis",
        "name": "Proboscis",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "1d10+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 8 (1d10 + 3) Piercing damage. If the target is a creature that doesn’t already have a louse attached, the louse attaches to it."
      },
      {
        "id": "siphon",
        "name": "Siphon",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d6",
            "type": "force"
          },
          {
            "formula": "1d6",
            "type": "force"
          }
        ],
        "save": {
          "ability": "cha",
          "dc": 12,
          "onSave": "half"
        },
        "text": "While attached to a host, the louse drinks the magic in its blood. Charisma Saving Throw: DC 12, the host. Failure: 10 (3d6) Force damage, and the host loses its lowest-level unexpended spell slot. Success: Half damage only, and the host loses no slot. Failure or Success: The host gains 1 Depth, and if it carries no chantry graft, the feeding leaves one. If the host has no unexpended spell slots, it takes an extra 3 (1d6) Force damage."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the louse relocates within it. The next Extraction check made against the louse before the start of its next turn has Disadvantage."
      }
    ],
    "reactions": [
      {
        "id": "backwash",
        "name": "Backwash",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d6",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "Trigger: The host casts a spell with a level of 1 or higher. Response: Constitution Saving Throw: DC 12, the host. Failure: 7 (2d6) Psychic damage, and the host has Disadvantage on the next saving throw it makes to maintain Concentration. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:gaol-worm",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Gaol Worm",
    "size": "Small",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A long, sightless burrower that threads down the spine of a wise or strong-willed host and feeds on memory, walling off recollection a piece at a time. Its host stops truly resting. Given years and enough forgetting, it thickens toward the palimpsest wyrm.",
    "ac": 15,
    "maxHp": 85,
    "hpFormula": "10d6+50",
    "speed": {
      "walk": 20,
      "burrow": 20
    },
    "initiative": 3,
    "abilities": {
      "str": 12,
      "dex": 17,
      "con": 20,
      "int": 5,
      "wis": 14,
      "cha": 7
    },
    "saves": {
      "con": 8,
      "wis": 5
    },
    "skills": {
      "stealth": 6
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "tremorsense": 60,
      "passivePerception": 12
    },
    "cr": 6,
    "xp": 2300,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the worm is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the worm that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the worm is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 16 Wisdom (Medicine) check. Success: The worm is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 7 (2d6) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Sleepless",
        "text": "A creature that has a gaol worm attached gains no benefit from a Long Rest."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The worm makes two Rasp attacks."
      },
      {
        "id": "rasp",
        "name": "Rasp",
        "kind": "melee",
        "toHit": 6,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +6, reach 5 ft. Hit: 12 (2d8 + 3) Piercing damage. If the target is a creature that doesn’t already have a worm attached, the worm attaches to it."
      },
      {
        "id": "wear-down",
        "name": "Wear Down",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d8",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "text": "While attached to a host, the worm keeps it from ever resting. Constitution Saving Throw: DC 16, the host. Failure: 18 (4d8) Necrotic damage, and the host gains 1 Exhaustion level. Success: Half damage only, and the host gains no Exhaustion level. Failure or Success: The host gains 1 Depth, and if it carries no palimpsest graft, the feeding leaves one."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the worm relocates within it. The next Extraction check made against the worm before the start of its next turn has Disadvantage."
      }
    ],
    "reactions": [
      {
        "id": "convulse",
        "name": "Convulse",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d8",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "text": "Trigger: The worm takes damage while attached to a host. Response: Constitution Saving Throw: DC 16, the host. Failure: 9 (2d8) Necrotic damage, and the host has the Poisoned condition until the end of its next turn. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:palimpsest-wyrm",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Palimpsest Wyrm",
    "size": "Medium",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "The memory line's final shape: a coiled, pale thing grown fat on stolen recollection. It does not merely eat a mind — it overwrites one, smearing the host's memories under the record of everything it has taken before. It lays where the dead are kept, so its latchlings hatch surrounded by minds.",
    "ac": 17,
    "maxHp": 161,
    "hpFormula": "19d8+76",
    "speed": {
      "walk": 20,
      "climb": 20,
      "swim": 30
    },
    "initiative": 4,
    "abilities": {
      "str": 10,
      "dex": 18,
      "con": 18,
      "int": 18,
      "wis": 16,
      "cha": 15
    },
    "saves": {
      "dex": 8,
      "con": 8,
      "int": 8,
      "wis": 7
    },
    "skills": {
      "deception": 6,
      "insight": 7,
      "perception": 7,
      "stealth": 8
    },
    "resistances": [
      "Cold",
      "Necrotic"
    ],
    "immunities": [
      "Poison",
      "Psychic"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "truesight": 60,
      "passivePerception": 17
    },
    "languages": [
      "Deep Speech",
      "telepathy 120 ft."
    ],
    "cr": 11,
    "xp": 7200,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the wyrm is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the wyrm that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the wyrm is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 19 Wisdom (Medicine) check. Success: The wyrm is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 13 (3d8) Slashing damage. A Greater Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Written Over",
        "text": "While attached to a host, the wyrm knows everything the host knows, can speak in the host’s voice, and has Advantage on Charisma (Deception) checks made to impersonate it."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The wyrm makes two Stylus attacks. It can replace one attack with a use of Overwrite if it is attached to a host."
      },
      {
        "id": "stylus",
        "name": "Stylus",
        "kind": "melee",
        "toHit": 8,
        "reach": 10,
        "damage": [
          {
            "formula": "2d10+4",
            "type": "piercing"
          },
          {
            "formula": "2d8",
            "type": "psychic"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 10 ft. Hit: 15 (2d10 + 4) Piercing damage plus 9 (2d8) Psychic damage. If the target is a creature that doesn’t already have a wyrm attached, the wyrm attaches to it."
      },
      {
        "id": "overwrite",
        "name": "Overwrite",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d10",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "int",
          "dc": 16,
          "onSave": "half"
        },
        "text": "While attached to a host, the wyrm rewrites what it finds there. Intelligence Saving Throw: DC 16, the host. Failure: 22 (4d10) Psychic damage, and the host’s Intelligence, Wisdom, or Charisma score (the wyrm’s choice) decreases by 2. Success: Half damage only, and no score decreases. Failure or Success: The host gains 1 Depth, and if it carries no palimpsest graft, the feeding leaves one. If any of the host’s scores drops to 0, the host has the Unconscious condition until it finishes a Long Rest. Score reductions last until removed by a Greater Restoration spell or similar magic."
      },
      {
        "id": "erase",
        "name": "Erase",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "wis",
          "dc": 16,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Wisdom Saving Throw: DC 16, each creature in a 30-foot Emanation originating from the wyrm. Failure: 27 (6d8) Psychic damage, and the target can’t use any feature or trait that has a limited number of uses until the end of its next turn. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the wyrm relocates within it. The next Extraction check made against the wyrm before the start of its next turn has Disadvantage."
      }
    ],
    "reactions": [
      {
        "id": "bleed-through",
        "name": "Bleed Through",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d8",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "text": "Trigger: The wyrm takes damage while attached to a host. Response: Constitution Saving Throw: DC 16, the host. Failure: 13 (3d8) Psychic damage. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:latchling-clutch",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Latchling Clutch",
    "size": "Medium",
    "type": "swarm of tiny aberrations",
    "alignment": "unaligned",
    "description": "Two or three hundred latchlings moving as one sheet across mud, stone, or standing water. A clutch has no purpose beyond finding bodies, and no tactics beyond arithmetic: a single latchling gets one chance to fasten, and a clutch gets three hundred.",
    "ac": 13,
    "maxHp": 90,
    "hpFormula": "12d8+36",
    "speed": {
      "walk": 20,
      "climb": 20,
      "swim": 20
    },
    "initiative": 3,
    "abilities": {
      "str": 6,
      "dex": 16,
      "con": 16,
      "int": 3,
      "wis": 10,
      "cha": 4
    },
    "skills": {
      "stealth": 5
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Prone",
      "Restrained",
      "Stunned"
    ],
    "senses": {
      "blindsight": 10,
      "passivePerception": 10
    },
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Swarm",
        "text": "The clutch can occupy another creature’s space and vice versa, and it can move through any opening large enough for a Tiny creature. It can’t regain Hit Points or gain Temporary Hit Points."
      },
      {
        "name": "Everywhere at Once",
        "text": "A creature makes saving throws against the clutch’s Seethe with Disadvantage."
      },
      {
        "name": "Fastened",
        "text": "A latchling that fastens to a creature uses the Latchling stat block and is attached to it. Each one must be removed by its own Extraction check, or a single Lesser Restoration spell cast on the host detaches every latchling attached to it at once. What a fastened latchling does next is its Feed action."
      }
    ],
    "actions": [
      {
        "id": "seethe",
        "name": "Seethe",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 13, each creature in the clutch’s space. Failure: 14 (4d6) Piercing damage, and 1d4 + 1 latchlings fasten to the target. Success: Half damage only, and one latchling fastens to the target."
      },
      {
        "id": "disperse",
        "name": "Disperse",
        "kind": "utility",
        "toHit": null,
        "text": "The clutch scatters into cover and is no longer a creature. It reforms in the same space at the start of its next turn, and until then it can’t be targeted or damaged. It can’t use this action if it has taken Fire damage since the end of its last turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:mire-ambulant",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Mire Ambulant",
    "size": "Medium",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A fluke grown to the length of an arm, with a broad muscular foot along its underside. It walks wet ground at a man's pace with its upper third raised, and it no longer depends on finding a host. It fastens on when it chooses to.",
    "ac": 15,
    "maxHp": 104,
    "hpFormula": "11d8+55",
    "speed": {
      "walk": 30,
      "swim": 40
    },
    "initiative": 2,
    "abilities": {
      "str": 16,
      "dex": 14,
      "con": 20,
      "int": 6,
      "wis": 12,
      "cha": 8
    },
    "saves": {
      "con": 7
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 11
    },
    "cr": 4,
    "xp": 1100,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the ambulant is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the ambulant that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the ambulant is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 15 Wisdom (Medicine) check. Success: The ambulant is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 9 (2d8) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Water-Bound",
        "text": "The ambulant dies if it ends an hour neither attached to a creature nor immersed in fresh water."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The ambulant makes two Bore attacks. It can replace one attack with a use of Deepen."
      },
      {
        "id": "bore",
        "name": "Bore",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "2d10+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 13 (2d10 + 3) Piercing damage. If the target is a creature that doesn’t already have an inquiline attached, the ambulant attaches to it."
      },
      {
        "id": "deepen",
        "name": "Deepen",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d10",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "text": "While attached to a host, the ambulant feeds. Constitution Saving Throw: DC 15, the host. Failure: 11 (2d10) Necrotic damage, and the host’s Hit Point maximum decreases by an amount equal to the damage taken. Success: Half damage only, and the Hit Point maximum doesn’t decrease. Failure or Success: The host gains 1 Depth, and if it carries no sallow graft, the feeding leaves one."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the ambulant relocates within it. The next Extraction check made against the ambulant before the start of its next turn has Disadvantage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:quagdam",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Quagdam",
    "size": "Large",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "The end of the sallow line: a pale sac the size of a rowing boat, half sunk in mud, ringed by the boring mouths of its partly grown young. It never leaves the water. It spends its life producing latchlings and feeding on whatever comes to the edge.",
    "ac": 17,
    "maxHp": 138,
    "hpFormula": "12d10+72",
    "speed": {
      "walk": 20,
      "swim": 50
    },
    "initiative": 1,
    "abilities": {
      "str": 20,
      "dex": 12,
      "con": 22,
      "int": 7,
      "wis": 14,
      "cha": 10
    },
    "saves": {
      "con": 10,
      "wis": 6
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 90,
      "passivePerception": 12
    },
    "cr": 9,
    "xp": 5000,
    "traits": [
      {
        "name": "Water-Bound",
        "text": "The quagdam dies if it ends an hour out of fresh water."
      },
      {
        "name": "Gravid",
        "text": "The quagdam carries a clutch at all times. When it drops to 0 Hit Points, a Latchling Clutch emerges from the body in its space."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The quagdam makes three Bore attacks. It can replace one attack with a use of Draw Down."
      },
      {
        "id": "bore",
        "name": "Bore",
        "kind": "melee",
        "toHit": 9,
        "reach": 10,
        "damage": [
          {
            "formula": "4d8+5",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +9, reach 10 ft. Hit: 22 (4d8 + 5) Piercing damage."
      },
      {
        "id": "draw-down",
        "name": "Draw Down",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d10",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 18,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 18, one creature the quagdam can see within 30 feet. Failure: 22 (4d10) Necrotic damage, the target’s Hit Point maximum decreases by an amount equal to the damage taken, and the quagdam regains Hit Points equal to half the damage. Success: Half damage only, and the Hit Point maximum doesn’t decrease. Failure or Success: The target gains 1 Depth, and if it carries no sallow graft, the feeding leaves one."
      }
    ],
    "reactions": [
      {
        "id": "spill",
        "name": "Spill",
        "kind": "utility",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "piercing"
          }
        ],
        "text": "Trigger: The quagdam takes 20 damage or more from a single attack. Response: Partly grown young come out of the wound. Each creature within 10 feet of the quagdam makes a DC 18 Dexterity saving throw, taking 14 (4d6) Piercing damage on a failed save or half as much on a successful one."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:psalter-tick",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Psalter Tick",
    "size": "Small",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "A fist of something between chitin and slate, marked across the back with pale lines that read as writing in no known hand. It is a chantry louse grown past its shell twice over — or a chantry graft that finished its work and climbed out already this size. It has begun to use the magic it takes.",
    "ac": 16,
    "maxHp": 142,
    "hpFormula": "19d6+76",
    "speed": {
      "walk": 20,
      "climb": 30
    },
    "initiative": 4,
    "abilities": {
      "str": 8,
      "dex": 18,
      "con": 18,
      "int": 14,
      "wis": 14,
      "cha": 16
    },
    "saves": {
      "dex": 7,
      "wis": 5
    },
    "skills": {
      "arcana": 5,
      "stealth": 7
    },
    "resistances": [
      "Force",
      "Psychic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 12
    },
    "languages": [
      "understands Common and Deep Speech but can’t speak"
    ],
    "cr": 7,
    "xp": 2900,
    "traits": [
      {
        "name": "Embedded",
        "text": "While the tick is attached to a creature, it occupies that creature’s space, moves with it, and has Half Cover. An attack roll against the tick that misses by 5 or less hits the host instead, dealing the attack’s damage to the host."
      },
      {
        "name": "Extraction",
        "text": "While the tick is attached, a creature within 5 feet of the host can take the Utilize action to make a DC 16 Wisdom (Medicine) check. Success: The tick is no longer attached and lands in an unoccupied space within 5 feet of the host. Failure: The host takes 10 (3d6) Slashing damage. A Lesser Restoration spell cast on the host also ends the attachment."
      },
      {
        "name": "Arcane Tropism",
        "text": "The tick has Advantage on attack rolls against a creature that is Concentrating or that has expended a spell slot since the end of the tick’s last turn."
      },
      {
        "name": "Stolen Slots",
        "text": "The tick keeps every spell slot it takes with Siphon, to a maximum of five at a time. It can expend one to cast a spell of that level or lower from the list below, using Charisma as its spellcasting ability (spell save DC 14).\n\nSpells: Detect Magic, Exacerbation, Magic Missile, Misty Step, Chantry Tithe, Counterspell, Dispel Magic"
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The tick makes two Proboscis attacks. It can replace one attack with a use of Siphon or with one spell."
      },
      {
        "id": "proboscis",
        "name": "Proboscis",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "3d10+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 20 (3d10 + 4) Piercing damage. If the target is a creature that doesn’t already have an inquiline attached, the tick attaches to it."
      },
      {
        "id": "siphon",
        "name": "Siphon",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "5d6",
            "type": "force"
          },
          {
            "formula": "2d6",
            "type": "force"
          }
        ],
        "save": {
          "ability": "cha",
          "dc": 15,
          "onSave": "half"
        },
        "text": "While attached to a host, the tick drinks the magic in its blood. Charisma Saving Throw: DC 15, the host. Failure: 17 (5d6) Force damage, and the host loses its lowest-level unexpended spell slot, which the tick keeps. Success: Half damage only, and the host loses no slot. Failure or Success: The host gains 1 Depth, and if it carries no chantry graft, the feeding leaves one. If the host has no unexpended spell slots, it takes an extra 7 (2d6) Force damage."
      }
    ],
    "bonusActions": [
      {
        "id": "shift-anchor",
        "name": "Shift Anchor",
        "kind": "utility",
        "toHit": null,
        "text": "While attached to a host, the tick relocates within it. The next Extraction check made against the tick before the start of its next turn has Disadvantage."
      }
    ],
    "reactions": [
      {
        "id": "backwash",
        "name": "Backwash",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d6",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "text": "Trigger: The host casts a spell with a level of 1 or higher. Response: Constitution Saving Throw: DC 15, the host. Failure: 10 (3d6) Psychic damage, and the host has Disadvantage on the next saving throw it makes to maintain Concentration. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:choirgall",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Choirgall",
    "size": "Medium",
    "type": "aberration",
    "alignment": "unaligned",
    "description": "The last chantry stage: a hollow shell of bone and hardened tissue the size of a bell, grown outward through the caster it finished on. It has taken enough magic to make its own, and what comes out of it is closer to sound than to spellwork.",
    "ac": 17,
    "maxHp": 195,
    "hpFormula": "23d8+92",
    "speed": {
      "walk": 30,
      "climb": 30
    },
    "initiative": 11,
    "abilities": {
      "str": 12,
      "dex": 16,
      "con": 18,
      "int": 18,
      "wis": 16,
      "cha": 20
    },
    "saves": {
      "con": 8,
      "int": 8,
      "wis": 7,
      "cha": 9
    },
    "skills": {
      "arcana": 8,
      "perception": 7
    },
    "resistances": [
      "Force",
      "Psychic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Deafened",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "blindsight": 60,
      "truesight": 30,
      "passivePerception": 17
    },
    "languages": [
      "Common",
      "Deep Speech"
    ],
    "cr": 12,
    "xp": 8400,
    "legendaryResistance": 3,
    "spellcasting": {
      "ability": "cha",
      "saveDc": 17,
      "toHit": 9,
      "groups": [
        {
          "usage": {
            "type": "atWill"
          },
          "spells": [
            {
              "name": "anamnesis",
              "ref": "openfray-brood-and-bloom:anamnesis"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 1
          },
          "spells": [
            {
              "name": "bloom interdict",
              "ref": "openfray-brood-and-bloom:bloom-interdict"
            }
          ]
        }
      ]
    },
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the choirgall fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Arcane Tropism",
        "text": "The choirgall has Advantage on attack rolls against a creature that is Concentrating or that has expended a spell slot since the end of the choirgall’s last turn."
      },
      {
        "name": "Sympathetic Resonance",
        "text": "Whenever a creature within 60 feet of the choirgall casts a spell of level 1 or higher, the choirgall gains 5 Temporary Hit Points and its next Antiphon deals an extra 5 (2d4) Force damage."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The choirgall makes three Chime attacks. It can replace one attack with a use of Antiphon."
      },
      {
        "id": "chime",
        "name": "Chime",
        "kind": "melee",
        "toHit": 9,
        "reach": 10,
        "damage": [
          {
            "formula": "2d10+3",
            "type": "bludgeoning"
          },
          {
            "formula": "2d8",
            "type": "force"
          }
        ],
        "text": "Melee Attack Roll: +9, reach 10 ft. Hit: 14 (2d10 + 3) Bludgeoning damage plus 9 (2d8) Force damage."
      },
      {
        "id": "antiphon",
        "name": "Antiphon",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "8d8",
            "type": "force"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 17,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "The shell sounds once, and the note arrives everywhere at the same moment. Constitution Saving Throw: DC 17, each creature in a 30-foot Emanation originating from the choirgall. Failure: 36 (8d8) Force damage, and the target can’t cast a spell that requires a Verbal component until the end of its next turn. Success: Half damage only."
      },
      {
        "id": "unmake",
        "name": "Unmake",
        "kind": "utility",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "force"
          }
        ],
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "The choirgall picks a magical effect apart rather than dispelling it. Choose one magical effect within 60 feet that is a spell of level 5 or lower. The effect ends, and the creature that created it takes 27 (6d8) Force damage and has Disadvantage on the next spell attack roll it makes."
      }
    ],
    "reactions": [
      {
        "id": "discord",
        "name": "Discord",
        "kind": "utility",
        "toHit": null,
        "damage": [
          {
            "formula": "2d8",
            "type": "psychic"
          }
        ],
        "text": "Trigger: A creature within 60 feet of the choirgall succeeds on a saving throw against one of its effects. Response: That creature takes 9 (2d8) Psychic damage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lacuna",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lacuna",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "neutral",
    "description": "A caster with the magic taken out, and more than the magic. A lacuna eats, sleeps, and answers to its name, and there is nothing behind any of it. Left alone, it goes through the motions of its old work in its old places for as long as someone keeps feeding it.",
    "ac": 12,
    "maxHp": 91,
    "hpFormula": "14d8+28",
    "speed": {
      "walk": 30
    },
    "initiative": 1,
    "abilities": {
      "str": 12,
      "dex": 12,
      "con": 14,
      "int": 8,
      "wis": 10,
      "cha": 3
    },
    "conditionImmunities": [
      "Charmed",
      "Frightened"
    ],
    "senses": {
      "passivePerception": 10
    },
    "languages": [
      "the languages it knew before"
    ],
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Nothing to Take",
        "text": "No inquiline will graft to a lacuna, and none can feed on one. Effects that read, compel, or alter a creature’s mind fail against it, because there is nothing left in the way that such effects need something to work on."
      },
      {
        "name": "Drawn to Casting",
        "text": "On its turn, the lacuna moves toward the nearest creature it can see that has cast a spell since the start of the lacuna’s last turn, and attacks that creature if it can reach it. It does not attack anything else while such a creature is in sight."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The lacuna makes two Strike attacks."
      },
      {
        "id": "strike",
        "name": "Strike",
        "kind": "melee",
        "toHit": 3,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+1",
            "type": "bludgeoning"
          }
        ],
        "text": "Melee Attack Roll: +3, reach 5 ft. Hit: 11 (2d8 + 1) Bludgeoning damage."
      }
    ],
    "reactions": [
      {
        "id": "empty-casting",
        "name": "Empty Casting",
        "kind": "save",
        "toHit": null,
        "save": {
          "ability": "wis",
          "dc": 12,
          "onSave": "negates"
        },
        "text": "Trigger: A creature the lacuna can see within 30 feet casts a spell. Response: The lacuna performs the same words and gestures alongside it, correctly and completely, and nothing happens. Wisdom Saving Throw: DC 12, the triggering creature. Failure: The creature has Disadvantage on attack rolls against the lacuna until the end of its next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:amanuensis",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Amanuensis",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "neutral evil",
    "description": "A complete person assembled out of other people. The wyrm that left its spine is long gone; what remains walks, talks, remembers, and holds opinions, running on memories that were never its own — and it is entirely convinced they are.",
    "ac": 14,
    "maxHp": 136,
    "hpFormula": "16d8+64",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 14,
      "dex": 14,
      "con": 18,
      "int": 16,
      "wis": 14,
      "cha": 18
    },
    "saves": {
      "wis": 5,
      "cha": 7
    },
    "skills": {
      "deception": 10,
      "insight": 5,
      "perception": 5,
      "persuasion": 7
    },
    "conditionImmunities": [
      "Charmed"
    ],
    "senses": {
      "passivePerception": 15
    },
    "languages": [
      "Common and every language any of its sources knew"
    ],
    "cr": 5,
    "xp": 1800,
    "traits": [
      {
        "name": "Insists",
        "text": "The amanuensis believes it is who it was. It cannot be detected as lying about its own identity or history by any magical means, including a Zone of Truth spell, because it is not lying."
      },
      {
        "name": "Borrowed Hands",
        "text": "The amanuensis has proficiency in every skill and tool that any of its sources had. In practice a Game Master should let it be unexpectedly competent at one specific thing per scene."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The amanuensis makes two Strike attacks."
      },
      {
        "id": "strike",
        "name": "Strike",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "range": {
          "normal": 30,
          "long": 120
        },
        "damage": [
          {
            "formula": "4d6+2",
            "type": "bludgeoning"
          }
        ],
        "text": "Melee or Ranged Attack Roll: +5, reach 5 ft. or range 30/120 ft. Hit: 17 (4d6 + 2) Bludgeoning, Piercing, or Slashing damage, depending on what it carries."
      }
    ],
    "reactions": [
      {
        "id": "parry",
        "name": "Parry",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: The amanuensis is hit by a melee attack roll while it is holding a weapon. Response: It adds 3 to its Armor Class against that attack, possibly causing it to miss."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lancebill",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lancebill",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "A wading bird the height of a horse, gray-white and long-necked, standing motionless in the shallows for hours. Lancebills eat parasites and nothing else. They can tell an infected creature from a clean one at a hundred paces, and they take what they came for through whatever is in the way.",
    "ac": 15,
    "maxHp": 168,
    "hpFormula": "16d10+80",
    "speed": {
      "walk": 40,
      "swim": 40
    },
    "initiative": 4,
    "abilities": {
      "str": 18,
      "dex": 18,
      "con": 20,
      "int": 4,
      "wis": 16,
      "cha": 8
    },
    "saves": {
      "dex": 7,
      "wis": 6
    },
    "skills": {
      "perception": 9,
      "stealth": 10
    },
    "senses": {
      "darkvision": 60,
      "passivePerception": 19
    },
    "cr": 8,
    "xp": 3900,
    "traits": [
      {
        "name": "Parasite Sense",
        "text": "The lancebill knows the location of every creature within 120 feet that is carrying an inquiline or a graft, and can tell which."
      },
      {
        "name": "Standing",
        "text": "The lancebill has Advantage on Dexterity (Stealth) checks while it has not moved since the end of its last turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The lancebill makes three Bill attacks. It can replace one attack with a use of Lance."
      },
      {
        "id": "bill",
        "name": "Bill",
        "kind": "melee",
        "toHit": 7,
        "reach": 10,
        "damage": [
          {
            "formula": "3d8+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 10 ft. Hit: 18 (3d8 + 4) Piercing damage."
      },
      {
        "id": "lance",
        "name": "Lance",
        "kind": "melee",
        "toHit": 7,
        "reach": 15,
        "damage": [
          {
            "formula": "4d8+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 15 ft., one creature carrying an inquiline or a graft. Hit: 22 (4d8 + 4) Piercing damage, and the lancebill takes what it was aiming for. An attached inquiline is pulled off and swallowed, or a graft is drawn out whole and swallowed, ending the disease it was causing."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lazaret-registrar",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lazaret Registrar",
    "size": "Medium",
    "type": "humanoid",
    "ac": 12,
    "maxHp": 33,
    "speed": {
      "walk": 30
    },
    "abilities": {
      "str": 10,
      "dex": 14,
      "con": 13,
      "int": 18,
      "wis": 16,
      "cha": 12
    },
    "initiative": 2,
    "saves": {
      "int": 6,
      "wis": 5
    },
    "skills": {
      "history": 6,
      "insight": 5,
      "medicine": 5,
      "perception": 5
    },
    "senses": {
      "passivePerception": 15
    },
    "alignment": "lawful neutral",
    "hpFormula": "6d8+6",
    "languages": [
      "Common",
      "Deep Speech",
      "plus three other languages"
    ],
        "gear": [
      "Case of Files",
      "Lancet"
    ],
"cr": 1,
    "xp": 200,
    "description": "The order's records rank. A registrar keeps a house's files, copies them to the first house twice a year, and carries the current copy in person on the road. Most registrars never treat a patient; they read — and one who has read enough files recognizes nearly everything the broods can do to a body, and what was tried against it.",
    "traits": [
      {
        "name": "The Trained Eye",
        "text": "The registrar reads the broods’ marks on anything it can see within 30 feet, without a check: an attached inquiline, a graft, Spore Load, the line each belongs to, the stage of any brood disease, and whether a corpse has been seeded."
      },
      {
        "name": "The Files",
        "text": "The registrar recognizes any brood creature on sight and knows its Resistances, Immunities, Vulnerabilities, and traits."
      }
    ],
    "spellcasting": {
      "ability": "int",
      "saveDc": 14,
      "groups": [
        {
          "usage": {
            "type": "atWill"
          },
          "spells": [
            {
              "name": "anamnesis",
              "ref": "openfray-brood-and-bloom:anamnesis"
            },
            {
              "name": "mage hand",
              "ref": "srd-5.2:mage-hand"
            },
            {
              "name": "mending",
              "ref": "srd-5.2:mending"
            },
            {
              "name": "message",
              "ref": "srd-5.2:message"
            },
            {
              "name": "prestidigitation",
              "ref": "srd-5.2:prestidigitation"
            },
            {
              "name": "unction",
              "ref": "openfray-brood-and-bloom:unction"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 2
          },
          "spells": [
            {
              "name": "command",
              "ref": "srd-5.2:command"
            },
            {
              "name": "create or destroy water",
              "ref": "srd-5.2:create-or-destroy-water"
            },
            {
              "name": "detect poison and disease",
              "ref": "srd-5.2:detect-poison-and-disease"
            },
            {
              "name": "lazaret sill",
              "ref": "openfray-brood-and-bloom:lazaret-sill"
            },
            {
              "name": "purify food and drink",
              "ref": "srd-5.2:purify-food-and-drink"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 1
          },
          "spells": [
            {
              "name": "brood inquest",
              "ref": "openfray-brood-and-bloom:brood-inquest"
            },
            {
              "name": "comprehend languages",
              "ref": "srd-5.2:comprehend-languages"
            },
            {
              "name": "identify",
              "ref": "srd-5.2:identify"
            }
          ]
        }
      ]
    },
    "actions": [
      {
        "id": "lancet",
        "name": "Lancet",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+2",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 6 (1d8 + 2) Piercing damage."
      },
      {
        "id": "recite",
        "name": "Recite",
        "kind": "utility",
        "toHit": null,
        "text": "The registrar recounts what the files hold about the enemy at hand. Each ally within 30 feet that can hear the registrar has Advantage on saving throws against the effects of brood creatures until the start of the registrar’s next turn."
      }
    ],
    "reactions": [
      {
        "id": "amend",
        "name": "Amend",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: An ally within 30 feet of the registrar that can hear it fails a saving throw against a brood creature’s effect. Response: The registrar calls a correction, and the ally adds 1d4 to the saving throw, possibly turning the failure into a success."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lazaret-prosector",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lazaret Prosector",
    "size": "Medium",
    "type": "humanoid",
    "ac": 15,
    "maxHp": 82,
    "speed": {
      "walk": 30
    },
    "abilities": {
      "str": 12,
      "dex": 16,
      "con": 16,
      "int": 16,
      "wis": 18,
      "cha": 12
    },
    "initiative": 3,
    "saves": {
      "dex": 5,
      "int": 5,
      "wis": 6
    },
    "skills": {
      "arcana": 5,
      "insight": 6,
      "medicine": 8,
      "perception": 6
    },
    "senses": {
      "passivePerception": 16
    },
    "alignment": "lawful neutral",
    "hpFormula": "11d8+33",
    "languages": [
      "Common",
      "Deep Speech",
      "plus two other languages"
    ],
        "gear": [
      "Caustic Flasks (2)",
      "Lancet",
      "Lavages (2)",
      "Studded Leather Armor",
      "Surgeon's Tools"
    ],
"cr": 4,
    "xp": 1100,
    "description": "A field officer of the Lazaret: a surgeon who works on the infected rather than the wounded, and has done it long enough to have opinions about everyone else's methods. Prosectors travel alone and arrive uninvited. The apron is oiled canvas because it has to be washed down, and most of what hangs from the belt is not a weapon until it is.",
    "traits": [
      {
        "name": "The Trained Eye",
        "text": "The prosector reads the broods’ marks on anything it can see within 30 feet, without a check: an attached inquiline, a graft, Spore Load, the line each belongs to, the stage of any brood disease, and whether a corpse has been seeded."
      },
      {
        "name": "Steady",
        "text": "The prosector has Advantage on Wisdom (Medicine) checks, and cannot be forced to make one with Disadvantage."
      }
    ],
    "spellcasting": {
      "ability": "wis",
      "saveDc": 14,
      "groups": [
        {
          "usage": {
            "type": "atWill"
          },
          "spells": [
            {
              "name": "anamnesis",
              "ref": "openfray-brood-and-bloom:anamnesis"
            },
            {
              "name": "mage hand",
              "ref": "srd-5.2:mage-hand"
            },
            {
              "name": "prestidigitation",
              "ref": "srd-5.2:prestidigitation"
            },
            {
              "name": "unction",
              "ref": "openfray-brood-and-bloom:unction"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 2
          },
          "spells": [
            {
              "name": "command",
              "ref": "srd-5.2:command"
            },
            {
              "name": "create or destroy water",
              "ref": "srd-5.2:create-or-destroy-water"
            },
            {
              "name": "detect poison and disease",
              "ref": "srd-5.2:detect-poison-and-disease"
            },
            {
              "name": "lazaret sill",
              "ref": "openfray-brood-and-bloom:lazaret-sill"
            },
            {
              "name": "purify food and drink",
              "ref": "srd-5.2:purify-food-and-drink"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 1
          },
          "spells": [
            {
              "name": "bloom interdict",
              "ref": "openfray-brood-and-bloom:bloom-interdict"
            },
            {
              "name": "discharge",
              "ref": "openfray-brood-and-bloom:discharge"
            }
          ]
        }
      ]
    },
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The prosector makes two Lancet attacks. It can replace one attack with a use of Caustic Flask."
      },
      {
        "id": "lancet",
        "name": "Lancet",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 10 (2d6 + 3) Piercing damage."
      },
      {
        "id": "caustic-flask",
        "name": "Caustic Flask",
        "kind": "ranged",
        "toHit": 5,
        "range": {
          "normal": 30,
          "long": 60
        },
        "damage": [
          {
            "formula": "2d10",
            "type": "acid"
          }
        ],
        "text": "Ranged Attack Roll: +5, range 30/60 ft. Hit: 11 (2d10) Acid damage. One inquiline of Challenge Rating 1/2 or lower attached to the target is destroyed; a larger inquiline attached to the target instead takes the same damage and must succeed on a DC 14 Constitution saving throw or detach."
      },
      {
        "id": "extract",
        "name": "Extract",
        "kind": "utility",
        "toHit": null,
        "text": "The prosector removes one inquiline attached to a creature within 5 feet, with no check and no damage to the host."
      },
      {
        "id": "excise",
        "name": "Excise",
        "kind": "utility",
        "toHit": null,
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "The prosector compresses hours of surgery into one motion. One creature within 5 feet has one graft removed and the disease it was causing ended, and takes 22 (4d10) Slashing damage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lazaret-lector",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lazaret Lector",
    "size": "Medium",
    "type": "humanoid",
    "ac": 15,
    "maxHp": 110,
    "speed": {
      "walk": 30
    },
    "abilities": {
      "str": 12,
      "dex": 16,
      "con": 14,
      "int": 18,
      "wis": 20,
      "cha": 14
    },
    "initiative": 3,
    "saves": {
      "con": 5,
      "int": 7,
      "wis": 8
    },
    "skills": {
      "insight": 8,
      "medicine": 11,
      "nature": 7,
      "perception": 8
    },
    "senses": {
      "passivePerception": 18
    },
    "alignment": "lawful neutral",
    "hpFormula": "17d8+34",
    "languages": [
      "Common",
      "Deep Speech",
      "plus two other languages"
    ],
        "gear": [
      "Caustic Flasks (2)",
      "Lancet",
      "Studded Leather Armor",
      "Surgeon's Tools"
    ],
"cr": 5,
    "xp": 1800,
    "description": "The officer who runs a lazaret house: physician, teacher, and the one who decides who is admitted. A lector who never served in the field as a prosector is rare and not much respected. In an outbreak, a lector is the fastest diagnosis available, and the person directing everyone else's hands.",
    "traits": [
      {
        "name": "The Trained Eye",
        "text": "The lector reads the broods’ marks on anything it can see within 30 feet, without a check: an attached inquiline, a graft, Spore Load, the line each belongs to, the stage of any brood disease, and whether a corpse has been seeded."
      },
      {
        "name": "Steady",
        "text": "The lector has Advantage on Wisdom (Medicine) checks, and cannot be forced to make one with Disadvantage."
      }
    ],
    "spellcasting": {
      "ability": "wis",
      "saveDc": 16,
      "groups": [
        {
          "usage": {
            "type": "atWill"
          },
          "spells": [
            {
              "name": "anamnesis",
              "ref": "openfray-brood-and-bloom:anamnesis"
            },
            {
              "name": "mage hand",
              "ref": "srd-5.2:mage-hand"
            },
            {
              "name": "prestidigitation",
              "ref": "srd-5.2:prestidigitation"
            },
            {
              "name": "unction",
              "ref": "openfray-brood-and-bloom:unction"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 2
          },
          "spells": [
            {
              "name": "command",
              "ref": "srd-5.2:command"
            },
            {
              "name": "create or destroy water",
              "ref": "srd-5.2:create-or-destroy-water"
            },
            {
              "name": "detect poison and disease",
              "ref": "srd-5.2:detect-poison-and-disease"
            },
            {
              "name": "lazaret sill",
              "ref": "openfray-brood-and-bloom:lazaret-sill"
            },
            {
              "name": "purify food and drink",
              "ref": "srd-5.2:purify-food-and-drink"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 1
          },
          "spells": [
            {
              "name": "bloom interdict",
              "ref": "openfray-brood-and-bloom:bloom-interdict"
            },
            {
              "name": "discharge",
              "ref": "openfray-brood-and-bloom:discharge"
            },
            {
              "name": "prosector’s purgation",
              "ref": "openfray-brood-and-bloom:prosectors-purgation"
            },
            {
              "name": "sequestration",
              "ref": "openfray-brood-and-bloom:sequestration"
            }
          ]
        }
      ]
    },
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The lector makes two Lancet attacks. It can replace one attack with a use of Caustic Flask or Intervene."
      },
      {
        "id": "lancet",
        "name": "Lancet",
        "kind": "melee",
        "toHit": 6,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+3",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +6, reach 5 ft. Hit: 10 (2d6 + 3) Piercing damage."
      },
      {
        "id": "caustic-flask",
        "name": "Caustic Flask",
        "kind": "ranged",
        "toHit": 6,
        "range": {
          "normal": 30,
          "long": 60
        },
        "damage": [
          {
            "formula": "2d10",
            "type": "acid"
          }
        ],
        "text": "Ranged Attack Roll: +6, range 30/60 ft. Hit: 11 (2d10) Acid damage. One inquiline of Challenge Rating 1 or lower attached to the target is destroyed; a larger inquiline attached to the target instead takes the same damage and must succeed on a DC 15 Constitution saving throw or detach."
      },
      {
        "id": "intervene",
        "name": "Intervene",
        "kind": "utility",
        "toHit": null,
        "text": "The lector treats one creature within 5 feet. The target loses 1 Depth, or loses 1 Spore Load, or the Poisoned condition on it ends."
      },
      {
        "id": "extract",
        "name": "Extract",
        "kind": "utility",
        "toHit": null,
        "text": "The lector removes one inquiline attached to a creature within 5 feet, with no check and no damage to the host."
      },
      {
        "id": "excise",
        "name": "Excise",
        "kind": "utility",
        "toHit": null,
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "The lector compresses hours of surgery into one motion. One creature within 5 feet has one graft removed and the disease it was causing ended, and takes 22 (4d10) Slashing damage."
      }
    ],
    "bonusActions": [
      {
        "id": "direct",
        "name": "Direct",
        "kind": "utility",
        "toHit": null,
        "text": "The lector directs an ally within 30 feet that can hear it. The ally can immediately use its Reaction to take the Utilize action, and any Wisdom (Medicine) check made as part of it has Advantage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:exemplar",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Exemplar",
    "size": "Gargantuan",
    "type": "aberration",
    "alignment": "neutral evil",
    "description": "The first latchling, which never stopped feeding. Everything in the brood descends from it. The body is a pale coil some sixty feet long, buried through a hillside or a lake bed with a few loops showing, studded along its whole length with the partly absorbed remains of what it has taken — most of them still moving a little. Hosts are brought to it now, or it comes up underneath them.",
    "ac": 19,
    "maxHp": 310,
    "hpFormula": "20d20+100",
    "speed": {
      "walk": 30,
      "burrow": 30,
      "swim": 60
    },
    "initiative": 14,
    "abilities": {
      "str": 26,
      "dex": 14,
      "con": 20,
      "int": 22,
      "wis": 20,
      "cha": 20
    },
    "saves": {
      "dex": 8,
      "con": 11,
      "int": 12,
      "wis": 11
    },
    "skills": {
      "insight": 12,
      "perception": 12
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "truesight": 120,
      "tremorsense": 120,
      "passivePerception": 22
    },
    "languages": [
      "Deep Speech",
      "telepathy 1 mile"
    ],
    "cr": 17,
    "xp": 18000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the exemplar fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "The First",
        "text": "Every inquiline within 5 miles is aware of the exemplar and will not attack it or anything attached to it. The exemplar can perceive through any of them at will."
      },
      {
        "name": "Never Stopped",
        "text": "The exemplar regains 20 Hit Points at the start of each of its turns. This trait doesn’t function if it took Fire or Radiant damage since the end of its last turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The exemplar makes three Bore attacks. It can replace one attack with a use of Seed."
      },
      {
        "id": "bore",
        "name": "Bore",
        "kind": "melee",
        "toHit": 14,
        "reach": 15,
        "damage": [
          {
            "formula": "5d10+8",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +14, reach 15 ft. Hit: 35 (5d10 + 8) Piercing damage, and the target has the Grappled condition (escape DC 20) if it is Large or smaller."
      },
      {
        "id": "take-in",
        "name": "Take In",
        "kind": "utility",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "necrotic"
          }
        ],
        "text": "One creature Grappled by the exemplar is drawn into the coil. The target has the Restrained and Blinded conditions, takes 27 (6d8) Necrotic damage at the start of each of the exemplar’s turns, and gains 1 Depth each time it takes that damage, gaining a graft as Seed does if it carries none. A creature can escape with a successful DC 20 Strength (Athletics) check, and the exemplar can hold up to four creatures this way."
      },
      {
        "id": "seed",
        "name": "Seed",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d10",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 21,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 21, each creature in a 30-foot Emanation originating from the exemplar. Failure: 33 (6d10) Piercing damage, and the target gains 2 Depth. Success: Half damage only, and the target gains 1 Depth. Failure or Success: A target that carries no graft gains one, of the line its own body sets (see What a graft is)."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "shift",
          "name": "Shift",
          "kind": "utility",
          "toHit": null,
          "text": "The exemplar burrows up to half its Speed without provoking Opportunity Attacks, carrying anything it has taken in. It can’t take this action again until the start of its next turn."
        },
        {
          "id": "draw",
          "name": "Draw",
          "kind": "utility",
          "toHit": null,
          "text": "One creature Grappled by the exemplar is subjected to Take In. It can’t take this action again until the start of its next turn."
        },
        {
          "id": "speak",
          "name": "Speak",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "6d6",
              "type": "psychic"
            }
          ],
          "save": {
            "ability": "wis",
            "dc": 21,
            "onSave": "half"
          },
          "text": "The exemplar drives its attention through the brood and into one mind. It targets one creature within 1 mile that is carrying an inquiline or a graft, or that is within 60 feet of one. Wisdom Saving Throw: DC 21, that creature. Failure: 21 (6d6) Psychic damage, and the target has Disadvantage on the next saving throw it makes before the end of its next turn. Success: Half damage only. The exemplar can’t take this action again until the start of its next turn. What the creature experiences is not sound. It is being read, all at once, by something old enough to have read everything else."
        }
      ]
    }
  },
]
