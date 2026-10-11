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

export const wakelightBroodCreatures: Creature[] = [
  {
    "id": "openfray-brood-and-bloom:cinder-nit",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Cinder Nit",
    "size": "Tiny",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The first stage of the ember line: a hot, restless mite the color of a banked coal, hatched from eggs laid in a fresh corpse. It feeds on carrion and warmth. Killed by anything but cold, it seals where it stands and finishes becoming an emberwing.",
    "ac": 12,
    "maxHp": 7,
    "hpFormula": "3d4",
    "speed": {
      "walk": 20,
      "climb": 20
    },
    "initiative": 2,
    "abilities": {
      "str": 6,
      "dex": 14,
      "con": 10,
      "int": 2,
      "wis": 8,
      "cha": 3
    },
    "skills": {
      "stealth": 4
    },
    "resistances": [
      "Fire"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned"
    ],
    "senses": {
      "darkvision": 30,
      "passivePerception": 9
    },
    "cr": 0.125,
    "xp": 25,
    "traits": [
      {
        "name": "Pupation",
        "text": "When the nit drops to 0 Hit Points, it isn’t destroyed unless the damage was Cold damage. Instead it seals itself where it stands, becoming a Cinder Nit Husk with its full Hit Points."
      }
    ],
    "actions": [
      {
        "id": "nip",
        "name": "Nip",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d4+2",
            "type": "piercing"
          },
          {
            "formula": "1d4",
            "type": "fire"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) Piercing damage plus 2 (1d4) Fire damage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:cinder-nit-husk",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Cinder Nit Husk",
    "size": "Tiny",
    "type": "monstrosity",
    "ac": 14,
    "maxHp": 10,
    "speed": {
      "walk": 0
    },
    "abilities": {
      "str": 6,
      "dex": 1,
      "con": 16,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "initiative": -5,
    "senses": {
      "passivePerception": 6
    },
    "alignment": "unaligned",
    "immunities": [
      "Acid",
      "Bludgeoning",
      "Fire",
      "Force",
      "Lightning",
      "Necrotic",
      "Piercing",
      "Poison",
      "Psychic",
      "Radiant",
      "Slashing",
      "Thunder"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Incapacitated",
      "Invisible",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Stunned",
      "Unconscious"
    ],
    "vulnerabilities": [
      "Cold"
    ],
    "cr": 0,
    "xp": 10,
    "description": "A nit that died of anything but cold, sealed where it stood: a knot of hardened ash the size of a walnut, warm to the touch and faintly lit from inside. It has an hour’s work to do and no way at all to defend itself while it does it.",
    "traits": [
      {
        "name": "Sealed",
        "text": "The husk can’t take actions, and its Speed can’t be increased. Nothing reaches what is inside it except Cold damage."
      },
      {
        "name": "Opening",
        "text": "One hour after the husk forms, it splits and an Emberwing emerges in its space with its full Hit Points and takes a turn immediately. Destroying the husk before then ends the line’s cycle here."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:cinder-swarm",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Cinder Swarm",
    "size": "Medium",
    "type": "swarm of tiny monstrosities",
    "alignment": "unaligned",
    "description": "Where one corpse held many eggs, the nits stay together: a rustling, glowing carpet that moves like poured coals and strips a body to the bone in a night. A swarm is not a pack. It is a nursery that has learned to walk.",
    "ac": 12,
    "maxHp": 27,
    "hpFormula": "5d8+5",
    "speed": {
      "walk": 20,
      "climb": 20
    },
    "initiative": 2,
    "abilities": {
      "str": 6,
      "dex": 14,
      "con": 12,
      "int": 2,
      "wis": 8,
      "cha": 3
    },
    "resistances": [
      "Bludgeoning",
      "Piercing",
      "Slashing",
      "Fire"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Stunned"
    ],
    "senses": {
      "darkvision": 30,
      "passivePerception": 9
    },
    "cr": 1,
    "xp": 200,
    "traits": [
      {
        "name": "Swarm",
        "text": "The swarm can occupy another creature’s space and vice versa, and it can move through any opening large enough for a Tiny mite. It can’t regain Hit Points or gain Temporary Hit Points."
      },
      {
        "name": "Husking Mass",
        "text": "When the swarm drops to 0 Hit Points, unless the damage that reduced it was Cold damage, 1d4 husks form in its space, each as described in the Cinder Nit’s Pupation trait."
      }
    ],
    "actions": [
      {
        "id": "bites",
        "name": "Bites",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "2d4+2",
            "type": "piercing"
          },
          {
            "formula": "1d6",
            "type": "fire"
          },
          {
            "formula": "1d4+2",
            "type": "piercing"
          },
          {
            "formula": "1d4",
            "type": "fire"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft., one creature in the swarm’s space. Hit: 7 (2d4 + 2) Piercing damage plus 3 (1d6) Fire damage, or 4 (1d4 + 2) Piercing damage plus 2 (1d4) Fire damage if the swarm is Bloodied."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:emberwing",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Emberwing",
    "size": "Small",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The winged adult of the ember line: a moth of ash and smoldering wing that hunts by its own dim glow and lays its eggs in the newly dead. Everything it lands on, it scorches.",
    "ac": 14,
    "maxHp": 45,
    "hpFormula": "7d6+21",
    "speed": {
      "walk": 20,
      "fly": 40
    },
    "initiative": 3,
    "abilities": {
      "str": 12,
      "dex": 16,
      "con": 16,
      "int": 4,
      "wis": 11,
      "cha": 7
    },
    "skills": {
      "perception": 2,
      "stealth": 5
    },
    "resistances": [
      "Fire"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "darkvision": 60,
      "passivePerception": 12
    },
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Heat Shimmer",
        "text": "The emberwing has Advantage on Dexterity (Stealth) checks made while in Bright Light or within 10 feet of an open flame."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The emberwing makes two Searing Bite attacks."
      },
      {
        "id": "searing-bite",
        "name": "Searing Bite",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "1d6+3",
            "type": "piercing"
          },
          {
            "formula": "1d6",
            "type": "fire"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) Piercing damage plus 3 (1d6) Fire damage."
      },
      {
        "id": "ash-plume",
        "name": "Ash Plume",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d6",
            "type": "fire"
          }
        ],
        "save": {
          "ability": "dex",
          "dc": 13,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Dexterity Saving Throw: DC 13, each creature in a 15-foot Cone. Failure: 10 (3d6) Fire damage, and the target has the Blinded condition until the end of its next turn. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "flit",
        "name": "Flit",
        "kind": "utility",
        "toHit": null,
        "text": "The emberwing moves up to half its Fly Speed without provoking Opportunity Attacks."
      }
    ],
    "reactions": [
      {
        "id": "seed-the-dead",
        "name": "Seed the Dead",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the emberwing can see dies within 30 feet of it. Response: The emberwing moves up to half its Fly Speed toward the corpse without provoking Opportunity Attacks. If it ends that movement within 5 feet of the corpse, it settles over the body and lays through its ovipositor. After 1d6 + 2 hours, 1d4 Cinder Nits climb out of the body."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:pyre-matron",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Pyre Matron",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "An emberwing that has outlived enough layings: heavy as a warhorse, wings like sheets of beaten char, the air above her shimmering with body heat. Matrons roost where the dying has been steady for years — border forts, plague towns, roads the wars keep using — and the ground beneath a roost never frosts.",
    "ac": 16,
    "maxHp": 127,
    "hpFormula": "15d10+45",
    "speed": {
      "walk": 20,
      "fly": 50,
      "hover": true
    },
    "initiative": 3,
    "abilities": {
      "str": 18,
      "dex": 16,
      "con": 16,
      "int": 5,
      "wis": 14,
      "cha": 12
    },
    "saves": {
      "dex": 6,
      "wis": 5
    },
    "skills": {
      "perception": 5,
      "stealth": 6
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Fire",
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 15
    },
    "cr": 7,
    "xp": 2900,
    "traits": [
      {
        "name": "Furnace Body",
        "text": "A creature that touches the matron or hits it with a melee attack while within 5 feet of it takes 3 (1d6) Fire damage."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The matron makes two Searing Bite attacks."
      },
      {
        "id": "searing-bite",
        "name": "Searing Bite",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "piercing"
          },
          {
            "formula": "2d6",
            "type": "fire"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Piercing damage plus 7 (2d6) Fire damage."
      },
      {
        "id": "cinder-storm",
        "name": "Cinder Storm",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "8d6",
            "type": "fire"
          }
        ],
        "save": {
          "ability": "dex",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Dexterity Saving Throw: DC 15, each creature in a 30-foot Cone. Failure: 28 (8d6) Fire damage, and the target has the Blinded condition until the end of its next turn as the ash takes its eyes. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "flit",
        "name": "Flit",
        "kind": "utility",
        "toHit": null,
        "text": "The matron moves up to half its Fly Speed without provoking Opportunity Attacks."
      }
    ],
    "reactions": [
      {
        "id": "seed-the-dead",
        "name": "Seed the Dead",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the matron can see dies within 30 feet of it. Response: The matron moves up to half its Fly Speed toward the corpse without provoking Opportunity Attacks. If it ends that movement within 5 feet of the corpse, it settles over the body and lays through its ovipositor. After 1d6 + 2 hours, 1d4 Cinder Nits climb out of the body."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:gravewax-grub",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Gravewax Grub",
    "size": "Small",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The larva of the tallow line: a fat, slick, candle-pale worm that feeds on the fats of the dead and renders them into gravewax. Killed by anything but cold or thunder, it hardens into a husk and opens as a tallow imago.",
    "ac": 13,
    "maxHp": 22,
    "hpFormula": "4d6+8",
    "speed": {
      "walk": 20,
      "climb": 20
    },
    "initiative": 1,
    "abilities": {
      "str": 12,
      "dex": 12,
      "con": 14,
      "int": 2,
      "wis": 8,
      "cha": 3
    },
    "skills": {
      "stealth": 3
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 9
    },
    "cr": 0.5,
    "xp": 100,
    "traits": [
      {
        "name": "Pupation",
        "text": "When the grub drops to 0 Hit Points, it isn’t destroyed unless the damage was Cold or Thunder damage. Instead it seals itself where it stands, becoming a Gravewax Grub Husk with its full Hit Points."
      },
      {
        "name": "Slick Hide",
        "text": "The grub automatically escapes the Grappled condition at the end of its turn."
      }
    ],
    "actions": [
      {
        "id": "chew",
        "name": "Chew",
        "kind": "melee",
        "toHit": 3,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+1",
            "type": "piercing"
          },
          {
            "formula": "1d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +3, reach 5 ft. Hit: 5 (1d8 + 1) Piercing damage plus 3 (1d6) Necrotic damage."
      },
      {
        "id": "wax-spit",
        "name": "Wax Spit",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d6",
            "type": "bludgeoning"
          }
        ],
        "save": {
          "ability": "dex",
          "dc": 12,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Dexterity Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 7 (2d6) Bludgeoning damage, and the target’s Speed is 0 until the end of its next turn. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:gravewax-grub-husk",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Gravewax Grub Husk",
    "size": "Small",
    "type": "monstrosity",
    "ac": 17,
    "maxHp": 15,
    "speed": {
      "walk": 0
    },
    "abilities": {
      "str": 6,
      "dex": 1,
      "con": 16,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "initiative": -5,
    "senses": {
      "passivePerception": 6
    },
    "alignment": "unaligned",
    "immunities": [
      "Acid",
      "Bludgeoning",
      "Fire",
      "Force",
      "Lightning",
      "Necrotic",
      "Piercing",
      "Poison",
      "Psychic",
      "Radiant",
      "Slashing"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Incapacitated",
      "Invisible",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Stunned",
      "Unconscious"
    ],
    "vulnerabilities": [
      "Cold",
      "Thunder"
    ],
    "cr": 0,
    "xp": 10,
    "description": "A grub sealed inside its own rendered wax, pale and smooth and warm as a living body. The surface sets hard enough to turn a blade and stays soft enough to hold a thumbprint, which is how a Lazaret officer tells this hour from the next.",
    "traits": [
      {
        "name": "Sealed",
        "text": "The husk can’t take actions, and its Speed can’t be increased. Nothing reaches what is inside it except Cold, Thunder damage."
      },
      {
        "name": "Opening",
        "text": "One hour after the husk forms, it splits and a Tallow Imago emerges in its space with its full Hit Points and takes a turn immediately. Destroying the husk before then ends the line’s cycle here."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:gravewax-mass",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Gravewax Mass",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "In a rich larder — a plague pit, a sealed barrow, a battlefield plowed under — the grubs of several corpses meet, and rather than compete they fuse under a shared coat of their own wax. The mass moves like slow porridge and eats like a tide.",
    "ac": 12,
    "maxHp": 68,
    "hpFormula": "8d10+24",
    "speed": {
      "walk": 10,
      "climb": 10
    },
    "initiative": -3,
    "abilities": {
      "str": 16,
      "dex": 5,
      "con": 16,
      "int": 1,
      "wis": 8,
      "cha": 2
    },
    "resistances": [
      "Bludgeoning",
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 9
    },
    "cr": 3,
    "xp": 700,
    "traits": [
      {
        "name": "Rendered Store",
        "text": "When the mass drops to 0 Hit Points, unless the damage that reduced it was Cold or Thunder damage, it collapses and 1d4 Gravewax Grubs emerge from the ruin with their full Hit Points."
      },
      {
        "name": "Slick Mass",
        "text": "The mass automatically escapes the Grappled and Restrained conditions at the end of its turn, and it can squeeze through any opening at least 1 foot across."
      }
    ],
    "actions": [
      {
        "id": "pseudopod",
        "name": "Pseudopod",
        "kind": "melee",
        "toHit": 5,
        "reach": 10,
        "damage": [
          {
            "formula": "2d8+3",
            "type": "bludgeoning"
          },
          {
            "formula": "1d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 10 ft. Hit: 12 (2d8 + 3) Bludgeoning damage plus 3 (1d6) Necrotic damage."
      },
      {
        "id": "wax-slough",
        "name": "Wax Slough",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d6",
            "type": "bludgeoning"
          }
        ],
        "save": {
          "ability": "dex",
          "dc": 13,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Dexterity Saving Throw: DC 13, each creature in a 10-foot Emanation originating from the mass. Failure: 10 (3d6) Bludgeoning damage, and the target’s Speed is 0 until the end of its next turn as the wax sets on it. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:tallow-font",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Tallow Font",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "A mass that stopped moving. Anchored over a deep larder, it turns entirely to rendering: a pale, breathing hummock that sheets its chamber in gravewax and feeds the line's young the way a spring feeds a valley. The Lazaret classes fonts as infrastructure rather than fauna, and burns them with the same priority as bridges.",
    "ac": 14,
    "maxHp": 90,
    "hpFormula": "12d10+24",
    "speed": {
      "walk": 0
    },
    "initiative": -5,
    "abilities": {
      "str": 16,
      "dex": 1,
      "con": 14,
      "int": 1,
      "wis": 10,
      "cha": 2
    },
    "resistances": [
      "Bludgeoning",
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 10
    },
    "cr": 4,
    "xp": 1100,
    "traits": [
      {
        "name": "Rooted",
        "text": "The font can’t move and can’t be moved against its will."
      },
      {
        "name": "Waxen Ground",
        "text": "The ground within 15 feet of the font is sheeted in gravewax and is Difficult Terrain for creatures other than Necrophores of the tallow line. A creature that takes the Dash action while on it must succeed on a DC 12 Dexterity saving throw or have the Prone condition."
      },
      {
        "name": "Font",
        "text": "A Necrophore larva that starts its turn within 30 feet of the font regains 5 Hit Points."
      },
      {
        "name": "Rendered Deep",
        "text": "When the font drops to 0 Hit Points, unless the damage that reduced it was Cold or Thunder damage, it collapses in a wave: each creature within 15 feet of it makes a DC 12 Dexterity saving throw, taking 14 (4d6) Bludgeoning damage on a failed save or half as much damage on a successful one, and 1d4 Gravewax Grubs emerge from the ruin with their full Hit Points."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The font makes two Scald attacks."
      },
      {
        "id": "scald",
        "name": "Scald",
        "kind": "ranged",
        "toHit": 5,
        "range": {
          "normal": 30
        },
        "damage": [
          {
            "formula": "2d6",
            "type": "bludgeoning"
          },
          {
            "formula": "1d8",
            "type": "fire"
          }
        ],
        "text": "Ranged Attack Roll: +5, range 30 ft. Hit: 7 (2d6) Bludgeoning damage plus 4 (1d8) Fire damage, and the target’s Speed decreases by 10 feet until the end of its next turn as the wax sets."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:tallow-imago",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Tallow Imago",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The flying adult of the tallow line: a heavy, greasy moth shedding a sick corpse-light. The wax held only the grub; the wings open as it rises, which is how it ends up spanning a cart. It drains the living with its bite, lays in whatever dies near it, and keeps the last hour of every creature its larva ate, pantomiming them without a voice.",
    "ac": 15,
    "maxHp": 105,
    "hpFormula": "14d10+28",
    "speed": {
      "walk": 20,
      "fly": 50,
      "hover": true
    },
    "initiative": 3,
    "abilities": {
      "str": 16,
      "dex": 17,
      "con": 15,
      "int": 6,
      "wis": 14,
      "cha": 14
    },
    "saves": {
      "dex": 6,
      "wis": 5
    },
    "skills": {
      "perception": 5,
      "stealth": 6
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Exhaustion",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 15
    },
    "languages": [
      "understands Common but can’t speak"
    ],
    "cr": 5,
    "xp": 1800,
    "traits": [
      {
        "name": "Corpse-Light",
        "text": "The imago sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. A creature that starts its turn in that Bright Light and can see the imago makes a DC 13 Wisdom saving throw. On a failed save, the creature has the Charmed condition until the start of its next turn, and it must move toward the imago on its turn if able."
      },
      {
        "name": "Inherited Memory",
        "text": "The imago retains the final hour of memory of every creature its larval stage consumed. It can pantomime those memories but can’t speak them."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The imago makes two Proboscis attacks."
      },
      {
        "id": "proboscis",
        "name": "Proboscis",
        "kind": "melee",
        "toHit": 6,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+3",
            "type": "piercing"
          },
          {
            "formula": "2d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +6, reach 10 ft. Hit: 10 (2d6 + 3) Piercing damage plus 7 (2d6) Necrotic damage, and the target’s Hit Point maximum decreases by an amount equal to the Necrotic damage taken. The reduction lasts until the target finishes a Long Rest."
      },
      {
        "id": "scale-cloud",
        "name": "Scale Cloud",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d8",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Constitution Saving Throw: DC 13, each creature in a 20-foot Emanation originating from the imago. Failure: 18 (4d8) Poison damage, and the target has the Blinded condition until the end of its next turn. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "guttering",
        "name": "Guttering",
        "kind": "utility",
        "toHit": null,
        "text": "The imago extinguishes or reignites its Corpse-Light, or it moves up to half its Fly Speed without provoking Opportunity Attacks."
      }
    ],
    "reactions": [
      {
        "id": "seed-the-dead",
        "name": "Seed the Dead",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the imago can see dies within 30 feet of it. Response: The imago moves up to half its Fly Speed toward the corpse without provoking Opportunity Attacks. If it ends that movement within 5 feet of the corpse, it settles over the body and lays through its ovipositor. After 1d6 + 2 hours, 1d4 Gravewax Grubs climb out of the body."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:catafalque-moth",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Catafalque Moth",
    "size": "Huge",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The tallow line's elder: a moth the size of a fishing boat that no longer bothers to fly far, draping itself over biers, gatehouses, and charnel-chapel roofs like a pall laid by an enormous hand. Its corpse-light is the softest in the brood and the hardest to look away from. What it remembers, it remembers in crowds.",
    "ac": 17,
    "maxHp": 178,
    "hpFormula": "17d12+68",
    "speed": {
      "walk": 20,
      "fly": 50,
      "hover": true
    },
    "initiative": 10,
    "abilities": {
      "str": 20,
      "dex": 15,
      "con": 18,
      "int": 8,
      "wis": 16,
      "cha": 16
    },
    "saves": {
      "dex": 6,
      "con": 8,
      "wis": 7
    },
    "skills": {
      "perception": 7,
      "stealth": 6
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 17
    },
    "languages": [
      "understands Common but can’t speak"
    ],
    "cr": 10,
    "xp": 5900,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the moth fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Corpse-Light",
        "text": "The moth sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. A creature that starts its turn in that Bright Light and can see the moth makes a DC 15 Wisdom saving throw. On a failed save, the creature has the Charmed condition until the start of its next turn, and it must move toward the moth on its turn if able."
      },
      {
        "name": "Inherited Memory",
        "text": "The moth retains the final hour of memory of every creature its larval stage consumed. It can pantomime those memories but can’t speak them."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The moth makes two Proboscis attacks."
      },
      {
        "id": "proboscis",
        "name": "Proboscis",
        "kind": "melee",
        "toHit": 9,
        "reach": 10,
        "damage": [
          {
            "formula": "2d10+5",
            "type": "piercing"
          },
          {
            "formula": "2d8",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +9, reach 10 ft. Hit: 16 (2d10 + 5) Piercing damage plus 9 (2d8) Necrotic damage, and the target’s Hit Point maximum decreases by an amount equal to the Necrotic damage taken. The reduction lasts until the target finishes a Long Rest."
      },
      {
        "id": "wing-pall",
        "name": "Wing Pall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Constitution Saving Throw: DC 16, each creature in a 30-foot Emanation originating from the moth. Failure: 27 (6d8) Necrotic damage, and the target’s Speed is halved until the end of its next turn as settling wax coats it. Success: Half damage only. Failure or Success: Nonmagical flames in the Emanation are extinguished."
      }
    ],
    "bonusActions": [
      {
        "id": "guttering",
        "name": "Guttering",
        "kind": "utility",
        "toHit": null,
        "text": "The moth extinguishes or reignites its Corpse-Light, or it moves up to half its Fly Speed without provoking Opportunity Attacks."
      }
    ],
    "reactions": [
      {
        "id": "seed-the-dead",
        "name": "Seed the Dead",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the moth can see dies within 30 feet of it. Response: The moth moves up to half its Fly Speed toward the corpse without provoking Opportunity Attacks. If it ends that movement within 5 feet of the corpse, it settles over the body and lays through its ovipositor. After 1d6 + 2 hours, 1d4 Gravewax Grubs climb out of the body."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "drift",
          "name": "Drift",
          "kind": "utility",
          "toHit": null,
          "text": "The moth moves up to half its Fly Speed without provoking Opportunity Attacks. The moth can’t take this action again until the start of its next turn."
        },
        {
          "id": "wax-fall",
          "name": "Wax Fall",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "2d8",
              "type": "bludgeoning"
            }
          ],
          "save": {
            "ability": "dex",
            "dc": 16,
            "onSave": "half"
          },
          "text": "Dexterity Saving Throw: DC 16, each creature in a 10-foot Emanation originating from the moth. Failure: 9 (2d8) Bludgeoning damage, and the target’s Speed decreases by 10 feet until the end of its next turn. Success: Half damage only. The moth can’t take this action again until the start of its next turn."
        },
        {
          "id": "seize",
          "name": "Seize",
          "kind": "utility",
          "toHit": null,
          "text": "The moth makes one Proboscis attack. The attack deals only its Piercing damage, with no Necrotic damage. The moth can’t take this action again until the start of its next turn."
        }
      ]
    }
  },
  {
    "id": "openfray-brood-and-bloom:crypt-instar",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Crypt Instar",
    "size": "Small",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "What climbs from a corpse the reliquary line has seeded: a hand-length burrower, translucent as church glass, that spends thirty days eating before it is anything worth a file. Instars work in broods, dragging the newly buried down through the floors of their graves.",
    "ac": 14,
    "maxHp": 44,
    "hpFormula": "8d6+16",
    "speed": {
      "walk": 25,
      "burrow": 10,
      "climb": 25
    },
    "initiative": 2,
    "abilities": {
      "str": 14,
      "dex": 14,
      "con": 14,
      "int": 3,
      "wis": 12,
      "cha": 5
    },
    "skills": {
      "perception": 3,
      "stealth": 4
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 60,
      "tremorsense": 30,
      "passivePerception": 13
    },
    "cr": 3,
    "xp": 700,
    "traits": [
      {
        "name": "Grave-Fed",
        "text": "Whenever the instar reduces a creature to 0 Hit Points, the instar regains 5 Hit Points."
      },
      {
        "name": "Growth",
        "text": "An instar that feeds on the dead for 30 days becomes a Sepulchre Nymph."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The instar makes two Rake attacks."
      },
      {
        "id": "rake",
        "name": "Rake",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "2d4+2",
            "type": "slashing"
          },
          {
            "formula": "1d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 7 (2d4 + 2) Slashing damage plus 3 (1d6) Necrotic damage."
      }
    ],
    "bonusActions": [
      {
        "id": "burrow-away",
        "name": "Burrow Away",
        "kind": "utility",
        "toHit": null,
        "text": "The instar burrows up to half its Speed without provoking Opportunity Attacks."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:sepulchre-nymph",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Sepulchre Nymph",
    "size": "Medium",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The ground stage of the reliquary line, grown from an instar that fed well: a burrower strong on the dead it drags under. Killed by anything but radiance, it seals into the hardest husk the brood makes and opens as a reliquary imago.",
    "ac": 16,
    "maxHp": 127,
    "hpFormula": "15d8+60",
    "speed": {
      "walk": 30,
      "burrow": 15,
      "climb": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 18,
      "dex": 15,
      "con": 18,
      "int": 7,
      "wis": 13,
      "cha": 8
    },
    "saves": {
      "con": 7,
      "wis": 4
    },
    "skills": {
      "perception": 4,
      "stealth": 5
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Charmed",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 60,
      "tremorsense": 60,
      "passivePerception": 14
    },
    "cr": 8,
    "xp": 3900,
    "traits": [
      {
        "name": "Pupation",
        "text": "When the nymph drops to 0 Hit Points, it isn’t destroyed unless the damage was Radiant damage. Instead it seals itself where it stands, becoming a Sepulchre Nymph Husk with its full Hit Points."
      },
      {
        "name": "Grave-Fed",
        "text": "Whenever the nymph reduces a creature to 0 Hit Points, the nymph regains 10 Hit Points."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The nymph makes three Rake attacks."
      },
      {
        "id": "rake",
        "name": "Rake",
        "kind": "melee",
        "toHit": 7,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+4",
            "type": "slashing"
          },
          {
            "formula": "2d4",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 10 ft. Hit: 11 (2d6 + 4) Slashing damage plus 5 (2d4) Necrotic damage."
      },
      {
        "id": "barrow-breath",
        "name": "Barrow Breath",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Constitution Saving Throw: DC 15, each creature in a 30-foot Cone. Failure: 27 (6d8) Necrotic damage, and the target can’t regain Hit Points until the end of its next turn. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "burrow-away",
        "name": "Burrow Away",
        "kind": "utility",
        "toHit": null,
        "text": "The nymph burrows up to half its Speed without provoking Opportunity Attacks."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:sepulchre-nymph-husk",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Sepulchre Nymph Husk",
    "size": "Medium",
    "type": "monstrosity",
    "ac": 19,
    "maxHp": 40,
    "speed": {
      "walk": 0
    },
    "abilities": {
      "str": 6,
      "dex": 1,
      "con": 16,
      "int": 1,
      "wis": 3,
      "cha": 1
    },
    "initiative": -5,
    "senses": {
      "passivePerception": 6
    },
    "alignment": "unaligned",
    "immunities": [
      "Acid",
      "Bludgeoning",
      "Cold",
      "Fire",
      "Force",
      "Lightning",
      "Necrotic",
      "Piercing",
      "Poison",
      "Psychic",
      "Slashing",
      "Thunder"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Incapacitated",
      "Invisible",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Stunned",
      "Unconscious"
    ],
    "vulnerabilities": [
      "Radiant"
    ],
    "cr": 0,
    "xp": 10,
    "description": "The hardest thing this brood makes: a case of packed grave-earth and fused casings, the size of a curled person, that rings like fired clay when it is struck. Light is the only thing it was never able to keep out.",
    "traits": [
      {
        "name": "Sealed",
        "text": "The husk can’t take actions, and its Speed can’t be increased. Nothing reaches what is inside it except Radiant damage."
      },
      {
        "name": "Opening",
        "text": "One hour after the husk forms, it splits and a Reliquary Imago emerges in its space with its full Hit Points and takes a turn immediately. Destroying the husk before then ends the line’s cycle here."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:reliquary-imago",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Reliquary Imago",
    "size": "Huge",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "The apex of the reliquary line: a vast, luminous moth that carries the final memories of everything its larva ate and speaks in their voices. The husk held only the body; the wings come out folded and open as it rises, which is how it ends up shading a road. A creature that has eaten the right corpse knows things nobody living knows.",
    "ac": 18,
    "maxHp": 253,
    "hpFormula": "22d12+110",
    "speed": {
      "walk": 30,
      "fly": 60,
      "hover": true
    },
    "initiative": 13,
    "abilities": {
      "str": 22,
      "dex": 16,
      "con": 20,
      "int": 12,
      "wis": 18,
      "cha": 17
    },
    "saves": {
      "dex": 8,
      "con": 10,
      "wis": 9
    },
    "skills": {
      "perception": 9,
      "stealth": 8
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 19
    },
    "languages": [
      "Common",
      "Deep Speech"
    ],
    "cr": 13,
    "xp": 10000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the imago fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Reliquary Light",
        "text": "The imago sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. A creature that starts its turn in that Bright Light and can see the imago makes a DC 17 Wisdom saving throw. On a failed save, the creature has the Charmed condition until the start of its next turn, and it must move toward the imago on its turn if able."
      },
      {
        "name": "Inherited Memory",
        "text": "The imago retains the final hour of memory of every creature its larval stage consumed, and it can speak in any of their voices."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The imago makes three Proboscis attacks. It can replace one attack with a use of Charnel Shroud."
      },
      {
        "id": "proboscis",
        "name": "Proboscis",
        "kind": "melee",
        "toHit": 11,
        "reach": 15,
        "damage": [
          {
            "formula": "2d10+6",
            "type": "piercing"
          },
          {
            "formula": "3d8",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +11, reach 15 ft. Hit: 17 (2d10 + 6) Piercing damage plus 13 (3d8) Necrotic damage, and the target’s Hit Point maximum decreases by an amount equal to the Necrotic damage taken. The reduction lasts until the target finishes a Long Rest."
      },
      {
        "id": "charnel-shroud",
        "name": "Charnel Shroud",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "necrotic"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 18,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 18, each creature in a 20-foot Emanation originating from the imago. Failure: 27 (6d8) Necrotic damage, and the target has the Blinded condition until the end of its next turn. Success: Half damage only."
      }
    ],
    "bonusActions": [
      {
        "id": "guttering",
        "name": "Guttering",
        "kind": "utility",
        "toHit": null,
        "text": "The imago extinguishes or reignites its Reliquary Light."
      }
    ],
    "reactions": [
      {
        "id": "seed-the-dead",
        "name": "Seed the Dead",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the imago can see dies within 30 feet of it. Response: The imago moves up to half its Fly Speed toward the corpse without provoking Opportunity Attacks. If it ends that movement within 5 feet of the corpse, it settles over the body and lays through its ovipositor. After 1d6 + 2 hours, 1d4 Crypt Instars climb out of the body."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "drift",
          "name": "Drift",
          "kind": "utility",
          "toHit": null,
          "text": "The imago moves up to half its Fly Speed without provoking Opportunity Attacks. The imago can’t take this action again until the start of its next turn."
        },
        {
          "id": "wing-dust",
          "name": "Wing Dust",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "3d6",
              "type": "poison"
            }
          ],
          "save": {
            "ability": "dex",
            "dc": 18,
            "onSave": "half"
          },
          "text": "Dexterity Saving Throw: DC 18, each creature in a 10-foot Emanation originating from the imago. Failure: 10 (3d6) Poison damage. Success: Half damage only. The imago can’t take this action again until the start of its next turn."
        },
        {
          "id": "seize",
          "name": "Seize",
          "kind": "utility",
          "toHit": null,
          "text": "The imago makes one Proboscis attack. The attack deals only its Piercing damage, with no Necrotic damage. The imago can’t take this action again until the start of its next turn."
        }
      ]
    }
  },
  {
    "id": "openfray-brood-and-bloom:wakelight-wisp",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Wakelight Wisp",
    "size": "Tiny",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "A scrap of living wing that peels from an adult in flight and drifts on its own, dim and warm and searching. Wisps are how a colony finds the dead it did not make: they ride the wind until they cross a corpse, then settle and brighten.",
    "ac": 12,
    "maxHp": 5,
    "hpFormula": "2d4",
    "speed": {
      "walk": 5,
      "fly": 40,
      "hover": true
    },
    "initiative": 2,
    "abilities": {
      "str": 1,
      "dex": 15,
      "con": 10,
      "int": 2,
      "wis": 12,
      "cha": 4
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
      "Grappled",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "darkvision": 60,
      "passivePerception": 11
    },
    "cr": 0.25,
    "xp": 50,
    "traits": [
      {
        "name": "Wakelight",
        "text": "The wisp sheds Dim Light in a 20-foot radius."
      },
      {
        "name": "Death Sense",
        "text": "The wisp knows the location of any dead creature within 300 feet of it."
      }
    ],
    "actions": [
      {
        "id": "scorch",
        "name": "Scorch",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d4+2",
            "type": "fire"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) Fire damage."
      },
      {
        "id": "beacon",
        "name": "Beacon",
        "kind": "utility",
        "toHit": null,
        "text": "The wisp settles on a dead creature within 5 feet of it and brightens, shedding Bright Light in a 30-foot radius and Dim Light for an additional 30 feet until it moves or is destroyed. Every Necrophore adult within 1 mile knows the location of a corpse a wisp has beaconed."
      }
    ],
    "bonusActions": [
      {
        "id": "snuff",
        "name": "Snuff",
        "kind": "utility",
        "toHit": null,
        "text": "The wisp extinguishes its light or rekindles it."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lych-lantern",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lych Lantern",
    "size": "Small",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "Not every husk opens. In a rare few the change halts partway: the thing inside dies, the light it was growing does not, and the sealed case roots where it stands. What remains is a lantern of shell and wax, glowing softly, forever — and the glow calls to whatever is close to death.",
    "ac": 15,
    "maxHp": 45,
    "hpFormula": "7d6+21",
    "speed": {
      "walk": 0
    },
    "initiative": -4,
    "abilities": {
      "str": 14,
      "dex": 3,
      "con": 16,
      "int": 2,
      "wis": 12,
      "cha": 6
    },
    "resistances": [
      "Necrotic"
    ],
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 11
    },
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Rooted",
        "text": "The lantern can’t move. Uprooting it requires a successful DC 15 Strength (Athletics) check; an uprooted lantern dims and dies within 1 hour."
      },
      {
        "name": "Grave Glow",
        "text": "The lantern sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. A creature that has fewer than half its Hit Points remaining, starts its turn in that Bright Light, and can see the lantern makes a DC 12 Wisdom saving throw. On a failed save, the creature has the Charmed condition until the start of its next turn; while Charmed this way, it must move toward the lantern by the most direct route on its turn, and if it ends its turn within 5 feet of the lantern, it has the Incapacitated condition until the start of its next turn."
      }
    ],
    "actions": [
      {
        "id": "root-lash",
        "name": "Root Lash",
        "kind": "melee",
        "toHit": 4,
        "reach": 10,
        "damage": [
          {
            "formula": "1d8+2",
            "type": "bludgeoning"
          },
          {
            "formula": "1d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 10 ft. Hit: 6 (1d8 + 2) Bludgeoning damage plus 3 (1d6) Necrotic damage."
      }
    ],
    "reactions": [
      {
        "id": "flare",
        "name": "Flare",
        "kind": "save",
        "toHit": null,
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "negates"
        },
        "text": "Trigger: The lantern takes damage. Response: Constitution Saving Throw: DC 13, each creature within 10 feet of the lantern that can see it. Failure: The creature has the Blinded condition until the end of its next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:mort-shrike",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Mort Shrike",
    "size": "Large",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "A gaunt, hook-beaked bird the size of a pony that feeds almost entirely on the wakelight brood: it hawks adults out of the air, cracks husks like nuts, and wedges its surplus into thorn trees at head height. Where the brood is thick, shrikes follow, and their larders mark a colony's borders more reliably than any survey.",
    "ac": 14,
    "maxHp": 93,
    "hpFormula": "11d10+33",
    "speed": {
      "walk": 20,
      "fly": 60
    },
    "initiative": 3,
    "abilities": {
      "str": 18,
      "dex": 16,
      "con": 16,
      "int": 4,
      "wis": 14,
      "cha": 6
    },
    "skills": {
      "perception": 5
    },
    "senses": {
      "darkvision": 60,
      "passivePerception": 15
    },
    "cr": 5,
    "xp": 1800,
    "traits": [
      {
        "name": "Husk-Cracker",
        "text": "The shrike deals double damage to objects and to Necrophore husks."
      },
      {
        "name": "Wake Sense",
        "text": "The shrike knows the location of any Necrophore creature within 300 feet of it."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The shrike makes one Beak attack and one Talons attack."
      },
      {
        "id": "beak",
        "name": "Beak",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Piercing damage."
      },
      {
        "id": "talons",
        "name": "Talons",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+4",
            "type": "slashing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 11 (2d6 + 4) Slashing damage, and if the target is a Medium or smaller creature, it has the Grappled condition (escape DC 14). The shrike can fly while carrying a creature Grappled this way."
      },
      {
        "id": "impale",
        "name": "Impale",
        "kind": "utility",
        "toHit": null,
        "damage": [
          {
            "formula": "2d10+4",
            "type": "piercing"
          }
        ],
        "text": "The shrike slams a creature it is Grappling onto a spike of wood, stone, or bone within 5 feet of it. The target takes 15 (2d10 + 4) Piercing damage, the grapple ends, and the target has the Restrained condition until it or another creature within reach of it succeeds on a DC 14 Strength (Athletics) check made as an action to work it free."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:lychfield",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Lychfield",
    "size": "Gargantuan",
    "type": "monstrosity",
    "alignment": "unaligned",
    "description": "Some killing grounds are used too often. Seeded and hatched and seeded again, year over year, the ground stops being ground: husk casings pack into strata, gravewax runs the seams, cinder warms the deep layers, and the field closes over its dead like a mouth. A lychfield is no line's work. It is sediment — all three lines' leavings grown into one organism the size of a churchyard.",
    "ac": 19,
    "maxHp": 297,
    "hpFormula": "18d20+108",
    "speed": {
      "walk": 10
    },
    "initiative": 6,
    "abilities": {
      "str": 24,
      "dex": 3,
      "con": 22,
      "int": 6,
      "wis": 17,
      "cha": 18
    },
    "saves": {
      "con": 11,
      "wis": 8
    },
    "skills": {
      "perception": 8
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
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained"
    ],
    "senses": {
      "blindsight": 120,
      "passivePerception": 18
    },
    "cr": 16,
    "xp": 15000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the lychfield fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "The Field Itself",
        "text": "The lychfield is a stretch of ground up to 60 feet on a side. Other creatures can enter and move through its space, which is Difficult Terrain for all of them but Necrophores, and the lychfield’s attacks can originate from any point of its space."
      },
      {
        "name": "Teeming",
        "text": "At the start of each of its turns, the lychfield regains 15 Hit Points unless it took Cold, Thunder, or Radiant damage since the end of its previous turn. If it drops to 0 Hit Points, it is destroyed, and nothing hatches from it."
      },
      {
        "name": "Seeded Ground",
        "text": "A creature that dies in the lychfield’s space is taken into it and laid in at once, no Reaction required. After 1d6 + 2 hours, 1d4 larvae of a line of the Game Master’s choice climb out of the ground where it died."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The lychfield makes three Grave Surge attacks."
      },
      {
        "id": "grave-surge",
        "name": "Grave Surge",
        "kind": "melee",
        "toHit": 12,
        "reach": 15,
        "damage": [
          {
            "formula": "3d8+7",
            "type": "bludgeoning"
          },
          {
            "formula": "2d8",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +12, reach 15 ft. Hit: 20 (3d8 + 7) Bludgeoning damage plus 9 (2d8) Necrotic damage."
      },
      {
        "id": "exhale-the-wake",
        "name": "Exhale the Wake",
        "kind": "utility",
        "toHit": null,
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "The field splits along old seams. 1d4 Cinder Nits, 1d4 Gravewax Grubs, and 1d4 Crypt Instars emerge in unoccupied spaces in or within 10 feet of the lychfield’s space. They act on the lychfield’s Initiative, taking their first turns immediately after this one."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "close-over",
          "name": "Close Over",
          "kind": "save",
          "toHit": null,
          "save": {
            "ability": "str",
            "dc": 20,
            "onSave": "negates"
          },
          "text": "Strength Saving Throw: DC 20, one creature in the lychfield’s space. Failure: The ground closes on the target’s legs, and it has the Restrained condition (escape DC 20). The lychfield can’t take this action again until the start of its next turn."
        },
        {
          "id": "husk-burst",
          "name": "Husk Burst",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "3d8",
              "type": "piercing"
            }
          ],
          "save": {
            "ability": "dex",
            "dc": 19,
            "onSave": "half"
          },
          "text": "Dexterity Saving Throw: DC 19, each creature in a 10-foot-radius Sphere centered on a point in the lychfield’s space. Failure: 13 (3d8) Piercing damage as buried casings shatter upward. Success: Half damage only. The lychfield can’t take this action again until the start of its next turn."
        },
        {
          "id": "wakelight",
          "name": "Wakelight",
          "kind": "save",
          "toHit": null,
          "save": {
            "ability": "wis",
            "dc": 19,
            "onSave": "negates"
          },
          "text": "Buried lights kindle under the surface. Wisdom Saving Throw: DC 19, one creature in or within 30 feet of the lychfield’s space that can see it. Failure: The target has the Charmed condition until the start of its next turn and must move toward or into the lychfield’s space on its turn if able. The lychfield can’t take this action again until the start of its next turn."
        }
      ]
    }
  },
]
