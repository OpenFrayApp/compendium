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

export const handsOfTheHostCreatures: Creature[] = [
  {
    "id": "openfray-brood-and-bloom:almoner",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Almoner",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "any evil alignment",
    "description": "A clean recruiter for the Hands of the Host, and the only member of the cult carrying nothing at all. An almoner arrives during an outbreak with real medicine and real food, gives both away without conditions, and doesn’t say who sent them. They can’t be given the cult’s rite until they have delivered somebody else to it, so every kindness is also an audition.",
    "ac": 13,
    "maxHp": 39,
    "hpFormula": "6d8+12",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 10,
      "dex": 14,
      "con": 14,
      "int": 13,
      "wis": 15,
      "cha": 17
    },
    "saves": {
      "wis": 4,
      "cha": 5
    },
    "skills": {
      "deception": 7,
      "insight": 4,
      "medicine": 6,
      "persuasion": 7
    },
    "senses": {
      "passivePerception": 12
    },
    "languages": [
      "Common"
    ],
    "gear": [
      "Knife",
      "Leather Armor"
    ],
    "cr": 1,
    "xp": 200,
    "traits": [
      {
        "name": "Practiced Hands",
        "text": "The almoner has Advantage on Wisdom (Medicine) checks made to treat a brood disease, and on Charisma (Deception) checks made to pass as an officer of the Lazaret."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The almoner makes two Knife attacks."
      },
      {
        "id": "knife",
        "name": "Knife",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d4+2",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) Piercing damage."
      },
      {
        "id": "physic",
        "name": "Physic",
        "kind": "utility",
        "toHit": null,
        "recharge": {
          "type": "perDay",
          "value": 3
        },
        "text": "The almoner treats one creature within 5 feet. The target regains 10 (3d6) Hit Points, or loses 1d4 Spore Load, or the Poisoned condition on it ends. The almoner chooses which."
      }
    ],
    "reactions": [
      {
        "id": "vouch",
        "name": "Vouch",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature within 30 feet that the almoner can see makes a Charisma (Deception) or Charisma (Persuasion) check about one of the almoner’s allies or the source of their supplies. Response: The check succeeds."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:postulant",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Postulant",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "lawful evil",
    "description": "The newest grade of the Hands of the Host: days or weeks past the rite, with a graft rooted and nothing yet moved. Postulants dig, carry, and hold doors, and most of them still have family somewhere who are looking for them. A cell gives them the ground before it gives them anyone to talk to.",
    "ac": 12,
    "maxHp": 44,
    "hpFormula": "8d8+8",
    "speed": {
      "walk": 30
    },
    "initiative": 1,
    "abilities": {
      "str": 14,
      "dex": 12,
      "con": 13,
      "int": 10,
      "wis": 11,
      "cha": 12
    },
    "skills": {
      "athletics": 4,
      "religion": 2
    },
    "conditionImmunities": [
      "Frightened"
    ],
    "senses": {
      "passivePerception": 10
    },
    "languages": [
      "Common"
    ],
    "gear": [
      "Spade"
    ],
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Grafted (Stage 1)",
        "text": "The postulant carries an Inquiline graft and is under the effect of a Countenance spell, so it shows none of that stage’s penalties or marks. A postulant met before the effect is renewed has the penalties of stage 1 of its line’s disease."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The postulant makes two Spade attacks."
      },
      {
        "id": "spade",
        "name": "Spade",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+2",
            "type": "slashing"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 9 (2d6 + 2) Slashing damage."
      },
      {
        "id": "offer",
        "name": "Offer",
        "kind": "save",
        "toHit": null,
        "save": {
          "ability": "wis",
          "dc": 11,
          "onSave": "none"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "The postulant holds out an open hand. Wisdom Saving Throw: DC 11, one creature within 5 feet that can see the postulant. A creature that has watched a member of the Hands of the Host die makes this save with Advantage. Failure: The target has Disadvantage on attack rolls against the postulant until the end of the postulant’s next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:sexton",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Sexton",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "lawful evil",
    "description": "The hand who keeps a cell’s ground and lays out the dead who go into it. A sexton works at night, alone, at a distance from the cell, and knows to the hour how long a body stays worth carrying. The office goes to the newest hands, on the reasoning that whoever will be going into that ground eventually should learn it while they can still dig.",
    "ac": 14,
    "maxHp": 127,
    "hpFormula": "17d8+51",
    "speed": {
      "walk": 30
    },
    "initiative": 5,
    "abilities": {
      "str": 18,
      "dex": 14,
      "con": 16,
      "int": 11,
      "wis": 13,
      "cha": 9
    },
    "saves": {
      "con": 6
    },
    "skills": {
      "athletics": 7,
      "perception": 4,
      "stealth": 5
    },
    "senses": {
      "darkvision": 60,
      "passivePerception": 14
    },
    "languages": [
      "Common"
    ],
    "gear": [
      "Hook",
      "Spade",
      "Studded Leather Armor"
    ],
    "cr": 6,
    "xp": 2300,
    "traits": [
      {
        "name": "Grafted (Stage 1)",
        "text": "The sexton carries an Inquiline graft and is under the effect of a Countenance spell, so it shows none of that stage’s penalties or marks. A sexton met before the effect is renewed has the penalties of stage 1 of its line’s disease."
      },
      {
        "name": "Ground Sense",
        "text": "The sexton knows the location of every corpse within 60 feet, whether or not anything has been laid in it, and which of them died within the last day."
      },
      {
        "name": "Nightworker",
        "text": "The sexton has Advantage on Dexterity (Stealth) checks made in Dim Light or Darkness."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The sexton makes two Spade attacks. It can replace either of them with a Hook attack."
      },
      {
        "id": "spade",
        "name": "Spade",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d12+4",
            "type": "slashing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 17 (2d12 + 4) Slashing damage."
      },
      {
        "id": "hook",
        "name": "Hook",
        "kind": "melee",
        "toHit": 7,
        "reach": 10,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 10 ft. Hit: 13 (2d8 + 4) Piercing damage, and if the target is Large or smaller it is pulled up to 10 feet straight toward the sexton."
      },
      {
        "id": "consign",
        "name": "Consign",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "bludgeoning"
          }
        ],
        "save": {
          "ability": "str",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "The sexton drives a hook into one creature and hauls it down. Strength Saving Throw: DC 15, one Medium or smaller creature within 10 feet. Failure: 21 (6d6) Bludgeoning damage, and the target is pulled to an unoccupied space within 5 feet of the sexton and has the Grappled (escape DC 15) and Prone conditions. Success: Half damage only. While a creature is Grappled this way, the sexton has Advantage on attack rolls against it and moves at full Speed while dragging it."
      }
    ],
    "reactions": [
      {
        "id": "second-offer",
        "name": "Second Offer",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature within 5 feet of the sexton dies. Response: The sexton takes hold of the corpse and moves up to 15 feet. A corpse carried this way doesn’t slow the sexton and doesn’t count against what it can carry."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:ostiary",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Ostiary",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "lawful evil",
    "description": "The doorkeeper of a cell of the Hands of the Host. An ostiary performs the rite, keeps the clutch of latchkin fed, and decides who is admitted, which makes them the only hand in a cell who knows every other hand by name. When measures run short they decide who is passed over, and nothing in the cult’s book covers the decision.",
    "ac": 16,
    "maxHp": 165,
    "hpFormula": "22d8+66",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 12,
      "dex": 14,
      "con": 16,
      "int": 15,
      "wis": 17,
      "cha": 16
    },
    "saves": {
      "wis": 6,
      "cha": 6
    },
    "skills": {
      "insight": 6,
      "medicine": 6,
      "perception": 6,
      "persuasion": 6
    },
    "senses": {
      "passivePerception": 16
    },
    "languages": [
      "Common"
    ],
    "gear": [
      "Ceremonial Blade",
      "Chain Shirt",
      "Shield"
    ],
    "cr": 8,
    "xp": 3900,
    "traits": [
      {
        "name": "Grafted (Stage 2)",
        "text": "The ostiary carries an Inquiline graft and is under the effect of a Countenance spell, so it shows none of that stage’s penalties or marks. An ostiary met before the effect is renewed has the penalties of stage 2 of its line’s disease."
      },
      {
        "name": "Keeper of the Clutch",
        "text": "Tiny Inquiline creatures don’t attack the ostiary, and the ostiary can direct any such creature within 30 feet as a Bonus Action."
      }
    ],
    "spellcasting": {
      "ability": "wis",
      "saveDc": 14,
      "toHit": 6,
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
              "name": "fair copy",
              "ref": "openfray-brood-and-bloom:fair-copy"
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
              "name": "assumption of the case",
              "ref": "openfray-brood-and-bloom:assumption-of-the-case"
            },
            {
              "name": "lazaret sill",
              "ref": "openfray-brood-and-bloom:lazaret-sill"
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
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The ostiary makes two Ceremonial Blade attacks."
      },
      {
        "id": "ceremonial-blade",
        "name": "Ceremonial Blade",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+2",
            "type": "slashing"
          },
          {
            "formula": "3d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 11 (2d8 + 2) Slashing damage plus 10 (3d6) Necrotic damage."
      },
      {
        "id": "admit",
        "name": "Admit",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "5d8",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "cha",
          "dc": 14,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Charisma Saving Throw: DC 14, one creature the ostiary can see within 30 feet. Failure: 22 (5d8) Psychic damage, and the target can’t willingly move away from the ostiary until the end of its next turn. Success: Half damage only."
      }
    ],
    "reactions": [
      {
        "id": "bar-the-door",
        "name": "Bar the Door",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature the ostiary can see moves toward the clutch or the sacristy. Response: The ostiary casts Lazaret Sill, if it has a use of that spell remaining."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:ciborium",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Ciborium",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "lawful evil",
    "description": "The third grade of the Hands of the Host, named for the vessel that holds the host. A ciborium’s graft stands up under the skin in a thick pale line from the wrist to the collarbone, and its legs have mostly stopped being useful. It is found in a room, usually seated, behind whatever the cell could put in the way, and it counts the depth of its own case to the point.",
    "ac": 17,
    "maxHp": 210,
    "hpFormula": "28d8+84",
    "speed": {
      "walk": 20
    },
    "initiative": -1,
    "abilities": {
      "str": 18,
      "dex": 8,
      "con": 17,
      "int": 13,
      "wis": 15,
      "cha": 14
    },
    "saves": {
      "con": 7,
      "wis": 6
    },
    "skills": {
      "perception": 6
    },
    "conditionImmunities": [
      "Charmed",
      "Frightened"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 16
    },
    "languages": [
      "Common"
    ],
    "gear": [
      "Cane"
    ],
    "cr": 12,
    "xp": 8400,
    "traits": [
      {
        "name": "Grafted (Stage 3)",
        "text": "The ciborium carries an Inquiline graft and is under the effect of a Countenance spell, so it shows none of that stage’s penalties. The graft is visible under the skin regardless."
      },
      {
        "name": "Slow",
        "text": "The ciborium can’t take the Dash action."
      },
      {
        "name": "Depth",
        "text": "The ciborium tracks the Depth of its own graft, starting a fight with 3 Depth, and knows the count exactly. It can’t take an action, Bonus Action, or Reaction that would bring its own Depth to 6."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The ciborium makes three Graft attacks. It can replace any of them with a Cane attack, and one of them with a use of Seed."
      },
      {
        "id": "graft",
        "name": "Graft",
        "kind": "melee",
        "toHit": 8,
        "reach": 10,
        "damage": [
          {
            "formula": "4d10+4",
            "type": "piercing"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 10 ft. Hit: 26 (4d10 + 4) Piercing damage, and the ciborium can spend 1 of its own Depth. If it does, a target that carries a graft gains 1 Depth."
      },
      {
        "id": "cane",
        "name": "Cane",
        "kind": "melee",
        "toHit": 8,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "bludgeoning"
          },
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 5 ft. Hit: 13 (2d8 + 4) Bludgeoning damage plus 7 (2d6) Poison damage."
      },
      {
        "id": "seed",
        "name": "Seed",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "text": "The ciborium spends 3 of its own Depth and can’t take this action with fewer than 3 Depth. Constitution Saving Throw: DC 15, each creature in a 15-foot Emanation originating from the ciborium. Failure: 27 (6d8) Piercing damage, and the target gains 2 Depth. Success: Half damage only, and the target gains 1 Depth. Failure or Success: A target that carries no graft of the ciborium’s line gains one."
      }
    ],
    "bonusActions": [
      {
        "id": "vessel",
        "name": "Vessel",
        "kind": "utility",
        "toHit": null,
        "text": "The ciborium takes 1 Depth from one creature within 10 feet that carries a graft, willing or not, and gains 10 Temporary Hit Points."
      }
    ],
    "reactions": [
      {
        "id": "hold",
        "name": "Hold",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: The ciborium takes damage. Response: The ciborium reduces that damage by 10 and gains 1 Depth."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:the-first-graft",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "The First Graft",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "lawful evil",
    "description": "The lector who spent eleven years copying case records in the order’s houses, drew the opposite of everything the order teaches out of them, published it, and walked out with a hundred and forty pages. He has held at the third stage for decades and has no intention of moving, which costs him a program of magical care in exactly the proportion required and most of what his cells can bring him. Parties expecting a raving heretic meet a tired administrator who asks careful questions about their symptoms.",
    "ac": 17,
    "maxHp": 270,
    "hpFormula": "36d8+108",
    "speed": {
      "walk": 30
    },
    "initiative": 13,
    "abilities": {
      "str": 12,
      "dex": 16,
      "con": 17,
      "int": 20,
      "wis": 18,
      "cha": 19
    },
    "saves": {
      "int": 10,
      "wis": 9,
      "cha": 9
    },
    "skills": {
      "deception": 9,
      "history": 10,
      "insight": 9,
      "medicine": 14,
      "perception": 9
    },
    "conditionImmunities": [
      "Charmed",
      "Frightened"
    ],
    "senses": {
      "passivePerception": 19
    },
    "languages": [
      "Common",
      "Deep Speech",
      "plus two other languages"
    ],
    "gear": [
      "Lector’s Blade",
      "Studded Leather Armor"
    ],
    "cr": 15,
    "xp": 13000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the First Graft fails a saving throw, he can choose to succeed instead."
      },
      {
        "name": "Grafted (Stage 3)",
        "text": "The First Graft carries an Inquiline graft and is under the effect of a Countenance spell, so he shows none of that stage’s penalties or marks."
      },
      {
        "name": "Held",
        "text": "The First Graft gains no Depth from a Long Rest, from any effect in this library, or from any spell he casts."
      },
      {
        "name": "Lector’s Eye",
        "text": "The First Graft knows the line, stage, and Depth of every graft, the Spore Load of every creature, and whether anything is laid in any corpse, for every creature and body he can see. No suppression conceals any of it from him."
      }
    ],
    "spellcasting": {
      "ability": "int",
      "saveDc": 18,
      "toHit": 10,
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
              "name": "detect magic",
              "ref": "srd-5.2:detect-magic"
            },
            {
              "name": "fair copy",
              "ref": "openfray-brood-and-bloom:fair-copy"
            },
            {
              "name": "latchwork",
              "ref": "openfray-brood-and-bloom:latchwork"
            },
            {
              "name": "mage hand",
              "ref": "srd-5.2:mage-hand"
            },
            {
              "name": "minor illusion",
              "ref": "srd-5.2:minor-illusion"
            }
          ]
        },
        {
          "usage": {
            "type": "perDay",
            "per": 3
          },
          "spells": [
            {
              "name": "assumption of the case",
              "ref": "openfray-brood-and-bloom:assumption-of-the-case"
            },
            {
              "name": "counterspell",
              "ref": "srd-5.2:counterspell"
            },
            {
              "name": "dispel magic",
              "ref": "srd-5.2:dispel-magic"
            },
            {
              "name": "exacerbation",
              "ref": "openfray-brood-and-bloom:exacerbation"
            },
            {
              "name": "misty step",
              "ref": "srd-5.2:misty-step"
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
              "name": "chantry tithe",
              "ref": "openfray-brood-and-bloom:chantry-tithe"
            },
            {
              "name": "greater invisibility",
              "ref": "srd-5.2:greater-invisibility"
            },
            {
              "name": "instar",
              "ref": "openfray-brood-and-bloom:instar"
            },
            {
              "name": "wall of force",
              "ref": "srd-5.2:wall-of-force"
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
              "name": "second assignment",
              "ref": "openfray-brood-and-bloom:second-assignment"
            },
            {
              "name": "sequestration",
              "ref": "openfray-brood-and-bloom:sequestration"
            },
            {
              "name": "telekinesis",
              "ref": "srd-5.2:telekinesis"
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
        "text": "The First Graft makes three Lector’s Blade attacks."
      },
      {
        "id": "lectors-blade",
        "name": "Lector’s Blade",
        "kind": "melee",
        "toHit": 8,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+3",
            "type": "slashing"
          },
          {
            "formula": "3d6",
            "type": "necrotic"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 5 ft. Hit: 12 (2d8 + 3) Slashing damage plus 10 (3d6) Necrotic damage."
      },
      {
        "id": "read-the-case",
        "name": "Read the Case",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d10",
            "type": "psychic"
          }
        ],
        "save": {
          "ability": "wis",
          "dc": 18,
          "onSave": "half"
        },
        "recharge": {
          "type": "dice",
          "value": 5
        },
        "text": "Wisdom Saving Throw: DC 18, one creature the First Graft can see within 60 feet. A creature carrying a graft makes this save with Disadvantage. Failure: 33 (6d10) Psychic damage, and the target has Disadvantage on saving throws until the end of its next turn. Success: Half damage only."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "annotate",
          "name": "Annotate",
          "kind": "utility",
          "toHit": null,
          "text": "The First Graft makes one Lector’s Blade attack."
        },
        {
          "id": "correct",
          "name": "Correct",
          "kind": "utility",
          "toHit": null,
          "text": "One creature within 30 feet that carries a graft gains 1 Depth. If this brings the creature to stage 4, stage 4 arrives on its usual schedule rather than at once. The First Graft can’t take this action again until the start of his next turn."
        },
        {
          "id": "move",
          "name": "Move",
          "kind": "utility",
          "toHit": null,
          "text": "The First Graft moves up to his Speed without provoking Opportunity Attacks. He can’t take this action again until the start of his next turn."
        }
      ]
    }
  }
]
