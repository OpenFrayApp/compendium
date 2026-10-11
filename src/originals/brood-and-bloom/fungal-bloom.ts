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

export const fungalBloomCreatures: Creature[] = [
  {
    "id": "openfray-brood-and-bloom:driftling",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Driftling",
    "size": "Tiny",
    "type": "plant",
    "alignment": "unaligned",
    "description": "A spore that has germinated and not yet settled: fingernail-sized, the color of wet paper, and too light to steer its own course. What it becomes depends entirely on what it comes down on — damp flesh, burned ground, or old stone. A driftling left alone for a day is no longer a driftling.",
    "ac": 11,
    "maxHp": 4,
    "hpFormula": "1d4+2",
    "speed": {
      "walk": 0,
      "fly": 5
    },
    "initiative": 1,
    "abilities": {
      "str": 3,
      "dex": 12,
      "con": 14,
      "int": 1,
      "wis": 6,
      "cha": 1
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "blindsight": 10,
      "passivePerception": 8
    },
    "cr": 0,
    "xp": 10,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The driftling is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the driftling makes a DC 11 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the driftling can’t regain Hit Points, the Difficulty Class of its Sporing decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Windborne",
        "text": "The driftling has no legs and does not walk. It is carried on moving air, and its Fly Speed changes with the weather.\n\n|Air|Fly Speed|\n|---|---|\n|Still|5 ft.|\n|A breeze|15 ft.|\n|Strong wind|30 ft., and all of its movement must be downwind|\n|Gale or stronger|It can’t move deliberately. At the start of each of its turns it is carried 1d10 × 10 feet downwind.|\n\nA driftling carried out of an encounter this way is not destroyed and does not come back. It lands somewhere else."
      },
      {
        "name": "Taking",
        "text": "If the driftling spends 24 hours undisturbed on viable substrate, it is replaced by the stage 2 creature for that substrate. On living flesh, a Lesser Restoration spell cast before the 24 hours elapse destroys it."
      }
    ],
    "actions": [
      {
        "id": "tendril",
        "name": "Tendril",
        "kind": "melee",
        "toHit": 3,
        "reach": 5,
        "damage": [
          {
            "formula": "1d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +3, reach 5 ft. Hit: 2 (1d4) Poison damage, and the target gains 1 Spore Load."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:spore-veil",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Spore Veil",
    "size": "Large",
    "type": "swarm of tiny plants",
    "alignment": "unaligned",
    "description": "Driftlings that never landed, held together by the colony that made them. From a distance it is a haze; from inside, a wall of grit that gets into everything. It thickens in still air, stretches thin in a breeze, and has never once chosen a direction.",
    "ac": 12,
    "maxHp": 75,
    "hpFormula": "10d10+20",
    "speed": {
      "walk": 0,
      "fly": 20,
      "hover": true
    },
    "initiative": 2,
    "abilities": {
      "str": 3,
      "dex": 14,
      "con": 14,
      "int": 1,
      "wis": 6,
      "cha": 1
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
      "passivePerception": 8
    },
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Swarm",
        "text": "The veil can occupy another creature’s space and vice versa, and it can move through any opening large enough for a Tiny creature. It can’t regain Hit Points or gain Temporary Hit Points."
      },
      {
        "name": "Mycelial Chorus",
        "text": "The veil is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the veil makes a DC 12 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the veil can’t regain Hit Points, the Difficulty Class of its Sporing decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Windborne",
        "text": "The veil is carried on moving air, and its Fly Speed changes with the weather. It can hover only in still air.\n\n|Air|Fly Speed|\n|---|---|\n|Still|20 ft.|\n|A breeze|30 ft.|\n|Strong wind|45 ft., and all of its movement must be downwind|\n|Gale or stronger|It can’t move deliberately or use Engulf. At the start of each of its turns it is carried 1d10 × 10 feet downwind.|\n\nA veil carried out of an encounter this way is not destroyed and does not come back."
      }
    ],
    "actions": [
      {
        "id": "engulf",
        "name": "Engulf",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 12, each creature in the veil’s space. Failure: 14 (4d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-whelp",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Whelp",
    "size": "Small",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "Knee-high and already gray. Orcshrooms are born colonized, not infected — the ribbing is present at birth, the crest comes in with the teeth. Whelps run messages for the warband, and they are not kept out of a fight so much as positioned inside one.",
    "ac": 13,
    "maxHp": 60,
    "hpFormula": "11d6+22",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 12,
      "dex": 14,
      "con": 14,
      "int": 8,
      "wis": 10,
      "cha": 8
    },
    "skills": {
      "stealth": 4
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 10
    },
    "languages": [
      "Orc"
    ],
    "cr": 0.5,
    "xp": 100,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The whelp is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the whelp has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the whelp makes a DC 11 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the whelp can’t regain Hit Points, the Difficulty Class of its Sporing decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Pack Tactics",
        "text": "The whelp has Advantage on an attack roll against a creature if at least one of the whelp’s allies is within 5 feet of the creature and the ally doesn’t have the Incapacitated condition."
      }
    ],
    "actions": [
      {
        "id": "shortspear",
        "name": "Shortspear",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d6+2",
            "type": "piercing"
          },
          {
            "formula": "2d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 5 (1d6 + 2) Piercing damage plus 5 (2d4) Poison damage."
      }
    ],
    "bonusActions": [
      {
        "id": "scurry",
        "name": "Scurry",
        "kind": "utility",
        "toHit": null,
        "text": "The whelp takes the Disengage action."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:spore-struck",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Spore-Struck",
    "size": "Medium",
    "type": "humanoid",
    "alignment": "neutral evil",
    "description": "Not yet an orcshroom, and no longer whoever it was. The gray climbs the throat, the cough produces dust, and the victim slowly loses interest in everything except being somewhere else. A spore-struck can be of any species, and is most often whoever the tribe took last.",
    "ac": 12,
    "maxHp": 71,
    "hpFormula": "11d8+22",
    "speed": {
      "walk": 30
    },
    "initiative": 0,
    "abilities": {
      "str": 14,
      "dex": 10,
      "con": 14,
      "int": 10,
      "wis": 10,
      "cha": 8
    },
    "resistances": [
      "Poison"
    ],
    "senses": {
      "darkvision": 60,
      "passivePerception": 10
    },
    "languages": [
      "the languages it knew before"
    ],
    "cr": 1,
    "xp": 200,
    "traits": [
      {
        "name": "Drawn",
        "text": "The spore-struck knows the direction of the colony that infected it. If it starts its turn with no creature within 30 feet of it, it must use its movement to move toward that colony."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the spore-struck makes a DC 11 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Sick",
        "text": "While in sunlight, the spore-struck can’t regain Hit Points."
      },
      {
        "name": "Not Yet Gone",
        "text": "If a Lesser Restoration spell is cast on the spore-struck while it has more than 0 Hit Points, the infection ends. It is no longer a Sporophore, loses every trait in this stat block, and is whoever it was."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The spore-struck makes two Claw attacks."
      },
      {
        "id": "claw",
        "name": "Claw",
        "kind": "melee",
        "toHit": 4,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+2",
            "type": "slashing"
          },
          {
            "formula": "1d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 5 ft. Hit: 6 (1d8 + 2) Slashing damage plus 3 (1d6) Poison damage."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-stalker",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Stalker",
    "size": "Medium",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "Leaner than the warriors and grown low, the crest flattened back along the skull and the gill-ribbing reduced to a fine gray stipple. Stalkers range days ahead of the warband. They do not track by sight or scent but by the spores the tribe has already put into the world.",
    "ac": 14,
    "maxHp": 91,
    "hpFormula": "14d8+28",
    "speed": {
      "walk": 30,
      "climb": 30
    },
    "initiative": 3,
    "abilities": {
      "str": 14,
      "dex": 16,
      "con": 14,
      "int": 10,
      "wis": 12,
      "cha": 8
    },
    "skills": {
      "perception": 3,
      "stealth": 5
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 13
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon"
    ],
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The stalker is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the stalker has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the stalker makes a DC 12 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the stalker can’t regain Hit Points, the Difficulty Class of its Sporing and Burst Spores decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Spoor-Reader",
        "text": "The stalker knows the location of every creature within 1 mile that has 1 or more Spore Load, and it shares that knowledge with its colony through Mycelial Chorus."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The stalker makes two attacks, using Handaxe or Shortbow in any combination. It can replace one attack with a use of Burst Spores."
      },
      {
        "id": "handaxe",
        "name": "Handaxe",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "range": {
          "normal": 20,
          "long": 60
        },
        "damage": [
          {
            "formula": "1d6+3",
            "type": "slashing"
          },
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "text": "Melee or Ranged Attack Roll: +5, reach 5 feet or range 20/60 ft. Hit: 6 (1d6 + 3) Slashing damage plus 7 (2d6) Poison damage."
      },
      {
        "id": "shortbow",
        "name": "Shortbow",
        "kind": "ranged",
        "toHit": 5,
        "range": {
          "normal": 80,
          "long": 320
        },
        "damage": [
          {
            "formula": "1d6+3",
            "type": "piercing"
          },
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "text": "Ranged Attack Roll: +5, range 80/320 ft. Hit: 6 (1d6 + 3) Piercing damage plus 7 (2d6) Poison damage."
      },
      {
        "id": "burst-spores",
        "name": "Burst Spores",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d4",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 5 (2d4) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: A target that has 3 or more Spore Load also has the Incapacitated condition until the end of its next turn."
      }
    ],
    "bonusActions": [
      {
        "id": "slip-away",
        "name": "Slip Away",
        "kind": "utility",
        "toHit": null,
        "text": "The stalker takes the Disengage or Hide action."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom",
    "size": "Medium",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "A head taller than a living orc, and gray where an orc is green. Pale ribbing climbs the throat and splits into a low crest across the skull, and the whole body sheds a fine dust that hangs in still air. It carries a spear it made itself, and it argues with its warband in Orc while it fights.",
    "ac": 15,
    "maxHp": 97,
    "hpFormula": "13d8+39",
    "speed": {
      "walk": 30
    },
    "initiative": 1,
    "abilities": {
      "str": 16,
      "dex": 12,
      "con": 16,
      "int": 10,
      "wis": 11,
      "cha": 10
    },
    "skills": {
      "athletics": 5,
      "intimidation": 4
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 10
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon"
    ],
    "cr": 3,
    "xp": 700,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The orcshroom is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the orcshroom has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the orcshroom makes a DC 13 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the orcshroom can’t regain Hit Points, the Difficulty Class of its Sporing and Burst Spores decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The orcshroom makes one Spear attack and uses Burst Spores."
      },
      {
        "id": "spear",
        "name": "Spear",
        "kind": "melee",
        "toHit": 5,
        "reach": 5,
        "damage": [
          {
            "formula": "3d6+3",
            "type": "piercing"
          },
          {
            "formula": "3d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 5 ft. Hit: 13 (3d6 + 3) Piercing damage plus 7 (3d4) Poison damage."
      },
      {
        "id": "burst-spores",
        "name": "Burst Spores",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 13, each creature in a 15-foot Cone. Failure: 7 (2d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: A target that has 3 or more Spore Load also has the Incapacitated condition until the end of its next turn."
      }
    ],
    "bonusActions": [
      {
        "id": "aggressive",
        "name": "Aggressive",
        "kind": "utility",
        "toHit": null,
        "text": "The orcshroom moves up to its Speed toward a hostile creature it can see."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:blightboar",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Blightboar",
    "size": "Large",
    "type": "plant (beast)",
    "alignment": "unaligned",
    "description": "A cave boar that stopped being one. The bristles have gone over to gray filament, the tusks are sheathed in shelf-growth, and a crest of gills runs the spine and opens when the animal runs. Tribes herd them, eat them, and drive them ahead of a raid. Nothing about the animal objects.",
    "ac": 14,
    "maxHp": 123,
    "hpFormula": "13d10+52",
    "speed": {
      "walk": 40
    },
    "initiative": 1,
    "abilities": {
      "str": 18,
      "dex": 12,
      "con": 18,
      "int": 2,
      "wis": 10,
      "cha": 5
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 60,
      "passivePerception": 10
    },
    "cr": 4,
    "xp": 1100,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The blightboar is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly. While at least one other member of its colony is within 60 feet, the blightboar has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the blightboar makes a DC 13 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the blightboar can’t regain Hit Points, the Difficulty Class of its Sporing decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Relentless",
        "text": "If damage reduces the blightboar to 0 Hit Points, it drops to 1 Hit Point instead if the damage was not Radiant or Fire damage. It can’t use this trait again until it finishes a Long Rest."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The blightboar makes two Tusk attacks."
      },
      {
        "id": "tusk",
        "name": "Tusk",
        "kind": "melee",
        "toHit": 6,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+4",
            "type": "piercing"
          },
          {
            "formula": "2d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +6, reach 5 ft. Hit: 11 (2d6 + 4) Piercing damage plus 5 (2d4) Poison damage. If the blightboar moved at least 20 feet straight toward the target immediately before the hit, the target has the Prone condition."
      },
      {
        "id": "spore-trail",
        "name": "Spore Trail",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "The blightboar moves up to its Speed without provoking Opportunity Attacks and leaves a trail of spores in every space it leaves. The trail lasts until the end of the blightboar’s next turn. Constitution Saving Throw: DC 13, each creature that enters the trail or ends its turn in it. Failure: 7 (2d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-sporespeaker",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Sporespeaker",
    "size": "Medium",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "Where the warriors grew plates, the sporespeaker grew inward: its ribcage has opened into a shallow basket of pale gills that flex as it breathes. It speaks for the colony in a voice not quite its own, and the tribe defers to it on everything except the fighting.",
    "ac": 14,
    "maxHp": 120,
    "hpFormula": "16d8+48",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 12,
      "dex": 14,
      "con": 16,
      "int": 12,
      "wis": 17,
      "cha": 14
    },
    "saves": {
      "con": 6,
      "wis": 6
    },
    "skills": {
      "medicine": 6,
      "nature": 4,
      "perception": 6
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 16
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon"
    ],
    "cr": 5,
    "xp": 1800,
    "spellcasting": {
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
              "name": "druidcraft",
              "ref": "srd-5.2:druidcraft"
            },
            {
              "name": "poison spray",
              "ref": "srd-5.2:poison-spray"
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
              "name": "entangle",
              "ref": "srd-5.2:entangle"
            },
            {
              "name": "glebe",
              "ref": "openfray-brood-and-bloom:glebe"
            },
            {
              "name": "spike growth",
              "ref": "srd-5.2:spike-growth"
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
              "name": "plant growth",
              "ref": "srd-5.2:plant-growth"
            }
          ]
        }
      ],
      "ability": "wis",
      "saveDc": 14
    },
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The sporespeaker is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the sporespeaker has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the sporespeaker makes a DC 14 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the sporespeaker can’t regain Hit Points, the Difficulty Class of its Sporing and Spore Bloom decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Voice of the Colony",
        "text": "Each allied member of the tribe within 60 feet of the sporespeaker has Advantage on saving throws against being Charmed or Frightened, whether or not another member of its colony is nearby."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The sporespeaker makes two Blightstaff attacks. It can replace one attack with a use of Spore Bloom."
      },
      {
        "id": "blightstaff",
        "name": "Blightstaff",
        "kind": "melee",
        "toHit": 6,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+3",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +6, reach 5 ft. Hit: 7 (1d8 + 3) Bludgeoning damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "spore-bloom",
        "name": "Spore Bloom",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 14,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Constitution Saving Throw: DC 14, each creature in a 15-foot-radius Sphere centered on a point the sporespeaker can see within 60 feet. Failure: 14 (4d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: A target that has 3 or more Spore Load also has the Blinded condition until the end of its next turn."
      }
    ],
    "bonusActions": [
      {
        "id": "draw-from-the-sown",
        "name": "Draw from the Sown",
        "kind": "utility",
        "toHit": null,
        "text": "One allied member of the tribe the sporespeaker can see within 30 feet regains Hit Points equal to 5 × the number of creatures within 30 feet of the sporespeaker that have 1 or more Spore Load, to a maximum of 20."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-warchief",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Warchief",
    "size": "Medium",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "The crest has thickened into a plate running from brow to shoulder, and the ribbing down the arms has fused into something closer to armor than skin. A warchief fights at the front of the warband and never more than a few paces from it.",
    "ac": 16,
    "maxHp": 127,
    "hpFormula": "15d8+60",
    "speed": {
      "walk": 30
    },
    "initiative": 1,
    "abilities": {
      "str": 18,
      "dex": 12,
      "con": 18,
      "int": 10,
      "wis": 12,
      "cha": 12
    },
    "saves": {
      "str": 7,
      "con": 7
    },
    "skills": {
      "athletics": 7,
      "intimidation": 4
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Frightened",
      "Poisoned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 11
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon"
    ],
    "cr": 6,
    "xp": 2300,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The warchief is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the warchief has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the warchief makes a DC 16 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the warchief can’t regain Hit Points, the Difficulty Class of its Sporing and Burst Spores decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The warchief makes two Battleaxe attacks. It can replace one attack with a use of Burst Spores."
      },
      {
        "id": "battleaxe",
        "name": "Battleaxe",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "slashing"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Slashing damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "burst-spores",
        "name": "Burst Spores",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "5d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Constitution Saving Throw: DC 15, each creature in a 20-foot Cone. Failure: 17 (5d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: A target that has 3 or more Spore Load also has the Incapacitated condition until the end of its next turn."
      }
    ],
    "bonusActions": [
      {
        "id": "drive-them-on",
        "name": "Drive Them On",
        "kind": "utility",
        "toHit": null,
        "text": "One allied member of the tribe the warchief can see within 60 feet moves up to its Speed and makes one attack."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-chieftain",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Chieftain",
    "size": "Medium",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "The growth has stopped pretending to be an orc. Gray shelf-fungus stands out from the shoulders and back in overlapping tiers, and the head sits low between them. The chieftain is the oldest walking thing in the tribe, and the only one the colony speaks through directly.",
    "ac": 16,
    "maxHp": 152,
    "hpFormula": "16d8+80",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 20,
      "dex": 14,
      "con": 20,
      "int": 10,
      "wis": 12,
      "cha": 10
    },
    "saves": {
      "str": 8,
      "con": 8
    },
    "skills": {
      "athletics": 8,
      "intimidation": 5
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Frightened",
      "Paralyzed",
      "Poisoned",
      "Stunned"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 11
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon"
    ],
    "cr": 7,
    "xp": 2900,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The chieftain is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the chieftain has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the chieftain makes a DC 17 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the chieftain can’t regain Hit Points, the Difficulty Class of its Sporing and Burst Spores decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Reckless",
        "text": "At the start of its turn, the chieftain can gain Advantage on all melee attack rolls it makes during that turn. Attack rolls against it have Advantage until the start of its next turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The chieftain makes two Greataxe attacks. It can replace one attack with a use of Burst Spores."
      },
      {
        "id": "greataxe",
        "name": "Greataxe",
        "kind": "melee",
        "toHit": 8,
        "reach": 5,
        "damage": [
          {
            "formula": "2d12+5",
            "type": "slashing"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 5 ft. Hit: 18 (2d12 + 5) Slashing damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "fist",
        "name": "Fist",
        "kind": "melee",
        "toHit": 8,
        "reach": 5,
        "damage": [
          {
            "formula": "1d8+5",
            "type": "bludgeoning"
          },
          {
            "formula": "3d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 5 ft. Hit: 9 (1d8 + 5) Bludgeoning damage plus 7 (3d4) Poison damage."
      },
      {
        "id": "burst-spores",
        "name": "Burst Spores",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Constitution Saving Throw: DC 16, each creature in a 20-foot Cone. Failure: 21 (6d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: A target that has 3 or more Spore Load also has the Incapacitated condition until the end of its next turn."
      }
    ],
    "bonusActions": [
      {
        "id": "grasping-hyphae",
        "name": "Grasping Hyphae",
        "kind": "save",
        "toHit": null,
        "save": {
          "ability": "str",
          "dc": 16,
          "onSave": "negates"
        },
        "text": "Strength Saving Throw: DC 16, one creature the chieftain can see within 20 feet that is standing on soil, timber, or fungal growth. Failure: The target has the Restrained condition until the end of its next turn."
      }
    ],
    "reactions": [
      {
        "id": "low-blow",
        "name": "Low Blow",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: A creature within 5 feet of the chieftain misses it with an attack roll. Response: The chieftain makes one Fist attack against that creature."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:orcshroom-bulwark",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Orcshroom Bulwark",
    "size": "Large",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "The growth wins eventually, and a bulwark is what winning looks like. The shelf-fungus has closed over shoulders and back in one fused mass, the arms have thickened past holding a weapon, and the head has sunk into the chest. A bulwark cannot run and does not need to; tribes stand them in doorways and leave them there for years.",
    "ac": 18,
    "maxHp": 168,
    "hpFormula": "16d10+80",
    "speed": {
      "walk": 20
    },
    "initiative": -1,
    "abilities": {
      "str": 22,
      "dex": 8,
      "con": 20,
      "int": 8,
      "wis": 12,
      "cha": 8
    },
    "saves": {
      "str": 9,
      "con": 8
    },
    "immunities": [
      "Poison"
    ],
    "conditionImmunities": [
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "darkvision": 120,
      "passivePerception": 11
    },
    "languages": [
      "Orc"
    ],
    "cr": 8,
    "xp": 3900,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The bulwark is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the bulwark has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 15 feet of the bulwark makes a DC 17 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the bulwark can’t regain Hit Points, the Difficulty Class of its Sporing and Sporeburst decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Living Wall",
        "text": "The bulwark’s space is Difficult Terrain for other creatures, and allied members of the tribe within 5 feet of it have Half Cover."
      },
      {
        "name": "Siege Growth",
        "text": "The bulwark deals double damage to objects and structures."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The bulwark makes two Slam attacks."
      },
      {
        "id": "slam",
        "name": "Slam",
        "kind": "melee",
        "toHit": 9,
        "reach": 10,
        "damage": [
          {
            "formula": "3d8+6",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +9, reach 10 ft. Hit: 19 (3d8 + 6) Bludgeoning damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "sporeburst",
        "name": "Sporeburst",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 16,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 16, each creature in a 20-foot Cone. Failure: 21 (6d6) Poison damage, and the target gains 2 Spore Load. Success: Half damage only, and the target gains 1 Spore Load. Failure or Success: A target that has 3 or more Spore Load also has the Incapacitated condition until the end of its next turn."
      }
    ],
    "reactions": [
      {
        "id": "brace",
        "name": "Brace",
        "kind": "utility",
        "toHit": null,
        "text": "Trigger: An allied member of the tribe within 5 feet of the bulwark is hit by an attack roll. Response: The bulwark becomes the target of that attack instead, using the same roll to determine whether it hits."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:rootfather",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Rootfather",
    "size": "Huge",
    "type": "plant (orc)",
    "alignment": "chaotic evil",
    "description": "The reason there is a tribe rather than sixty separate infections. He has not moved in decades; the legs went to root long ago, and what shows above ground is a mass of pale shelving four times the size of the orc it grew from. His head is still an orc's, buried to the jaw, and he can still use it — slowly, and at evident cost. Most of what he says, he says through somebody else's mouth.",
    "ac": 17,
    "maxHp": 207,
    "hpFormula": "18d12+90",
    "speed": {
      "walk": 0
    },
    "initiative": 6,
    "abilities": {
      "str": 20,
      "dex": 6,
      "con": 20,
      "int": 14,
      "wis": 18,
      "cha": 16
    },
    "saves": {
      "con": 9,
      "wis": 8,
      "cha": 7
    },
    "skills": {
      "insight": 8,
      "perception": 8
    },
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
      "blindsight": 120,
      "tremorsense": 120,
      "passivePerception": 18
    },
    "languages": [
      "Common",
      "Orc",
      "Undercommon",
      "telepathy 1 mile"
    ],
    "cr": 11,
    "xp": 7200,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the rootfather fails a saving throw, he can choose to succeed instead."
      },
      {
        "name": "Mycelial Chorus",
        "text": "The rootfather is the center of his colony. He knows the direction and condition of every member of it within 5 miles and can speak through any of them."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 30 feet of the rootfather makes a DC 19 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the rootfather can’t regain Hit Points, the Difficulty Class of his Sporing and Sowing decreases by 5, and he takes 3 (1d6) Radiant damage at the end of each of his turns."
      },
      {
        "name": "Rooted",
        "text": "The rootfather can’t be moved against his will."
      },
      {
        "name": "Heart of the Colony",
        "text": "Each allied member of the tribe within 1 mile of the rootfather has Advantage on saving throws. If the rootfather dies, every member of the tribe within 1 mile has Disadvantage on attack rolls and saving throws for the next 24 hours."
      },
      {
        "name": "Regrowth",
        "text": "The rootfather regains 15 Hit Points at the start of each of his turns. This trait doesn’t function if he took Fire or Radiant damage since the end of him last turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The rootfather makes three Hypha Lash attacks. He can replace one attack with a use of Sowing."
      },
      {
        "id": "hypha-lash",
        "name": "Hypha Lash",
        "kind": "melee",
        "toHit": 9,
        "reach": 30,
        "damage": [
          {
            "formula": "2d10+5",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +9, reach 30 ft. Hit: 16 (2d10 + 5) Bludgeoning damage plus 10 (3d6) Poison damage, and the target has the Grappled condition (escape DC 17) if it is Large or smaller."
      },
      {
        "id": "sowing",
        "name": "Sowing",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d8",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 19,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 19, each creature in a 30-foot-radius Sphere centered on the rootfather. Failure: 27 (6d8) Poison damage, and the target gains 2 Spore Load. Success: Half damage only, and the target gains 1 Spore Load."
      }
    ],
    "bonusActions": [
      {
        "id": "call-the-tribe",
        "name": "Call the Tribe",
        "kind": "utility",
        "toHit": null,
        "text": "One allied member of the tribe the rootfather is aware of within 1 mile moves up to its Speed toward him, and if it ends that movement within 60 feet of him it makes one attack."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:rotgill-fleece",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Rotgill Fleece",
    "size": "Medium",
    "type": "plant",
    "alignment": "unaligned",
    "description": "A shag of pale filament growing anywhere damp enough to keep it: the underside of a jetty, a flooded cellar, the wet parts of a body that has been in the water a while. It does not move. It occupies a place people have to pass, and breathes out when they do.",
    "ac": 12,
    "maxHp": 78,
    "hpFormula": "12d8+24",
    "speed": {
      "walk": 0
    },
    "initiative": -2,
    "abilities": {
      "str": 14,
      "dex": 6,
      "con": 14,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
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
      "blindsight": 30,
      "passivePerception": 10
    },
    "cr": 1,
    "xp": 200,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The fleece is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the fleece makes a DC 12 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the fleece can’t regain Hit Points, the Difficulty Class of its Sporing and Gill-Burst decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Sessile",
        "text": "The fleece can be cut away from what it grows on. Doing so takes 1 minute, a bladed tool, and a DC 15 Dexterity (Sleight of Hand) check.\n\nSuccess: The fleece comes away whole and can be carried, replanted, or rendered down.\n\nFailure: Enough is left behind to regrow. The severed portion has half its Hit Point maximum, and what remains on the substrate becomes a new Rotgill Fleece after 1d4 days.\n\nFailure or Success: Cutting opens the gills. Each creature within 10 feet of the fleece immediately makes its Sporing saving throw."
      },
      {
        "name": "False Appearance",
        "text": "While the fleece remains motionless, it is indistinguishable from ordinary growth."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The fleece makes one Frond attack and uses Gill-Burst."
      },
      {
        "id": "frond",
        "name": "Frond",
        "kind": "melee",
        "toHit": 4,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+2",
            "type": "bludgeoning"
          },
          {
            "formula": "1d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 10 ft. Hit: 9 (2d6 + 2) Bludgeoning damage plus 3 (1d6) Poison damage."
      },
      {
        "id": "gill-burst",
        "name": "Gill-Burst",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 12, each creature in a 10-foot-radius Sphere centered on a point the fleece can see within 30 feet. Failure: 7 (2d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: The area is Lightly Obscured and remains contaminated until the end of the fleece’s next turn. A creature that enters the area or ends its turn there repeats the saving throw."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:rotgill-bell",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Rotgill Bell",
    "size": "Large",
    "type": "plant",
    "alignment": "unaligned",
    "description": "The rotgill fruiting body: a pale hood taller than a man on a thick stalk, its gills stretched tight enough to sound when they release. The note is low, carries far underground, and is how a colony fills territory it has never seen.",
    "ac": 14,
    "maxHp": 105,
    "hpFormula": "14d10+28",
    "speed": {
      "walk": 10
    },
    "initiative": -1,
    "abilities": {
      "str": 16,
      "dex": 8,
      "con": 14,
      "int": 4,
      "wis": 12,
      "cha": 6
    },
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
      "passivePerception": 11
    },
    "cr": 3,
    "xp": 700,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The bell is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the bell makes a DC 13 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the bell can’t regain Hit Points, the Difficulty Class of its Sporing and Toll decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Struck",
        "text": "Whenever the bell takes Thunder damage, it regains one expended use of Toll. It can regain no more than one use this way per round."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The bell makes two Frond attacks."
      },
      {
        "id": "frond",
        "name": "Frond",
        "kind": "melee",
        "toHit": 5,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+3",
            "type": "bludgeoning"
          },
          {
            "formula": "1d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 10 ft. Hit: 10 (2d6 + 3) Bludgeoning damage plus 3 (1d6) Poison damage."
      },
      {
        "id": "toll",
        "name": "Toll",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 13,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 13, each creature in a 15-foot-radius Sphere centered on a point the bell can see within 60 feet. Failure: 14 (4d6) Poison damage, the target gains 1 Spore Load, and it has the Deafened condition until the end of its next turn. Success: Half damage only. Failure or Success: The area remains contaminated until the end of the bell’s next turn. A creature that enters the area or ends its turn there repeats the saving throw."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:drowned-chorus",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Drowned Chorus",
    "size": "Medium",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "Whoever this was drowned standing up, over days, and never stopped talking. The lungs have gone over to pale shelving that pushes out through the chest and up the throat, and the voice comes from there now. It has every voice the colony has taken, and it uses them in the order that works.",
    "ac": 15,
    "maxHp": 136,
    "hpFormula": "16d8+64",
    "speed": {
      "walk": 30
    },
    "initiative": 1,
    "abilities": {
      "str": 18,
      "dex": 12,
      "con": 18,
      "int": 10,
      "wis": 14,
      "cha": 16
    },
    "saves": {
      "con": 7,
      "wis": 5
    },
    "skills": {
      "deception": 6,
      "persuasion": 6
    },
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
      "passivePerception": 12
    },
    "languages": [
      "Common and every language it knew before"
    ],
    "cr": 6,
    "xp": 2300,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The chorus is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the chorus has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 10 feet of the chorus makes a DC 15 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the chorus can’t regain Hit Points, the Difficulty Class of its Sporing and Drowning Song decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Many Voices",
        "text": "The chorus can speak in the voice of any creature the colony has consumed, and it has Advantage on Charisma (Deception) checks made to impersonate one of them."
      },
      {
        "name": "Still Sounds Like Them",
        "text": "The first time on a turn that a creature which knew the chorus before its death sees or hears it, that creature makes a DC 14 Wisdom saving throw. On a failed save, it has Disadvantage on attack rolls against the chorus until the end of that turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The chorus makes two Grasp attacks. It can replace one attack with a use of Drowning Song."
      },
      {
        "id": "grasp",
        "name": "Grasp",
        "kind": "melee",
        "toHit": 7,
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
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Bludgeoning damage plus 7 (2d6) Poison damage."
      },
      {
        "id": "drowning-song",
        "name": "Drowning Song",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Constitution Saving Throw: DC 15, each creature in a 20-foot-radius Sphere centered on a point the chorus can see within 60 feet. Failure: 21 (6d6) Poison damage, the target gains 2 Spore Load, and it can’t speak or cast spells with a Verbal component until the end of its next turn. Success: Half damage only, and the target gains 1 Spore Load. Failure or Success: The area remains contaminated until the end of the chorus’s next turn. A creature that enters the area or ends its turn there repeats the saving throw."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:miasm",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Miasm",
    "size": "Huge",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "Bad air with something in the middle of it: a loose column of hanging gill-curtain twenty feet tall, wet through, trailing filament that never quite reaches the floor. It has no front. Where it has stood for any length of time, the walls sweat and nothing else lives.",
    "ac": 17,
    "maxHp": 218,
    "hpFormula": "19d12+95",
    "speed": {
      "walk": 20,
      "fly": 30,
      "hover": true
    },
    "initiative": 10,
    "abilities": {
      "str": 18,
      "dex": 14,
      "con": 20,
      "int": 12,
      "wis": 18,
      "cha": 14
    },
    "saves": {
      "con": 9,
      "wis": 8
    },
    "skills": {
      "perception": 8,
      "stealth": 6
    },
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
      "Poisoned",
      "Prone",
      "Restrained"
    ],
    "senses": {
      "blindsight": 120,
      "passivePerception": 18
    },
    "languages": [
      "Common",
      "Undercommon",
      "telepathy 1 mile"
    ],
    "cr": 11,
    "xp": 7200,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the miasm fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Mycelial Chorus",
        "text": "The miasm is the center of its colony. It knows the direction and condition of every member of that colony within 5 miles and can speak through any of them."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 30 feet of the miasm makes a DC 18 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the miasm can’t regain Hit Points, the Difficulty Class of its Sporing and Bloomfall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Amorphous",
        "text": "The miasm can move through a space as narrow as 1 inch without spending extra movement."
      },
      {
        "name": "Choking Presence",
        "text": "A creature that starts its turn within 30 feet of the miasm and has 3 or more Spore Load has Disadvantage on attack rolls until the start of its next turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The miasm makes three Suffocating Coil attacks."
      },
      {
        "id": "suffocating-coil",
        "name": "Suffocating Coil",
        "kind": "melee",
        "toHit": 8,
        "reach": 10,
        "damage": [
          {
            "formula": "2d10+4",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +8, reach 10 ft. Hit: 15 (2d10 + 4) Bludgeoning damage plus 10 (3d6) Poison damage. If the target is Large or smaller, it has the Grappled condition (escape DC 16), and it can’t breathe while Grappled this way."
      },
      {
        "id": "bloomfall",
        "name": "Bloomfall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "7d8",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 18,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 18, each creature in a 30-foot-radius Sphere centered on a point the miasm can see within 60 feet. Failure: 31 (7d8) Poison damage, and the target gains 3 Spore Load. Success: Half damage only, and the target gains 1 Spore Load. Failure or Success: The area remains contaminated for 1 minute. A creature that enters the area or ends its turn there repeats the saving throw."
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
          "text": "The miasm moves up to half its Fly Speed without provoking Opportunity Attacks. The miasm can’t take this action again until the start of its next turn."
        },
        {
          "id": "exhale",
          "name": "Exhale",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "2d6",
              "type": "poison"
            }
          ],
          "save": {
            "ability": "con",
            "dc": 18,
            "onSave": "half"
          },
          "text": "Constitution Saving Throw: DC 18, one creature within 30 feet. Failure: 7 (2d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. The miasm can’t take this action again until the start of its next turn."
        },
        {
          "id": "constrict",
          "name": "Constrict",
          "kind": "utility",
          "toHit": null,
          "damage": [
            {
              "formula": "3d6",
              "type": "bludgeoning"
            }
          ],
          "text": "One creature Grappled by the miasm takes 10 (3d6) Bludgeoning damage. The miasm can’t take this action again until the start of its next turn."
        }
      ]
    }
  },
  {
    "id": "openfray-brood-and-bloom:ashcap-crust",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Ashcap Crust",
    "size": "Medium",
    "type": "plant",
    "alignment": "unaligned",
    "description": "A gray-white rind across the underside of burned ground, thin as a fingernail and as hard. It grows in the cavities a fire leaves and is seen only after somebody has put a foot through the layer above it.",
    "ac": 12,
    "maxHp": 60,
    "hpFormula": "11d8+11",
    "speed": {
      "walk": 0
    },
    "initiative": -2,
    "abilities": {
      "str": 12,
      "dex": 6,
      "con": 12,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "resistances": [
      "Fire"
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
      "blindsight": 30,
      "passivePerception": 10
    },
    "cr": 0.5,
    "xp": 100,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The crust is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing (Disturbed)",
        "text": "The crust becomes disturbed when a creature enters a space within 5 feet of it or when it takes damage, and it stays disturbed until the end of its next turn. While the crust is disturbed, a creature that ends its turn within 15 feet of it makes a DC 11 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the crust can’t regain Hit Points, the Difficulty Class of its Sporing and Ashfall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "False Appearance",
        "text": "While the crust remains motionless, it is indistinguishable from burned ground."
      }
    ],
    "actions": [
      {
        "id": "ashfall",
        "name": "Ashfall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 11,
          "onSave": "half"
        },
        "text": "Constitution Saving Throw: DC 11, each creature in a 15-foot Emanation originating from the crust. Failure: 10 (3d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. Failure or Success: The area is Lightly Obscured and remains contaminated until the end of the crust’s next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:ashcap-censer",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Ashcap Censer",
    "size": "Large",
    "type": "plant",
    "alignment": "unaligned",
    "description": "The ashcap fruiting body, hung rather than standing: a gray pod the size of a barrel, grown from a wall or beam on a stalk long enough to swing. It swings — slowly, without wind, to a rhythm that has nothing to do with anything nearby. What comes out when it opens is warm.",
    "ac": 14,
    "maxHp": 123,
    "hpFormula": "13d10+52",
    "speed": {
      "walk": 10,
      "climb": 20
    },
    "initiative": -1,
    "abilities": {
      "str": 16,
      "dex": 8,
      "con": 18,
      "int": 4,
      "wis": 12,
      "cha": 6
    },
    "resistances": [
      "Fire"
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
      "passivePerception": 11
    },
    "cr": 4,
    "xp": 1100,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The censer is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing (Disturbed)",
        "text": "The censer becomes disturbed when a creature enters a space within 5 feet of it or when it takes damage, and it stays disturbed until the end of its next turn. While the censer is disturbed, a creature that ends its turn within 15 feet of it makes a DC 13 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the censer can’t regain Hit Points, the Difficulty Class of its Sporing and Censing decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Settling Ash",
        "text": "When the censer drops to 0 Hit Points, what it was holding comes down. Each creature within 20 feet of it makes its Sporing saving throw."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The censer makes two Chain attacks."
      },
      {
        "id": "chain",
        "name": "Chain",
        "kind": "melee",
        "toHit": 5,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+3",
            "type": "bludgeoning"
          },
          {
            "formula": "2d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +5, reach 10 ft. Hit: 11 (2d6 + 3) Bludgeoning damage plus 5 (2d4) Poison damage."
      },
      {
        "id": "censing",
        "name": "Censing",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "4d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 14,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 14, each creature in a 20-foot Emanation originating from the censer. Failure: 14 (4d6) Poison damage, the target gains 1 Spore Load, and it has the Blinded condition until the end of its next turn. Success: Half damage only. Failure or Success: The area remains contaminated until the end of the censer’s next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:cinderwalk",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Cinderwalk",
    "size": "Medium",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "What Calcination leaves standing. The body is intact and weighs almost nothing, gray through to the bone, with no water left anywhere in it — no voice, no tears, nothing to bleed. It moves like somebody with an errand and makes no sound at all.",
    "ac": 15,
    "maxHp": 152,
    "hpFormula": "16d8+80",
    "speed": {
      "walk": 30
    },
    "initiative": 2,
    "abilities": {
      "str": 18,
      "dex": 14,
      "con": 20,
      "int": 8,
      "wis": 12,
      "cha": 8
    },
    "saves": {
      "con": 8,
      "wis": 4
    },
    "skills": {
      "stealth": 8
    },
    "resistances": [
      "Fire"
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
      "Poisoned"
    ],
    "senses": {
      "blindsight": 60,
      "passivePerception": 11
    },
    "languages": [
      "understands the languages it knew but can’t speak"
    ],
    "cr": 7,
    "xp": 2900,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The cinderwalk is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the cinderwalk has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing (Disturbed)",
        "text": "The cinderwalk becomes disturbed when a creature enters a space within 5 feet of it or when it takes damage, and it stays disturbed until the end of its next turn. While the cinderwalk is disturbed, a creature that ends its turn within 15 feet of it makes a DC 16 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the cinderwalk can’t regain Hit Points, the Difficulty Class of its Sporing and Bloom of Ash decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Voiceless",
        "text": "The cinderwalk makes no sound and weighs almost nothing. It has Advantage on Dexterity (Stealth) checks, and other creatures have Disadvantage on Wisdom (Perception) checks made to hear it."
      },
      {
        "name": "Dry Rot",
        "text": "A creature that takes damage from the cinderwalk can’t regain Hit Points until the end of its next turn."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The cinderwalk makes three Grasp attacks. It can replace one attack with a use of Bloom of Ash."
      },
      {
        "id": "grasp",
        "name": "Grasp",
        "kind": "melee",
        "toHit": 7,
        "reach": 5,
        "damage": [
          {
            "formula": "2d6+4",
            "type": "bludgeoning"
          },
          {
            "formula": "2d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 5 ft. Hit: 11 (2d6 + 4) Bludgeoning damage plus 7 (2d6) Poison damage."
      },
      {
        "id": "bloom-of-ash",
        "name": "Bloom of Ash",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 15,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 1
        },
        "text": "Constitution Saving Throw: DC 15, each creature in a 20-foot Emanation originating from the cinderwalk. Failure: 21 (6d6) Poison damage, the target gains 1 Spore Load, and it has the Blinded condition until the end of its next turn. Success: Half damage only. Failure or Success: The area remains contaminated until the end of the cinderwalk’s next turn."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:burnt-acre",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Burnt Acre",
    "size": "Gargantuan",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "Up to an acre of burn scar that is a single body: the ash, the fallen timbers, the standing chimneys, the ground for a foot down. Most have been in place long enough to be marked on maps as terrain. Fire does not threaten a burnt acre. Fire is how it reproduces.",
    "ac": 18,
    "maxHp": 247,
    "hpFormula": "15d20+90",
    "speed": {
      "walk": 10
    },
    "initiative": 8,
    "abilities": {
      "str": 22,
      "dex": 6,
      "con": 22,
      "int": 10,
      "wis": 16,
      "cha": 12
    },
    "saves": {
      "con": 11,
      "wis": 8
    },
    "skills": {
      "perception": 8,
      "stealth": 8
    },
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
      "Poisoned",
      "Prone",
      "Restrained"
    ],
    "senses": {
      "blindsight": 120,
      "tremorsense": 120,
      "passivePerception": 18
    },
    "languages": [
      "Common",
      "Undercommon",
      "telepathy 1 mile"
    ],
    "cr": 13,
    "xp": 10000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the burnt acre fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Mycelial Chorus",
        "text": "The burnt acre is the center of its colony. It knows the direction and condition of every member of that colony within 5 miles and can speak through any of them."
      },
      {
        "name": "Sporing (Disturbed)",
        "text": "The burnt acre becomes disturbed when a creature enters a space within 5 feet of it or when it takes damage, and it stays disturbed until the end of its next turn. While the burnt acre is disturbed, a creature that ends its turn within 30 feet of it makes a DC 19 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the burnt acre can’t regain Hit Points, the Difficulty Class of its Sporing and Pall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Fire-Sown",
        "text": "Whenever the burnt acre is subjected to Fire damage, it takes no damage and instead regains a number of Hit Points equal to half the Fire damage dealt."
      },
      {
        "name": "Ground Itself",
        "text": "The burnt acre’s space is Difficult Terrain for creatures that aren’t Sporophores, and other creatures can move through it."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The burnt acre makes three Sifting Limb attacks. It can replace one attack with a use of Pall."
      },
      {
        "id": "sifting-limb",
        "name": "Sifting Limb",
        "kind": "melee",
        "toHit": 11,
        "reach": 15,
        "damage": [
          {
            "formula": "3d8+6",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +11, reach 15 ft. Hit: 19 (3d8 + 6) Bludgeoning damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "pall",
        "name": "Pall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "8d8",
            "type": "poison"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 19,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "Constitution Saving Throw: DC 19, each creature in a 40-foot Emanation originating from the burnt acre. Failure: 36 (8d8) Poison damage, and the target gains 3 Spore Load. Success: Half damage only, and the target gains 1 Spore Load. Failure or Success: The area remains contaminated for 1 minute."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "spread",
          "name": "Spread",
          "kind": "utility",
          "toHit": null,
          "text": "The burnt acre moves up to its Speed. Every space it leaves remains contaminated until the end of its next turn, and a creature that enters one or ends its turn in one makes the burnt acre’s Sporing saving throw. The burnt acre can’t take this action again until the start of its next turn."
        },
        {
          "id": "sift",
          "name": "Sift",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "3d6",
              "type": "poison"
            }
          ],
          "save": {
            "ability": "con",
            "dc": 19,
            "onSave": "half"
          },
          "text": "Constitution Saving Throw: DC 19, one creature within 30 feet. Failure: 10 (3d6) Poison damage, and the target gains 1 Spore Load. Success: Half damage only. The burnt acre can’t take this action again until the start of its next turn."
        },
        {
          "id": "settle",
          "name": "Settle",
          "kind": "save",
          "toHit": null,
          "save": {
            "ability": "str",
            "dc": 19,
            "onSave": "negates"
          },
          "text": "Strength Saving Throw: DC 19, one creature within 20 feet. Failure: The target has the Restrained condition until the end of its next turn as the ground takes hold of it. The burnt acre can’t take this action again until the start of its next turn."
        }
      ]
    }
  },
  {
    "id": "openfray-brood-and-bloom:reredos-rind",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Reredos Rind",
    "size": "Medium",
    "type": "plant",
    "alignment": "unaligned",
    "description": "A gray-brown skin across worked stone, following the mortar lines like frost on a window. It grows in cellars and undercrofts and the shaded faces of standing walls, and it passes for water damage until somebody puts a hand on it.",
    "ac": 15,
    "maxHp": 71,
    "hpFormula": "11d8+22",
    "speed": {
      "walk": 0
    },
    "initiative": -2,
    "abilities": {
      "str": 14,
      "dex": 6,
      "con": 14,
      "int": 2,
      "wis": 10,
      "cha": 3
    },
    "resistances": [
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
      "Frightened",
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 30,
      "passivePerception": 10
    },
    "cr": 2,
    "xp": 450,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The rind is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the rind makes a DC 12 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the rind can’t regain Hit Points, the Difficulty Class of its Sporing and Spall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "False Appearance",
        "text": "While the rind remains motionless, it is indistinguishable from a stain on the stone."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The rind makes two Grip attacks."
      },
      {
        "id": "grip",
        "name": "Grip",
        "kind": "melee",
        "toHit": 4,
        "reach": 10,
        "damage": [
          {
            "formula": "2d6+2",
            "type": "bludgeoning"
          },
          {
            "formula": "1d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +4, reach 10 ft. Hit: 9 (2d6 + 2) Bludgeoning damage plus 3 (1d6) Poison damage."
      }
    ],
    "reactions": [
      {
        "id": "spall",
        "name": "Spall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d4",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 12,
          "onSave": "half"
        },
        "text": "Trigger: The rind takes damage from a creature within 10 feet of it. Response: Constitution Saving Throw: DC 12, the triggering creature. Failure: 5 (2d4) Piercing damage, and the target gains 1 Spore Load. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:reredos-corbel",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Reredos Corbel",
    "size": "Large",
    "type": "plant",
    "alignment": "unaligned",
    "description": "The reredos fruiting body, shaped like the bracket it is named for: hard gray shelving thrust from a wall at head height, wide enough to stand on and strong enough to hold a roof. Old ones are load-bearing in fact as well as appearance, and masons have built around them without asking what they were.",
    "ac": 16,
    "maxHp": 105,
    "hpFormula": "14d10+28",
    "speed": {
      "walk": 10,
      "climb": 20
    },
    "initiative": -1,
    "abilities": {
      "str": 18,
      "dex": 8,
      "con": 16,
      "int": 4,
      "wis": 12,
      "cha": 6
    },
    "resistances": [
      "Piercing",
      "Slashing"
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
      "passivePerception": 11
    },
    "cr": 5,
    "xp": 1800,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The corbel is part of a colony. It knows the direction of every other member of its colony within 1 mile, and the colony can direct it wordlessly."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the corbel makes a DC 14 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the corbel can’t regain Hit Points, the Difficulty Class of its Sporing and Spall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Load-Bearing",
        "text": "When the corbel drops to 0 Hit Points, whatever it was holding up comes down. Each creature within 10 feet of it makes a DC 14 Dexterity saving throw, taking 18 (4d8) Bludgeoning damage on a failed save or half as much on a successful one, and the area within 10 feet becomes Difficult Terrain."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The corbel makes two Bracket attacks."
      },
      {
        "id": "bracket",
        "name": "Bracket",
        "kind": "melee",
        "toHit": 7,
        "reach": 10,
        "damage": [
          {
            "formula": "2d8+4",
            "type": "bludgeoning"
          },
          {
            "formula": "2d4",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +7, reach 10 ft. Hit: 13 (2d8 + 4) Bludgeoning damage plus 5 (2d4) Poison damage."
      }
    ],
    "reactions": [
      {
        "id": "spall",
        "name": "Spall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "2d8",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 14,
          "onSave": "half"
        },
        "text": "Trigger: The corbel takes damage from a creature within 10 feet of it. Response: Constitution Saving Throw: DC 14, the triggering creature. Failure: 9 (2d8) Piercing damage, and the target gains 1 Spore Load. Success: Half damage only."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:buttress",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Buttress",
    "size": "Large",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "What Ankylosis leaves standing: a person set solid, arms fused down and out into two thick braces, head sunk between them, the whole figure leaning as if holding something up. It walks, slowly, and the marks it leaves in a flagstone floor are a settling pier's.",
    "ac": 18,
    "maxHp": 138,
    "hpFormula": "12d10+72",
    "speed": {
      "walk": 20
    },
    "initiative": -2,
    "abilities": {
      "str": 22,
      "dex": 6,
      "con": 22,
      "int": 6,
      "wis": 12,
      "cha": 8
    },
    "saves": {
      "str": 10,
      "con": 10
    },
    "resistances": [
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
      "Poisoned",
      "Prone"
    ],
    "senses": {
      "blindsight": 60,
      "tremorsense": 60,
      "passivePerception": 11
    },
    "languages": [
      "understands the languages it knew but can’t speak"
    ],
    "cr": 9,
    "xp": 5000,
    "traits": [
      {
        "name": "Mycelial Chorus",
        "text": "The buttress is part of a colony. It knows the direction of, and can communicate wordlessly with, every other member of its colony within 1 mile. While at least one other member of its colony is within 60 feet, the buttress has Advantage on saving throws against being Charmed or Frightened."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 5 feet of the buttress makes a DC 17 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the buttress can’t regain Hit Points, the Difficulty Class of its Sporing and Spall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "Immovable",
        "text": "The buttress can’t be moved against its will."
      },
      {
        "name": "Shoring",
        "text": "Allied Sporophore creatures within 5 feet of the buttress have Half Cover."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The buttress makes two Pillar Arm attacks."
      },
      {
        "id": "pillar-arm",
        "name": "Pillar Arm",
        "kind": "melee",
        "toHit": 10,
        "reach": 10,
        "damage": [
          {
            "formula": "3d10+6",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +10, reach 10 ft. Hit: 22 (3d10 + 6) Bludgeoning damage plus 10 (3d6) Poison damage."
      }
    ],
    "reactions": [
      {
        "id": "spall",
        "name": "Spall",
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
          "dc": 16,
          "onSave": "half"
        },
        "text": "Trigger: The buttress takes damage from a creature within 10 feet of it. Response: Constitution Saving Throw: DC 16, the triggering creature. Failure: 14 (4d6) Piercing damage, and the target gains 2 Spore Load. Success: Half damage only, and the target gains 1 Spore Load."
      }
    ]
  },
  {
    "id": "openfray-brood-and-bloom:nave",
    "source": "openfray-brood-and-bloom",
    "edition": "5.5",
    "name": "Nave",
    "size": "Gargantuan",
    "type": "plant",
    "alignment": "neutral evil",
    "description": "A whole building — a chapter house, a granary, a drowned chapel — grown through until fabric and fungus cannot be told apart. The doors work. The stairs hold. The windows still let light in, which is the one thing about it that is not deliberate.",
    "ac": 19,
    "maxHp": 198,
    "hpFormula": "12d20+72",
    "speed": {
      "walk": 0
    },
    "initiative": 7,
    "abilities": {
      "str": 24,
      "dex": 4,
      "con": 22,
      "int": 14,
      "wis": 18,
      "cha": 16
    },
    "saves": {
      "con": 11,
      "wis": 9
    },
    "skills": {
      "perception": 10
    },
    "resistances": [
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
      "tremorsense": 120,
      "passivePerception": 20
    },
    "languages": [
      "Common",
      "Undercommon",
      "telepathy 1 mile"
    ],
    "cr": 15,
    "xp": 13000,
    "legendaryResistance": 3,
    "traits": [
      {
        "name": "Legendary Resistance (3/Day)",
        "text": "If the nave fails a saving throw, it can choose to succeed instead."
      },
      {
        "name": "Mycelial Chorus",
        "text": "The nave is the center of its colony. It knows the direction and condition of every member of that colony within 5 miles and can speak through any of them."
      },
      {
        "name": "Sporing",
        "text": "A creature that ends its turn within 30 feet of the nave makes a DC 19 Constitution saving throw. Failure: The creature gains 1 Spore Load. Success: No effect, and the creature is immune to Sporing until the start of its next turn."
      },
      {
        "name": "Sun-Withered",
        "text": "While in sunlight, the nave can’t regain Hit Points, the Difficulty Class of its Sporing and Spall decreases by 5, and it takes 3 (1d6) Radiant damage at the end of each of its turns."
      },
      {
        "name": "The Building Itself",
        "text": "The nave’s space is the interior of the structure. Creatures inside it are within reach of its attacks regardless of where they stand, are in contact with the nave for the purposes of Sporing and Spall, and doors, shutters, and stairs within it are part of the nave rather than objects it controls."
      },
      {
        "name": "Immovable",
        "text": "The nave can’t be moved against its will."
      }
    ],
    "actions": [
      {
        "id": "multiattack",
        "name": "Multiattack",
        "kind": "utility",
        "toHit": null,
        "text": "The nave makes three Masonry attacks. It can replace one attack with a use of Settle."
      },
      {
        "id": "masonry",
        "name": "Masonry",
        "kind": "melee",
        "toHit": 12,
        "reach": 15,
        "damage": [
          {
            "formula": "4d8+8",
            "type": "bludgeoning"
          },
          {
            "formula": "3d6",
            "type": "poison"
          }
        ],
        "text": "Melee Attack Roll: +12, reach 15 ft. Hit: 26 (4d8 + 8) Bludgeoning damage plus 10 (3d6) Poison damage."
      },
      {
        "id": "settle",
        "name": "Settle",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "8d8",
            "type": "bludgeoning"
          }
        ],
        "save": {
          "ability": "dex",
          "dc": 19,
          "onSave": "half"
        },
        "recharge": {
          "type": "perDay",
          "value": 2
        },
        "text": "The whole structure drops half an inch at once. Dexterity Saving Throw: DC 19, each creature in a 40-foot Emanation originating from the nave. Failure: 36 (8d8) Bludgeoning damage, and the target has the Prone condition. Success: Half damage only. Failure or Success: The area becomes Difficult Terrain from fallen masonry until the end of the nave’s next turn."
      }
    ],
    "reactions": [
      {
        "id": "spall",
        "name": "Spall",
        "kind": "save",
        "toHit": null,
        "damage": [
          {
            "formula": "6d6",
            "type": "piercing"
          }
        ],
        "save": {
          "ability": "con",
          "dc": 19,
          "onSave": "half"
        },
        "text": "Trigger: The nave takes damage from a creature within 30 feet of it. Response: Constitution Saving Throw: DC 19, the triggering creature. Failure: 21 (6d6) Piercing damage, and the target gains 2 Spore Load. Success: Half damage only, and the target gains 1 Spore Load."
      }
    ],
    "legendaryActions": {
      "perRound": 3,
      "actions": [
        {
          "id": "close",
          "name": "Close",
          "kind": "utility",
          "toHit": null,
          "text": "A door, shutter, or hatch within the nave shuts and sets. It cannot be opened without a successful DC 20 Strength (Athletics) check or 30 damage. The nave can’t take this action again until the start of its next turn."
        },
        {
          "id": "shift",
          "name": "Shift",
          "kind": "utility",
          "toHit": null,
          "text": "A 20-foot square of floor, wall, or stair within the nave rises, drops, or cants. The area becomes Difficult Terrain, and each creature in it makes a DC 19 Dexterity saving throw, falling Prone on a failure. The nave can’t take this action again until the start of its next turn."
        },
        {
          "id": "shed",
          "name": "Shed",
          "kind": "save",
          "toHit": null,
          "damage": [
            {
              "formula": "3d6",
              "type": "piercing"
            }
          ],
          "save": {
            "ability": "con",
            "dc": 19,
            "onSave": "half"
          },
          "text": "Constitution Saving Throw: DC 19, one creature within 30 feet. Failure: 10 (3d6) Piercing damage, and the target gains 1 Spore Load. Success: Half damage only. The nave can’t take this action again until the start of its next turn. Settle is the only area effect in the line and it is not a spore effect. It contaminates nobody. The Sporing radius is the other thing worth reading carefully. Every other reredos sheds at 5 feet, and the nave sheds at 30, which looks like the line breaking its own rule. It is not. The Building Itself makes the interior of the structure the nave’s body, so a creature standing anywhere inside it is touching the nave — the radius is larger because the creature is bigger, not because the rule changed. The same reasoning is why Shed reaches 30 feet: it is contact contamination, delivered by a wall the target is already inside."
        }
      ]
    }
  },
]
