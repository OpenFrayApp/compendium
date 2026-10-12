// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone
// Creature adaptations are CC-BY-SA-4.0; see docs/basic-fantasy-adaptations.md.

import type { Action } from "../schema/action.ts";
import type { Creature } from "../schema/creature.ts";
import type {
  Ability,
  DamageType,
  Size,
  Speeds,
} from "../schema/primitives.ts";
import { averageDamage } from "./crestimate.ts";
import {
  abilityMod,
  hpFromFormula,
  proficiencyBonus,
  XP_BY_CR,
} from "./validate.ts";

export const BASIC_FANTASY_SOURCE = "basic-fantasy-adaptations";
export const BASIC_FANTASY_BOOK = "Uncatalogued Beasts (working title)";

const HIT_DIE: Record<Size, number> = {
  Tiny: 4,
  Small: 6,
  "Medium or Small": 8,
  Medium: 8,
  Large: 10,
  Huge: 12,
  Gargantuan: 20,
};
const WORDS = ["zero", "one", "two", "three", "four"];

type Scores = [number, number, number, number, number, number];
type Profile = [
  slug: string,
  name: string,
  size: Size,
  type: string,
  cr: number,
  ac: number,
  hitDice: number,
  scores: Scores,
  speed: Speeds,
  attack: string,
  formula: string,
  damage: DamageType,
  count?: number,
];

/** Format a roll formula for rules prose without changing its machine-readable value. */
function spoken(formula: string): string {
  return formula.replace(/([+-])/, " $1 ");
}

/** Format the floor-rounded damage average and formula used by the stat block. */
function damageText(formula: string, type: DamageType): string {
  return `${Math.floor(averageDamage(formula))} (${spoken(formula)}) ${type[0].toUpperCase()}${type.slice(1)} damage`;
}

/** Build an attack from the creature's actual proficiency and attack ability. */
function attack(
  c: Creature,
  name: string,
  formula: string,
  type: DamageType,
  rider = "",
  reach = 5,
  ability: Ability = c.abilities.str >= c.abilities.dex ? "str" : "dex",
): Action {
  const toHit = proficiencyBonus(c.cr!) + abilityMod(c.abilities[ability]);
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    kind: "melee",
    toHit,
    reach,
    damage: [{ formula, type }],
    text: `Melee Attack Roll: +${toHit}, reach ${reach} ft. Hit: ${damageText(formula, type)}.${rider ? ` ${rider}` : ""}`,
  };
}

/** Build a save action with matching damage, save metadata, and rules prose. */
function saving(
  c: Creature,
  name: string,
  ability: Ability,
  dcAbility: Ability,
  targets: string,
  failure: string,
  damage?: [string, DamageType],
  half = false,
  perDay?: number,
): Action {
  const dc = 8 + proficiencyBonus(c.cr!) + abilityMod(c.abilities[dcAbility]);
  const fullAbility: Record<Ability, string> = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma",
  };
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: perDay ? `${name} (${perDay}/Day)` : name,
    kind: "save",
    toHit: null,
    save: { ability, dc, onSave: half ? "half" : "negates" },
    ...(damage ? { damage: [{ formula: damage[0], type: damage[1] }] } : {}),
    ...(perDay ? { recharge: { type: "perDay" as const, value: perDay } } : {}),
    text: `${fullAbility[ability]} Saving Throw: DC ${dc}, ${targets}. Failure: ${damage ? `${damageText(...damage)}${failure ? ", and " : "."}` : ""}${failure}${half ? " Success: Half damage only." : ""}`,
  };
}

/** Build a non-rollable action without inventing automation for its rules. */
function utility(name: string, text: string): Action {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    kind: "utility",
    toHit: null,
    text,
  };
}

/** Add mechanics-only passive rules to a creature. */
function trait(c: Creature, name: string, text: string): void {
  c.traits ??= [];
  c.traits.push({ name, text });
}

/** Calculate a save DC from its explicitly selected ability. */
function dc(c: Creature, ability: Ability = "con"): number {
  return 8 + proficiencyBonus(c.cr!) + abilityMod(c.abilities[ability]);
}

/** Add a repeatable attack routine that names the attacks it actually uses. */
function multiattack(c: Creature, count: number, name: string): void {
  c.actions!.unshift(
    utility(
      "Multiattack",
      `The ${c.name.toLowerCase()} makes ${WORDS[count]} ${name} attacks.`,
    ),
  );
}

/** Build one individually authored profile with size-correct Hit Dice and derived header math. */
function fromProfile([
  slug,
  name,
  size,
  type,
  cr,
  ac,
  hitDice,
  scores,
  speed,
  attackName,
  formula,
  damage,
  count = 1,
]: Profile): Creature {
  const [str, dex, con, int, wis, cha] = scores;
  const bonus = hitDice * abilityMod(con);
  const hpFormula = `${hitDice}d${HIT_DIE[size]}${bonus ? `${bonus >= 0 ? "+" : ""}${bonus}` : ""}`;
  const c: Creature = {
    id: `${BASIC_FANTASY_SOURCE}:${slug}`,
    source: BASIC_FANTASY_SOURCE,
    edition: "5.5",
    name,
    size,
    type,
    alignment:
      type === "fey"
        ? "neutral"
        : type === "undead"
          ? "neutral evil"
          : "unaligned",
    ac,
    hpFormula,
    maxHp: hpFromFormula(hpFormula)!,
    initiative: abilityMod(dex),
    speed,
    abilities: { str, dex, con, int, wis, cha },
    senses: { passivePerception: 10 + abilityMod(wis) },
    cr,
    xp: XP_BY_CR[String(cr)],
    actions: [],
  };
  c.actions!.push(
    attack(
      c,
      attackName,
      formula,
      damage,
      "",
      size === "Huge" ? 10 : size === "Gargantuan" ? 15 : 5,
    ),
  );
  if (count > 1) multiattack(c, count, attackName);
  if (type === "construct") {
    c.immunities = ["Poison", "Psychic"];
    c.conditionImmunities = [
      "Charmed",
      "Exhaustion",
      "Frightened",
      "Paralyzed",
      "Petrified",
      "Poisoned",
    ];
    c.senses.darkvision = 60;
    c.languages = ["Understands Common but cannot speak"];
  }
  if (type === "undead") {
    c.immunities = ["Poison"];
    c.conditionImmunities = ["Exhaustion", "Poisoned"];
    c.senses.darkvision = 60;
  }
  return c;
}

const profiles: Profile[] = [
  [
    "alicorn",
    "Alicorn",
    "Large",
    "fey",
    3,
    19,
    5,
    [18, 14, 14, 11, 14, 16],
    { walk: 70 },
    "Horn",
    "2d6",
    "piercing",
  ],
  [
    "golem-amber",
    "Amber Golem",
    "Large",
    "construct",
    5,
    19,
    9,
    [20, 12, 18, 3, 12, 1],
    { walk: 60 },
    "Claw",
    "2d6",
    "slashing",
  ],
  [
    "aurochs",
    "Aurochs",
    "Large",
    "beast",
    0.5,
    16,
    3,
    [18, 10, 14, 2, 12, 5],
    { walk: 50 },
    "Headbutt",
    "1d4",
    "bludgeoning",
  ],
  [
    "barkling",
    "Barkling",
    "Small",
    "humanoid",
    0.125,
    15,
    2,
    [8, 14, 8, 10, 12, 9],
    { walk: 20 },
    "Dagger",
    "1d4",
    "piercing",
  ],
  [
    "bison",
    "Bison",
    "Large",
    "beast",
    0.5,
    16,
    4,
    [18, 10, 14, 2, 12, 5],
    { walk: 50 },
    "Headbutt",
    "1d4",
    "bludgeoning",
  ],
  [
    "blood-rose",
    "Blood Rose",
    "Medium",
    "plant",
    1,
    13,
    4,
    [14, 8, 14, 2, 10, 12],
    { walk: 5 },
    "Thorn Cane",
    "1d6",
    "piercing",
    2,
  ],
  [
    "box-turtle",
    "Box Turtle",
    "Tiny",
    "beast",
    0,
    15,
    1,
    [2, 6, 12, 2, 10, 3],
    { walk: 5, swim: 20 },
    "Bite",
    "1d2",
    "piercing",
  ],
  [
    "cattle",
    "Cattle",
    "Large",
    "beast",
    0.25,
    14,
    2,
    [16, 10, 12, 2, 10, 5],
    { walk: 50 },
    "Headbutt",
    "1d4",
    "bludgeoning",
  ],
  [
    "bear-cave",
    "Cave Bear",
    "Huge",
    "beast",
    3,
    15,
    5,
    [20, 12, 16, 2, 13, 7],
    { walk: 40 },
    "Claw",
    "1d8",
    "slashing",
  ],
  [
    "living-statue-crystal",
    "Crystal Living Statue",
    "Medium",
    "construct",
    1,
    16,
    3,
    [16, 10, 14, 1, 10, 1],
    { walk: 30 },
    "Fist",
    "1d6",
    "bludgeoning",
    2,
  ],
  [
    "giant-cyclops",
    "Cyclop",
    "Huge",
    "giant",
    4,
    15,
    9,
    [22, 10, 18, 8, 10, 8],
    { walk: 20 },
    "Greatclub",
    "3d10",
    "bludgeoning",
  ],
  [
    "dinosaur-deinonychus",
    "Deinonychus",
    "Medium",
    "beast",
    0.5,
    15,
    3,
    [14, 16, 14, 2, 12, 6],
    { walk: 50 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "emu",
    "Emu",
    "Medium",
    "beast",
    0.25,
    14,
    3,
    [12, 14, 12, 2, 12, 5],
    { walk: 50 },
    "Kick",
    "1d4",
    "bludgeoning",
  ],
  [
    "giant-barracuda",
    "Giant Barracuda",
    "Huge",
    "beast",
    2,
    15,
    7,
    [16, 14, 12, 1, 12, 3],
    { walk: 0, swim: 60 },
    "Bite",
    "2d8+1",
    "piercing",
  ],
  [
    "fish-giant-bass",
    "Giant Bass",
    "Large",
    "beast",
    1,
    13,
    3,
    [16, 12, 14, 1, 10, 3],
    { walk: 0, swim: 40 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "caecilia-giant",
    "Giant Caecilia",
    "Huge",
    "beast",
    2,
    14,
    5,
    [18, 8, 16, 1, 10, 3],
    { walk: 20, burrow: 20 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "fish-giant-catfish",
    "Giant Catfish",
    "Huge",
    "beast",
    3,
    16,
    6,
    [18, 8, 14, 1, 10, 3],
    { walk: 0, swim: 30 },
    "Bite",
    "2d8",
    "piercing",
  ],
  [
    "cave-locust-giant",
    "Giant Cave Locust",
    "Medium",
    "beast",
    0.5,
    16,
    3,
    [12, 14, 12, 1, 12, 3],
    { walk: 20, fly: 60 },
    "Bite",
    "1d2",
    "piercing",
  ],
  [
    "lizard-giant-draco",
    "Giant Draco Lizard",
    "Large",
    "beast",
    1,
    15,
    3,
    [16, 14, 12, 2, 10, 5],
    { walk: 40, fly: 70 },
    "Bite",
    "1d10",
    "piercing",
  ],
  [
    "fly-giant",
    "Giant Fly",
    "Medium",
    "beast",
    0.5,
    14,
    3,
    [12, 14, 12, 1, 10, 3],
    { walk: 30, fly: 60 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "giant-hawk",
    "Giant Hawk",
    "Medium",
    "beast",
    0.5,
    14,
    6,
    [12, 16, 10, 2, 14, 6],
    { walk: 10, fly: 150 },
    "Talons",
    "1d6",
    "slashing",
  ],
  [
    "lizard-giant-horned-chameleon",
    "Giant Horned Chameleon",
    "Large",
    "beast",
    2,
    18,
    5,
    [16, 14, 14, 2, 12, 5],
    { walk: 40 },
    "Bite",
    "2d6",
    "piercing",
  ],
  [
    "beetle-giant-oil",
    "Giant Oil Beetle",
    "Small",
    "beast",
    0.5,
    16,
    3,
    [12, 12, 12, 1, 10, 3],
    { walk: 40 },
    "Bite",
    "2d4",
    "piercing",
  ],
  [
    "fish-giant-piranha",
    "Giant Piranha",
    "Medium",
    "beast",
    0.5,
    15,
    4,
    [12, 14, 12, 1, 10, 3],
    { walk: 0, swim: 50 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "rhagodessa-giant",
    "Giant Rhagodessa",
    "Large",
    "beast",
    2,
    16,
    5,
    [16, 14, 14, 1, 12, 3],
    { walk: 50, climb: 50 },
    "Bite",
    "2d8",
    "piercing",
  ],
  [
    "shrew-common-giant",
    "Giant Shrew",
    "Medium",
    "beast",
    0.5,
    16,
    2,
    [10, 16, 12, 2, 12, 5],
    { walk: 60 },
    "Bite",
    "1d6",
    "piercing",
    2,
  ],
  [
    "squid-giant-male",
    "Giant Squid",
    "Huge",
    "beast",
    4,
    16,
    7,
    [18, 14, 16, 2, 12, 4],
    { walk: 0, swim: 40 },
    "Tentacle",
    "1d4",
    "slashing",
  ],
  [
    "spider-giant-tarantula",
    "Giant Tarantula",
    "Large",
    "beast",
    2,
    15,
    5,
    [16, 14, 14, 1, 12, 3],
    { walk: 50, climb: 50 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "beetle-giant-tiger",
    "Giant Tiger Beetle",
    "Large",
    "beast",
    1,
    17,
    4,
    [16, 14, 14, 1, 10, 3],
    { walk: 60 },
    "Bite",
    "2d6",
    "piercing",
  ],
  [
    "shrew-venomous-giant",
    "Giant Venomous Shrew",
    "Medium",
    "beast",
    1,
    16,
    2,
    [10, 16, 12, 2, 12, 5],
    { walk: 60 },
    "Bite",
    "1d6",
    "piercing",
    2,
  ],
  [
    "water-termite-giant",
    "Giant Water Termite",
    "Medium",
    "beast",
    0.5,
    13,
    3,
    [12, 12, 14, 1, 10, 3],
    { walk: 0, swim: 30 },
    "Bite",
    "2d4",
    "piercing",
  ],
  [
    "large-roc",
    "Great Roc",
    "Huge",
    "beast",
    5,
    18,
    9,
    [22, 12, 18, 3, 14, 8],
    { walk: 20, fly: 160 },
    "Talons",
    "1d8",
    "slashing",
  ],
  [
    "squid-giant-female",
    "Great Squid",
    "Gargantuan",
    "beast",
    5,
    17,
    6,
    [22, 12, 18, 2, 12, 4],
    { walk: 0, swim: 40 },
    "Tentacle",
    "1d4",
    "slashing",
  ],
  [
    "basilisk-greater",
    "Greater Basilisk",
    "Large",
    "monstrosity",
    4,
    17,
    8,
    [18, 10, 16, 2, 10, 7],
    { walk: 20 },
    "Bite",
    "1d12",
    "piercing",
  ],
  [
    "jelly-green",
    "Green Jelly",
    "Small",
    "ooze",
    1,
    12,
    3,
    [12, 6, 14, 1, 6, 1],
    { walk: 5, climb: 5 },
    "Cling",
    "1d4",
    "acid",
  ],
  [
    "hangman-tree",
    "Hangman Tree",
    "Huge",
    "plant",
    3,
    16,
    5,
    [20, 6, 16, 3, 12, 6],
    { walk: 0 },
    "Noose",
    "1d6",
    "bludgeoning",
    4,
  ],
  [
    "ant-huge",
    "Huge Ant",
    "Medium",
    "beast",
    0.5,
    15,
    3,
    [14, 12, 12, 1, 10, 2],
    { walk: 50 },
    "Bite",
    "1d10",
    "piercing",
  ],
  [
    "huge-barracuda",
    "Huge Barracuda",
    "Large",
    "beast",
    1,
    16,
    6,
    [12, 14, 12, 1, 10, 3],
    { walk: 0, swim: 60 },
    "Bite",
    "2d6",
    "piercing",
  ],
  [
    "huge-monitor-lizard",
    "Huge Monitor Lizard",
    "Large",
    "beast",
    1,
    14,
    6,
    [14, 12, 12, 2, 10, 4],
    { walk: 40 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "living-statue-iron",
    "Iron Living Statue",
    "Medium",
    "construct",
    2,
    18,
    5,
    [18, 8, 16, 1, 10, 1],
    { walk: 10 },
    "Fist",
    "1d8",
    "bludgeoning",
    2,
  ],
  [
    "ant-large",
    "Large Ant",
    "Small",
    "beast",
    0.125,
    13,
    2,
    [10, 14, 12, 1, 10, 2],
    { walk: 40 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "large-monitor-lizard",
    "Large Monitor Lizard",
    "Medium",
    "beast",
    0.5,
    12,
    4,
    [10, 14, 12, 2, 10, 4],
    { walk: 40 },
    "Bite",
    "1d4",
    "piercing",
  ],
  [
    "normal-roc",
    "Lesser Roc",
    "Large",
    "beast",
    3,
    18,
    6,
    [18, 14, 14, 3, 14, 8],
    { walk: 20, fly: 160 },
    "Talons",
    "1d6",
    "slashing",
  ],
  [
    "whale-narwhal",
    "Narwhal",
    "Large",
    "beast",
    2,
    17,
    10,
    [18, 10, 14, 2, 12, 5],
    { walk: 0, swim: 60 },
    "Tusk",
    "2d6",
    "piercing",
  ],
  [
    "nixie",
    "Nixie",
    "Small",
    "fey",
    0.25,
    16,
    2,
    [6, 16, 12, 12, 14, 16],
    { walk: 40, swim: 40 },
    "Dagger",
    "1d4",
    "piercing",
  ],
  [
    "ostrich",
    "Ostrich",
    "Medium",
    "beast",
    0.5,
    14,
    4,
    [14, 14, 12, 2, 12, 5],
    { walk: 60 },
    "Kick",
    "1d6",
    "bludgeoning",
  ],
  [
    "parrot-or-cockatiel",
    "Parrot",
    "Tiny",
    "beast",
    0,
    11,
    1,
    [2, 14, 10, 3, 12, 8],
    { walk: 10, fly: 100 },
    "Beak",
    "1d4",
    "piercing",
  ],
  [
    "pixie",
    "Pixie",
    "Tiny",
    "fey",
    0.5,
    17,
    3,
    [2, 20, 10, 12, 14, 14],
    { walk: 30, fly: 60 },
    "Dagger",
    "1d4",
    "piercing",
  ],
  [
    "pterodactyl",
    "Pterodactyl",
    "Tiny",
    "beast",
    0.125,
    12,
    2,
    [8, 16, 10, 2, 12, 4],
    { walk: 5, fly: 60 },
    "Bite",
    "1d4",
    "piercing",
  ],
  [
    "rot-grub",
    "Rot Grub",
    "Tiny",
    "beast",
    0.125,
    10,
    2,
    [2, 10, 6, 1, 6, 1],
    { walk: 5 },
    "Burrow",
    "1",
    "piercing",
  ],
  [
    "sea-serpent",
    "Sea Serpent",
    "Huge",
    "beast",
    2,
    17,
    4,
    [20, 12, 18, 2, 12, 5],
    { walk: 0, swim: 50 },
    "Bite",
    "2d6",
    "piercing",
  ],
  [
    "skeletaire",
    "Skeletaire",
    "Medium",
    "undead",
    1,
    13,
    2,
    [10, 14, 14, 14, 10, 8],
    { walk: 40 },
    "Dagger",
    "1d4",
    "piercing",
  ],
  [
    "snapping-turtle",
    "Snapping Turtle",
    "Small",
    "beast",
    0.25,
    16,
    2,
    [12, 8, 12, 2, 10, 3],
    { walk: 5, swim: 20 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "whale-sperm",
    "Sperm Whale",
    "Gargantuan",
    "beast",
    7,
    18,
    12,
    [24, 8, 18, 3, 12, 7],
    { walk: 0, swim: 60 },
    "Bite",
    "3d20",
    "piercing",
  ],
  [
    "snake-spitting-cobra",
    "Spitting Cobra",
    "Small",
    "beast",
    0.5,
    13,
    2,
    [4, 16, 12, 1, 10, 3],
    { walk: 30 },
    "Bite",
    "1d4",
    "piercing",
  ],
  [
    "dinosaur-stegosaurus",
    "Stegosaurus",
    "Huge",
    "beast",
    3,
    17,
    7,
    [20, 10, 18, 2, 12, 5],
    { walk: 20 },
    "Tail",
    "2d8",
    "piercing",
  ],
  [
    "living-statue-stone",
    "Stone Living Statue",
    "Medium",
    "construct",
    2,
    16,
    5,
    [18, 8, 16, 1, 10, 1],
    { walk: 20 },
    "Lava Spray",
    "2d6",
    "fire",
    2,
  ],
  [
    "subterranean-lizard-man",
    "Subterranean Lizardfolk",
    "Medium",
    "humanoid",
    1,
    15,
    2,
    [18, 10, 14, 7, 12, 7],
    { walk: 30, swim: 40 },
    "Claw",
    "1d4",
    "slashing",
  ],
  [
    "titanothere",
    "Titanothere",
    "Huge",
    "beast",
    3,
    15,
    7,
    [22, 8, 18, 2, 12, 5],
    { walk: 40 },
    "Headbutt",
    "2d6",
    "bludgeoning",
  ],
  [
    "trollkin-adolescent",
    "Trollkin Adolescent",
    "Large",
    "giant",
    2,
    16,
    5,
    [18, 12, 16, 7, 10, 7],
    { walk: 40 },
    "Claw",
    "1d6",
    "slashing",
  ],
  [
    "trollkin-infant",
    "Trollkin Infant",
    "Small",
    "giant",
    1,
    14,
    3,
    [12, 14, 14, 5, 10, 5],
    { walk: 30 },
    "Claw",
    "1d4",
    "slashing",
  ],
  [
    "trollkin-juvenile",
    "Trollkin Juvenile",
    "Medium",
    "giant",
    1,
    15,
    4,
    [16, 14, 14, 6, 10, 6],
    { walk: 50 },
    "Claw",
    "1d4",
    "slashing",
  ],
  [
    "trollwife",
    "Trollwife",
    "Large",
    "giant",
    3,
    16,
    7,
    [20, 12, 18, 7, 12, 8],
    { walk: 40 },
    "Claw",
    "1d8",
    "slashing",
  ],
  [
    "urgoblin",
    "Urgoblin",
    "Medium",
    "humanoid",
    1,
    14,
    3,
    [18, 12, 16, 8, 10, 8],
    { walk: 30 },
    "Longsword",
    "1d8",
    "slashing",
  ],
  [
    "woolly-rhino",
    "Woolly Rhinoceros",
    "Huge",
    "beast",
    3,
    18,
    8,
    [22, 8, 16, 2, 12, 5],
    { walk: 40 },
    "Gore",
    "2d8",
    "piercing",
  ],
  [
    "yellow-mold",
    "Yellow Mold",
    "Small",
    "plant",
    0.5,
    10,
    2,
    [1, 1, 14, 1, 6, 1],
    { walk: 0 },
    "Spores",
    "1d8",
    "poison",
  ],
  [
    "zombraire",
    "Zombraire",
    "Medium",
    "undead",
    1,
    12,
    3,
    [12, 6, 16, 14, 10, 8],
    { walk: 20 },
    "Dagger",
    "1d4",
    "piercing",
  ],
  [
    "ant-giant",
    "Giant Ant",
    "Large",
    "beast",
    1,
    17,
    4,
    [16, 12, 12, 1, 10, 2],
    { walk: 60 },
    "Bite",
    "2d6",
    "piercing",
  ],
  [
    "assassin-vine",
    "Assassin Vine",
    "Large",
    "plant",
    2,
    15,
    6,
    [16, 6, 12, 1, 10, 1],
    { walk: 5 },
    "Entangle",
    "1d8",
    "bludgeoning",
  ],
  [
    "bee-giant",
    "Giant Bee",
    "Small",
    "beast",
    0.25,
    13,
    1,
    [6, 14, 10, 1, 10, 2],
    { walk: 10, fly: 50 },
    "Sting",
    "1d4",
    "piercing",
  ],
  [
    "bee-giant-queen",
    "Giant Bee Queen",
    "Medium",
    "beast",
    0.25,
    13,
    2,
    [12, 6, 10, 1, 10, 2],
    { walk: 0 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "beetle-giant-bombardier",
    "Giant Bombardier Beetle",
    "Medium",
    "beast",
    1,
    16,
    3,
    [12, 10, 12, 1, 10, 2],
    { walk: 40 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "giant-mountain",
    "Mountain Giant",
    "Huge",
    "giant",
    7,
    15,
    18,
    [24, 8, 18, 10, 12, 10],
    { walk: 40 },
    "Greatclub",
    "7d6",
    "bludgeoning",
  ],
  [
    "golem-bone",
    "Bone Golem",
    "Large",
    "construct",
    4,
    19,
    7,
    [18, 10, 14, 3, 10, 1],
    { walk: 40 },
    "Shortsword",
    "1d6",
    "piercing",
    4,
  ],
  [
    "golem-bronze",
    "Bronze Golem",
    "Large",
    "construct",
    9,
    20,
    15,
    [22, 10, 18, 3, 10, 1],
    { walk: 80 },
    "Fist",
    "3d10",
    "bludgeoning",
  ],
  [
    "golem-wood",
    "Wood Golem",
    "Small",
    "construct",
    0.5,
    13,
    3,
    [14, 8, 12, 3, 10, 1],
    { walk: 40 },
    "Fist",
    "1d8",
    "bludgeoning",
  ],
  [
    "leech-giant",
    "Giant Leech",
    "Medium",
    "beast",
    1,
    17,
    5,
    [14, 8, 12, 1, 10, 1],
    { walk: 30, swim: 30 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "lizard-giant-gecko",
    "Giant Gecko",
    "Medium",
    "beast",
    0.5,
    15,
    3,
    [14, 12, 12, 1, 10, 3],
    { walk: 40, climb: 40 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "lizard-giant-tuatara",
    "Giant Tuatara",
    "Large",
    "beast",
    2,
    16,
    6,
    [16, 10, 12, 1, 10, 3],
    { walk: 40 },
    "Claw",
    "1d4",
    "slashing",
  ],
  [
    "giant-monitor-lizard",
    "Giant Monitor Lizard",
    "Large",
    "beast",
    2,
    16,
    6,
    [18, 10, 14, 1, 10, 3],
    { walk: 40 },
    "Bite",
    "1d8",
    "piercing",
  ],
  [
    "common-lizard-man",
    "Common Lizardfolk",
    "Medium",
    "humanoid",
    0.5,
    15,
    3,
    [12, 10, 12, 8, 10, 8],
    { walk: 20 },
    "Spear",
    "1d6+1",
    "piercing",
  ],
  [
    "orc",
    "Orc",
    "Medium or Small",
    "humanoid",
    0.25,
    14,
    2,
    [12, 10, 12, 9, 10, 8],
    { walk: 30 },
    "Longsword",
    "1d8",
    "slashing",
  ],
  [
    "rock-baboon",
    "Rock Baboon",
    "Medium",
    "beast",
    0.5,
    14,
    3,
    [14, 12, 12, 6, 10, 6],
    { walk: 40 },
    "Club",
    "1d6",
    "bludgeoning",
  ],
  [
    "salamander-frost",
    "Frost Salamander",
    "Large",
    "elemental",
    6,
    18,
    9,
    [18, 10, 16, 10, 12, 10],
    { walk: 40 },
    "Claw",
    "1d6",
    "slashing",
  ],
  [
    "salamander-lightning",
    "Lightning Salamander",
    "Large",
    "elemental",
    4,
    17,
    8,
    [16, 12, 14, 10, 12, 10],
    { walk: 40 },
    "Bite",
    "2d4",
    "piercing",
    2,
  ],
  [
    "salamander-sand",
    "Sand Salamander",
    "Large",
    "elemental",
    3,
    18,
    6,
    [16, 8, 14, 10, 12, 10],
    { walk: 20 },
    "Bite",
    "1d6",
    "piercing",
  ],
  [
    "caveman",
    "Caveman",
    "Medium or Small",
    "humanoid",
    0.5,
    12,
    3,
    [14, 10, 12, 8, 10, 8],
    { walk: 40 },
    "Greatclub",
    "1d8",
    "bludgeoning",
  ],
];

/** Give a source-backed grapple attack its 2024 escape rules and target limit. */
function hold(
  c: Creature,
  action: Action,
  size: Size = "Large",
  capacity = 1,
): void {
  action.text += ` If the target is ${size} or smaller, it has the Grappled condition (escape DC ${dc(c, "str")}). The creature can grapple up to ${capacity} target${capacity === 1 ? "" : "s"} this way.`;
}

/** Name a mixed attack routine without changing its constituent damage rolls. */
function routine(c: Creature, text: string): void {
  c.actions!.unshift(
    utility("Multiattack", `The ${c.name.toLowerCase()} ${text}`),
  );
}

/** Attach a bounded 2024 translation of a source poison rider. */
function venom(c: Creature, action: Action, formula = "2d6"): void {
  action.damage!.push({ formula, type: "poison" });
  action.text += ` Constitution Saving Throw: DC ${dc(c)}, the target. Failure: ${damageText(formula, "poison")}, and the target has the Poisoned condition for 1 minute. The target repeats the save at the end of each of its turns, ending the condition on a success. Success: Half the Poison damage only.`;
}

/** Translate a source death effect into staged petrification with recovery. */
function petrify(c: Creature, action: Action): void {
  action.text += ` Constitution Saving Throw: DC ${dc(c)}, the target if it is not a Construct or an Undead. Failure: The target has the Restrained condition and repeats the save at the end of its next turn. On a success, the effect ends. On a failure, if it is still Restrained this way, it has the Petrified condition until freed by Greater Restoration or similar magic.`;
}

/** Convert source regeneration with the shared Acid and Fire counterplay. */
function regeneration(c: Creature): void {
  trait(
    c,
    "Regeneration",
    `The ${c.name.toLowerCase()} regains 5 Hit Points at the start of its turn. If it takes Acid or Fire damage, this trait doesn't function at the start of its next turn. It dies only if it starts its turn with 0 Hit Points and doesn't regenerate.`,
  );
}

/** Put 2024 spell groups and their visible casting action in the same block. */
function spells(c: Creature, ability: Ability, names: string[], per = 1): void {
  c.spellcasting = {
    ability,
    saveDc: dc(c, ability),
    groups: [
      {
        usage: { type: "perDay", per },
        spells: names.map((name) => ({
          name,
          ref: `srd-5.2:${name.toLowerCase().replaceAll(" ", "-")}`,
        })),
      },
    ],
  };
  c.actions!.push(
    utility(
      "Spellcasting",
      `The ${c.name.toLowerCase()} casts the following spells, requiring no Material components and using ${ability === "int" ? "Intelligence" : "Charisma"} as the spellcasting ability (spell save DC ${dc(c, ability)}): ${per}/Day Each: ${names.join(", ")}.`,
    ),
  );
}

/** Translate source invisibility, explicitly preserving whether attacks end it. */
function invisibility(c: Creature, persistent = false): void {
  c.actions!.push(
    utility(
      "Invisibility",
      `The ${c.name.toLowerCase()} has the Invisible condition until it ends the effect as a Bonus Action${persistent ? "." : ", makes an attack roll, deals damage, or casts a spell."}`,
    ),
  );
}

/** Apply the source's attack alternatives, movement, and distinctive mechanics. */
function specialize(c: Creature): Creature {
  const slug = c.id.split(":")[1];
  const first = c.actions!.find((a) => a.kind === "melee")!;
  if (["cattle", "aurochs", "bison"].includes(slug))
    c.actions!.push(attack(c, "Trample", "2d4", "bludgeoning"));
  if (slug === "barkling") {
    c.gear = ["Chain Mail", "Dagger"];
    c.senses.darkvision = 30;
    c.languages = ["Barkling"];
    c.actions!.push(attack(c, "Bite", "1d4", "piercing"));
    trait(
      c,
      "Keen Smell",
      "The barkling has Advantage on Wisdom (Perception and Survival) checks that rely on smell. It can follow the scent of a creature that passed within the last 24 hours.",
    );
    trait(
      c,
      "Unarmored Movement",
      "Without its armor, the barkling has Armor Class 11 and a Speed of 40 feet.",
    );
  }
  if (slug === "basilisk-greater") {
    venom(c, first, "3d6");
    const gaze = utility(
      "Petrifying Gaze",
      "The basilisk targets one creature within 30 feet that can see its eyes.",
    );
    petrify(c, gaze);
    c.bonusActions = [gaze];
    trait(
      c,
      "Avert Eyes",
      "A creature can avert its eyes at the start of its turn. Until its next turn, it cannot see the basilisk, and is not affected by Petrifying Gaze.",
    );
    trait(
      c,
      "Toxic Skin",
      `A creature that touches the basilisk with bare skin must succeed on a DC ${dc(c)} Constitution saving throw or take 10 (3d6) Poison damage. A creature makes this save no more than once per turn. This trait remains active for 24 hours after the basilisk dies.`,
    );
    trait(
      c,
      "Reflection",
      `If the basilisk sees its reflection within 30 feet, its own Petrifying Gaze targets it.`,
    );
  }
  if (slug === "bear-cave") {
    c.actions!.push(attack(c, "Bite", "2d6", "piercing"));
    routine(
      c,
      "makes two Claw attacks and one Bite attack. The Claw attacks must target the same creature to use Bear Hug.",
    );
    trait(
      c,
      "Bear Hug",
      `If both Claw attacks hit the same creature during a turn, it takes 9 (2d8) Bludgeoning damage and has the Grappled condition (escape DC ${dc(c, "str")}). The bear can grapple only one creature this way.`,
    );
    trait(
      c,
      "Last Stand",
      "When damage reduces the bear to 0 Hit Points, it remains conscious until the end of its next turn unless the damage kills it outright. It then dies if it still has 0 Hit Points.",
    );
  }
  if (slug === "beetle-giant-oil") {
    const spray = attack(c, "Oil Spray", "0", "acid", "", 5);
    delete spray.damage;
    spray.text = `Melee Attack Roll: +${spray.toHit}, reach 5 ft. Hit: The target has the Poisoned condition for 24 hours from painful blisters. Cure Wounds ends this effect instead of restoring Hit Points.`;
    c.actions!.push(spray);
    routine(
      c,
      "makes one Bite attack and one Oil Spray attack against different creatures.",
    );
  }
  if (slug === "beetle-giant-bombardier") {
    const spray = saving(
      c,
      "Hot Gas",
      "dex",
      "con",
      "each creature in a 10-foot Cone",
      "",
      ["2d6", "fire"],
      true,
      5,
    );
    spray.text +=
      " After using this action, the beetle cannot use it during its next two turns.";
    c.actions!.push(spray);
    routine(
      c,
      "makes one Bite attack and uses Hot Gas if available. These attacks must target different creatures.",
    );
  }
  if (slug === "bee-giant") {
    venom(c, first);
    first.text +=
      " After hitting with this attack, the bee leaves its stinger in the target and dies.";
  }
  if (slug === "blood-rose") {
    c.senses.blindsight = 30;
    hold(c, first, "Medium", 2);
    c.actions![0].text =
      "The rose makes one Thorn Cane attack for each free cane, to a maximum of two attacks.";
    trait(
      c,
      "Blood Drain",
      "At the start of the rose's turn, each creature Grappled by it takes 3 (1d6) Necrotic damage. Each grapple occupies one cane, which cannot attack until that grapple ends.",
    );
    trait(
      c,
      "Befuddling Fragrance",
      `A living creature that starts its turn within 30 feet of the rose must succeed on a DC ${dc(c)} Constitution saving throw or have the Charmed condition until the start of its next turn. While Charmed this way, it drops held objects and must use its movement to approach the rose by the safest available route. The effect ends if the creature leaves the area or takes damage. Constructs and Undead are unaffected.`,
    );
  }
  if (["caecilia-giant", "fish-giant-bass"].includes(slug)) {
    const damage = slug === "caecilia-giant" ? "1d8" : "2d4";
    const threshold = slug === "caecilia-giant" ? "19 or 20" : "20";
    const size = slug === "caecilia-giant" ? "Small" : "Medium";
    if (slug === "caecilia-giant") {
      c.senses.blindsight = 30;
      c.senses.tremorsense = 30;
    }
    first.text += ` If the attack roll's d20 result is ${threshold}, the target is ${size} or smaller, and the creature has no other creature swallowed, it swallows the target. The swallowed target has the Blinded and Restrained conditions and Total Cover against attacks and other effects outside the creature. It takes ${damageText(damage, "acid")} at the start of each of the creature's turns. If the creature takes 10 damage or more on a single turn from the swallowed target, it regurgitates the target into a space within 5 feet of itself, and the target has the Prone condition. If the creature dies, the target is no longer Restrained and can escape using 5 feet of movement.`;
  }
  if (slug === "cave-locust-giant") {
    c.senses.blindsight = 60;
    trait(
      c,
      "Standing Leap",
      "The locust's Long Jump is up to 60 feet and its High Jump is up to 30 feet, with or without a running start.",
    );
    c.actions!.push(
      attack(
        c,
        "Leaping Bump",
        "1d4",
        "bludgeoning",
        "If this damage reduces the target to 0 Hit Points, the target has the Unconscious condition and is Stable.",
      ),
    );
    c.actions!.push(
      saving(
        c,
        "Foul Spit",
        "con",
        "con",
        "one creature within 10 feet",
        "the target has the Incapacitated condition for 1 minute. It repeats the save at the end of each of its turns, ending the effect on a success.",
        undefined,
        false,
        1,
      ),
    );
    const spit = c.actions!.find((action) => action.id === "foul-spit")!;
    spit.name = "Foul Spit";
    delete spit.recharge;
    spit.text +=
      " The locust cannot use this action again until it finishes a Short or Long Rest.";
    trait(
      c,
      "Shriek",
      "When disturbed, the locust emits a shriek audible up to 300 feet away while it is conscious.",
    );
  }
  if (slug === "dinosaur-deinonychus")
    trait(
      c,
      "Pack Tactics",
      "The deinonychus has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
    );
  if (slug === "dinosaur-stegosaurus") {
    c.actions!.push(
      attack(c, "Bite", "1d6", "piercing"),
      attack(c, "Trample", "2d8", "bludgeoning"),
    );
    routine(
      c,
      "makes one Tail attack and one Bite attack against different creatures, or one Trample attack.",
    );
  }
  if (["huge-barracuda", "giant-barracuda"].includes(slug)) {
    c.skills = {
      perception: abilityMod(c.abilities.wis) + proficiencyBonus(c.cr!),
    };
    c.senses.passivePerception = 10 + c.skills.perception!;
    c.initiative = abilityMod(c.abilities.dex) + proficiencyBonus(c.cr!);
    trait(
      c,
      "Alert",
      "The barracuda has Advantage on Wisdom (Perception) checks that rely on sight.",
    );
  }
  if (slug === "fish-giant-catfish") {
    const fin = attack(c, "Fin", "1d4", "slashing");
    fin.text += ` Constitution Saving Throw: DC ${dc(c)}, the target. Failure: The target has Disadvantage on attack rolls and saving throws for 1 minute from painful venom. It repeats the save at the end of each of its turns, ending the effect on a success. Further failures renew the duration without stacking the penalty.`;
    c.actions!.push(fin);
    routine(
      c,
      "makes one Bite attack and two Fin attacks, each against a different creature.",
    );
  }
  if (slug === "fish-giant-piranha")
    trait(
      c,
      "Blood Scent",
      "The piranha has Advantage on Wisdom (Perception) checks to detect creatures that don't have all their Hit Points while underwater.",
    );
  if (["giant-cyclops", "giant-mountain"].includes(slug)) {
    const rock = attack(
      c,
      "Rock",
      slug === "giant-cyclops" ? "3d6" : "4d6",
      "bludgeoning",
    );
    rock.kind = "ranged";
    delete rock.reach;
    rock.range = {
      normal: slug === "giant-cyclops" ? 60 : 80,
      long: slug === "giant-cyclops" ? 200 : 240,
    };
    rock.text = `Ranged Attack Roll: +${rock.toHit}, range ${rock.range.normal}/${rock.range.long} ft. Hit: ${damageText(rock.damage![0].formula, "bludgeoning")}.`;
    if (slug === "giant-cyclops")
      rock.text += " The cyclop has Disadvantage on this attack roll.";
    c.actions!.push(rock);
    c.languages = ["Giant"];
    c.gear = ["Hide Armor", "Greatclub"];
    trait(
      c,
      "Unarmored Movement",
      `Without its armor, the ${c.name.toLowerCase()} has Armor Class 13 and a Speed of ${slug === "giant-cyclops" ? 30 : 50} feet.`,
    );
    if (slug === "giant-cyclops")
      trait(
        c,
        "Yearly Curse",
        `Once per year, the cyclop can cast Bestow Curse, requiring no Material components and using Charisma as the spellcasting ability (spell save DC ${dc(c, "cha")}).`,
      );
  }
  if (slug === "golem-amber") {
    c.actions!.push(attack(c, "Bite", "2d10", "piercing"));
    routine(c, "makes two Claw attacks and one Bite attack.");
    trait(
      c,
      "See Invisibility",
      "The golem can see Invisible creatures and objects within 60 feet as if they were visible.",
    );
    trait(
      c,
      "Keen Tracker",
      "The golem has Advantage on Wisdom (Survival) checks made to follow tracks, and can track across any terrain.",
    );
    c.skills = {
      survival: abilityMod(c.abilities.wis) + 2 * proficiencyBonus(c.cr!),
    };
    c.immunities!.push("Lightning");
    trait(
      c,
      "Lightning Absorption",
      "Whenever the golem is subjected to Lightning damage, it takes no damage and regains Hit Points equal to one-third of the Lightning damage dealt.",
    );
  }
  if (["golem-bone", "golem-bronze", "golem-wood"].includes(slug)) {
    c.resistances = ["Bludgeoning", "Piercing", "Slashing"];
    if (slug !== "golem-wood")
      trait(
        c,
        "Berserk",
        "At the start of each of its turns while Bloodied, the golem rolls 1d6. On a 6, it goes berserk until it spends a turn without attacking. While berserk, it attacks the nearest creature or, if none is within reach, moves toward it. Its creator can take an action within 60 feet to make a DC 15 Charisma (Persuasion) check, ending the berserk state on a success.",
      );
    if (slug === "golem-wood") {
      c.vulnerabilities = ["Fire"];
      trait(
        c,
        "Flammable",
        "The golem has Disadvantage on saving throws against effects that deal Fire damage.",
      );
    }
    if (slug === "golem-bone") {
      c.gear = ["Four Shortswords"];
      c.actions!.push(attack(c, "Heavy Weapon", "1d10", "slashing"));
      c.actions![0].text =
        "The golem makes four Shortsword attacks, or two Heavy Weapon attacks if equipped with two heavy weapons.";
    }
    if (slug === "golem-bronze") {
      first.damage!.push({ formula: "1d10", type: "fire" });
      first.text += " The target also takes 5 (1d10) Fire damage.";
      trait(
        c,
        "Molten Interior",
        `When a creature within 5 feet of the golem hits it with a melee attack roll, the attacker must succeed on a DC ${dc(c)} Dexterity saving throw or take 7 (2d6) Fire damage.`,
      );
    }
  }
  if (slug === "hangman-tree") {
    c.senses.blindsight = 30;
    hold(c, first, "Large", 4);
    c.actions![0].text =
      "The tree makes one Noose attack for each free limb, to a maximum of four attacks, each against a different creature.";
    trait(
      c,
      "Strangle",
      "At the start of the tree's turn, each creature Grappled by it takes 3 (1d6) Bludgeoning damage and cannot breathe until the grapple ends. Each grapple occupies one limb, which cannot attack until that grapple ends.",
    );
  }
  if (slug === "assassin-vine") {
    c.senses.blindsight = 30;
    hold(c, first);
    trait(
      c,
      "Crush",
      "At the start of the vine's turn, a creature Grappled by it takes 4 (1d8) Bludgeoning damage. The vine cannot use Entangle while it has a creature Grappled.",
    );
    trait(
      c,
      "Camouflage",
      "The vine has Advantage on Dexterity (Stealth) checks made to hide among vegetation or fungi.",
    );
  }
  if (slug === "leech-giant") {
    first.text +=
      " On a hit, the leech attaches to the target. While attached, it cannot make Bite attacks. The target takes 3 (1d6) Necrotic damage at the start of each of the leech's turns. The attachment ends when the leech dies. A creature within reach can also take an action to make a DC 14 Strength (Athletics) check, detaching the leech on a success.";
  }
  if (slug === "jelly-green") {
    c.immunities = [
      "Acid",
      "Lightning",
      "Necrotic",
      "Poison",
      "Psychic",
      "Radiant",
      "Thunder",
      "Force",
    ];
    c.conditionImmunities = [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Prone",
    ];
    c.senses.blindsight = 30;
    c.actions = [
      attack(
        c,
        "Cling",
        "0",
        "acid",
        "The jelly attaches to the target and moves with it. While attached, it cannot use Cling against another target. The target takes 3 (1d6) Acid damage at the start of each of its turns. Before the end of the target's next turn, it or a creature within reach can take an action to scrape off the jelly. Later removal requires dealing Cold or Fire damage to the jelly, dealing the same damage to the target, or casting Lesser Restoration on the target, which destroys the jelly.",
      ),
    ];
    delete c.actions[0].damage;
    c.actions[0].text = c.actions[0].text!.replace(/Hit: .*? damage\./, "Hit:");
    trait(
      c,
      "Corrosive",
      "Nonmagical metal or wood objects touching the jelly take 3 (1d6) Acid damage at the start of the jelly's turn. It does not damage stone or magic metal.",
    );
    trait(
      c,
      "Sunlight Destruction",
      "The jelly dies when exposed to direct sunlight.",
    );
    trait(
      c,
      "Cold and Fire Susceptibility",
      "The jelly is immune to Bludgeoning, Piercing, and Slashing damage while unattached. While attached, Slashing damage can cut it away, dealing the same damage to its host.",
    );
  }
  if (slug === "living-statue-iron") {
    trait(
      c,
      "Weapon Trap",
      `When a creature hits the statue with a nonmagical metal weapon, the creature must succeed on a DC ${dc(c, "str")} Dexterity saving throw or the weapon becomes stuck. The weapon can be recovered when the statue dies. A creature within reach can also take an action to make a DC ${dc(c, "str")} Strength (Athletics) check, freeing the weapon on a success.`,
    );
  }
  if (slug === "living-statue-stone")
    for (const a of c.actions!) if (a.kind === "melee") a.reach = 5;
  if (slug === "lizard-giant-draco")
    trait(
      c,
      "Glide",
      "The lizard cannot ascend using its Fly Speed and must land by the end of its third consecutive turn spent flying.",
    );
  if (slug === "lizard-giant-gecko")
    trait(
      c,
      "Spider Climb",
      "The gecko can climb difficult surfaces, including along ceilings, without needing to make an ability check.",
    );
  if (slug === "lizard-giant-tuatara") {
    c.resistances = ["Cold"];
    c.actions!.push(attack(c, "Bite", "2d6", "piercing"));
    routine(c, "makes two Claw attacks and one Bite attack.");
  }
  if (slug === "lizard-giant-horned-chameleon") {
    const tongue = attack(c, "Tongue", "0", "bludgeoning", "", 20);
    delete tongue.damage;
    tongue.text = `Melee Attack Roll: +${tongue.toHit}, reach 20 ft. Hit: The target has the Grappled condition (escape DC ${dc(c, "str")}) if it is Large or smaller, and is pulled up to 20 feet toward the chameleon. The chameleon can grapple only one target this way.`;
    first.text +=
      " If the target was Grappled by the chameleon's Tongue at the start of this turn, this Bite automatically hits it without an attack roll.";
    c.actions!.push(tongue);
    trait(
      c,
      "Camouflage",
      "The chameleon has Advantage on Dexterity (Stealth) checks made to hide.",
    );
  }
  if (slug.endsWith("monitor-lizard")) {
    trait(
      c,
      "Upright Sprint",
      "If the monitor moves in a straight line, its Speed is 60 feet for that movement.",
    );
    first.text += ` Constitution Saving Throw: DC ${dc(c)}, the target. Failure: The target has the Poisoned condition for 1 minute and takes 3 (1d6) Poison damage at the start of each of its turns. It repeats the save at the end of each of its turns, ending the effect on a success. Repeated bites do not stack this effect.`;
    if (slug === "giant-monitor-lizard")
      first.text +=
        " On the first failed save after each bite, the target also takes 10 (3d6) Poison damage.";
    if (slug === "large-monitor-lizard")
      first.text = (first.text ?? "")
        .replace("for 1 minute", "for 10 minutes")
        .replace(
          "at the start of each of its turns",
          "at the start of each minute",
        )
        .replace(
          "at the end of each of its turns",
          "at the end of each minute",
        );
  }
  if (["common-lizard-man", "subterranean-lizard-man"].includes(slug)) {
    c.languages = ["Draconic"];
    trait(
      c,
      "Hold Breath",
      "The lizardfolk can hold its breath for 10 minutes.",
    );
    if (slug === "common-lizard-man") {
      c.gear = ["Leather Armor", "Shield", "Spear"];
      trait(
        c,
        "Unarmored Swimmer",
        "Without its armor and shield, the lizardfolk has Armor Class 12, a Speed of 30 feet, and a Swim Speed of 40 feet.",
      );
    } else {
      c.actions!.push(attack(c, "Bite", "1d4", "piercing"));
      routine(c, "makes two Claw attacks and one Bite attack.");
      c.senses.darkvision = 60;
      trait(
        c,
        "Underground Camouflage",
        "The lizardfolk has Advantage on Dexterity (Stealth) checks made to hide underground.",
      );
      trait(
        c,
        "Stench",
        `A creature other than a Construct or an Undead that starts its turn within 10 feet of the lizardfolk must succeed on a DC ${dc(c)} Constitution saving throw or have the Poisoned condition until the start of its next turn. On a successful save, it is immune to this lizardfolk's Stench for 24 hours.`,
      );
    }
  }
  if (slug === "nixie") {
    c.languages = ["Sylvan"];
    const charm = saving(
      c,
      "Water Charm",
      "wis",
      "cha",
      "one Humanoid within 30 feet, while at least nine other willing nixies within 30 feet take the Ready action to assist",
      "the target has the Charmed condition for 24 hours and regards the nixies as trusted friends. It repeats the save when it takes damage, ending the effect on a success.",
      undefined,
      false,
      1,
    );
    c.actions!.push(charm);
    spells(c, "cha", ["Water Breathing"]);
  }
  if (slug === "parrot-or-cockatiel") {
    c.actions!.push(attack(c, "Talons", "1d4", "slashing"));
    trait(
      c,
      "Mimicry",
      "The parrot can mimic simple sounds it has heard. A listener can discern the imitation with a successful DC 10 Wisdom (Insight) check.",
    );
  }
  if (slug === "pixie") {
    c.languages = ["Sylvan"];
    invisibility(c, true);
    trait(
      c,
      "Limited Flight",
      "After flying for 30 minutes, the pixie must rest from flying for 10 minutes.",
    );
  }
  if (slug === "alicorn") {
    c.alignment = "chaotic evil";
    c.actions!.push(attack(c, "Hooves", "2d4", "slashing"));
    routine(c, "makes two Hooves attacks and one Horn attack.");
    invisibility(c);
  }
  if (slug === "rhagodessa-giant") {
    const leg = attack(c, "Adhesive Leg", "0", "bludgeoning");
    delete leg.damage;
    leg.text = `Melee Attack Roll: +${leg.toHit}, reach 5 ft. Hit: The target has the Grappled condition (escape DC ${dc(c, "str")}) if it is Large or smaller. Both legs can grapple only one creature at a time. If both legs are holding the target, it must escape each leg separately. At the start of the rhagodessa's turn, it pulls the target into reach.`;
    first.text +=
      " This attack can target only a creature Grappled by the rhagodessa at the start of this turn. It automatically hits that target without an attack roll.";
    c.actions!.push(leg);
    routine(
      c,
      "makes two Adhesive Leg attacks against the same creature. It can instead make one Bite attack.",
    );
    trait(
      c,
      "Wall Climber",
      "The rhagodessa can climb walls without making an ability check, but cannot climb ceilings. A creature Grappled by the rhagodessa has Advantage on attack rolls against it using Light melee weapons.",
    );
  }
  if (["normal-roc", "large-roc"].includes(slug)) {
    const bite = slug === "normal-roc" ? "2d6" : "2d10";
    c.actions!.push(attack(c, "Bite", bite, "piercing"));
    routine(
      c,
      "makes two Talons attacks and one Bite attack. It cannot attack a creature it is carrying.",
    );
    trait(
      c,
      "Carry Prey",
      `A creature ${slug === "normal-roc" ? "Small" : "Large"} or smaller hit by both Talons attacks on the roc's turn has the Grappled condition (escape DC ${dc(c, "str")}). The roc can grapple only one target this way and cannot attack that target while carrying it.`,
    );
  }
  if (slug === "rot-grub") {
    c.actions = [
      utility(
        "Infest",
        "Melee Attack Roll: +2, reach 0 ft. Hit: The grub burrows into the target's flesh. The target can notice it with a successful DC 10 Wisdom (Perception) check. The target takes 1 Necrotic damage at the start of each of its turns while infested. During the first two rounds, applying Fire or cutting it out with a Slashing weapon deals 7 (2d6) damage to the host and kills the grub. Lesser Restoration kills the grub at any time. The grub cannot attack another target while infesting a host.",
      ),
    ];
    c.actions[0].kind = "melee";
    c.actions[0].toHit = 2;
    c.actions[0].reach = 0;
    c.actions[0].damage = [{ formula: "1", type: "necrotic" }];
    c.actions[0].text = (c.actions[0].text ?? "").replace(
      "Hit: The grub",
      "Hit: 1 Necrotic damage, and the grub",
    );
  }
  if (["salamander-frost", "salamander-lightning"].includes(slug)) {
    const type = slug === "salamander-frost" ? "Cold" : "Lightning";
    c.immunities = [type];
    c.resistances = ["Bludgeoning", "Piercing", "Slashing"];
    c.languages = ["Primordial"];
    trait(
      c,
      `${type} Aura`,
      `A creature without Resistance or Immunity to ${type} damage that starts its turn within 20 feet of the salamander takes 4 (1d8) ${type} damage. A creature takes this damage no more than once per turn.`,
    );
    if (slug === "salamander-frost") {
      c.actions!.push(attack(c, "Bite", "2d6", "piercing"));
      routine(c, "makes four Claw attacks and one Bite attack.");
    }
  }
  if (slug === "salamander-sand") {
    c.languages = ["Primordial"];
    c.immunities = ["Piercing"];
    c.resistances = ["Slashing"];
    petrify(c, first);
    c.bonusActions = [
      utility(
        "Shifting Sand",
        `Stone within 20 feet of the salamander becomes sand and is Difficult Terrain until the salamander ends this effect or moves out of range. A creature that starts its turn on this sand must succeed on a DC ${dc(c)} Dexterity saving throw or have its Speed reduced to 0 until the start of its next turn. When sand returns to stone, a creature standing in it must succeed on the same save or have the Restrained condition. The creature or an ally within reach can take an action to make a DC ${dc(c, "str")} Strength (Athletics) check, ending the condition on a success.`,
      ),
    ];
  }
  if (slug === "sea-serpent")
    c.actions!.push(
      utility(
        "Constrict Vessel",
        "The serpent wraps around a vessel within reach, dealing 11 (2d10) Bludgeoning damage to it. It ignores half the vessel's damage threshold, rounded down.",
      ),
    );
  if (slug === "shrew-venomous-giant") {
    venom(c, first);
    first.text +=
      " A target makes the poison saving throw only once per turn, even if both bites hit it.";
  }
  if (slug === "snake-spitting-cobra") {
    venom(c, first);
    c.actions!.push(
      saving(
        c,
        "Venom Spit",
        "con",
        "con",
        "one creature within 5 feet",
        "the target has the Blinded condition until cured by Lesser Restoration or similar magic. It repeats the save at the end of each of its turns for 1 minute, ending the condition on a success.",
      ),
    );
  }
  if (slug === "spider-giant-tarantula") {
    first.text += ` Constitution Saving Throw: DC ${dc(c)}, the target. Failure: The target dances for 1 minute, has Disadvantage on attack rolls and saving throws, and cannot take Reactions. At the start of each of its turns it takes 2 (1d4) Poison damage, and at the end it repeats the save, ending the dance on a success. Lesser Restoration ends the original victim's dance; Dispel Magic can end any dance caused by this venom.`;
    trait(
      c,
      "Contagious Dance",
      `A creature other than the tarantula that starts its turn within 30 feet of a dancing victim and can see it must succeed on a DC ${dc(c, "cha")} Wisdom saving throw or dance until the end of its next turn, with Disadvantage on attack rolls and saving throws and no Reactions. A secondary dancer takes no Poison damage and does not spread the dance. A successful save grants immunity to Contagious Dance for 24 hours.`,
    );
  }
  if (slug.startsWith("squid-giant-")) {
    c.actions!.push(
      attack(
        c,
        "Bite",
        slug.endsWith("female") ? "1d12" : "1d10",
        "piercing",
        "The bite can target only a creature Grappled by the squid or hit by at least two Tentacle attacks this turn.",
      ),
    );
    routine(c, "makes 8 Tentacle attacks and one Bite attack.");
    trait(
      c,
      "Tentacle Grip",
      `When two Tentacle attacks hit the same Large or smaller creature during a turn, the target has the Grappled condition (escape DC ${dc(c, "str")}) and is pulled up to 10 feet toward the squid. The squid can grapple up to four creatures, using two tentacles per creature, and cannot use those tentacles to attack another target until the grapple ends.`,
    );
    c.actions!.push(
      utility(
        "Ink Cloud",
        "While underwater, the squid releases ink in a 15-foot-radius Sphere centered on itself. The area is Heavily Obscured for 1 minute or until dispersed by a strong current. For 1 minute, the squid's Swim Speed is doubled, and it can immediately move up to that Speed. It cannot use this action again until it finishes a Short or Long Rest.",
      ),
    );
  }
  if (["woolly-rhino", "titanothere"].includes(slug))
    c.actions!.push(
      attack(
        c,
        "Trample",
        slug === "woolly-rhino" ? "2d12" : "3d8",
        "bludgeoning",
      ),
    );
  if (slug === "trollwife" || slug.startsWith("trollkin-")) {
    c.languages = ["Giant"];
    c.senses.darkvision = 60;
    const formula =
      slug === "trollwife" ? "2d6" : slug === "trollkin-infant" ? "1d4" : "1d6";
    c.actions!.push(attack(c, "Bite", formula, "piercing"));
    routine(c, "makes two Claw attacks and one Bite attack.");
    regeneration(c);
    if (slug === "trollwife")
      trait(
        c,
        "Vengeful Tracker",
        "The trollwife has Advantage on Wisdom (Survival) checks to track a creature that harmed its mate or offspring.",
      );
  }
  if (slug === "urgoblin") {
    c.languages = ["Common", "Goblin"];
    c.senses.darkvision = 60;
    c.gear = ["Hide Armor", "Shield", "Longsword"];
    regeneration(c);
    trait(
      c,
      "Unarmored Movement",
      "Without its armor and shield, the urgoblin has Armor Class 11 and a Speed of 40 feet.",
    );
  }
  if (slug === "orc") {
    c.languages = ["Common", "Orc"];
    c.senses.darkvision = 60;
    c.gear = ["Hide Armor", "Shield", "Longsword"];
    trait(
      c,
      "Sunlight Sensitivity",
      "While in sunlight or in light created by a spell, the orc has Disadvantage on attack rolls.",
    );
    trait(
      c,
      "Unarmored Movement",
      "Without its armor and shield, the orc has Armor Class 11 and a Speed of 40 feet.",
    );
  }
  if (slug === "rock-baboon") {
    c.actions!.push(
      attack(c, "Fist", "1d4", "bludgeoning"),
      attack(c, "Bite", "1d4", "piercing"),
    );
    routine(
      c,
      "makes one Club attack and one Bite attack. It can replace the Club attack with one Fist attack.",
    );
    c.gear = ["Club"];
  }
  if (["box-turtle", "snapping-turtle"].includes(slug))
    c.bonusActions = [
      utility(
        "Withdraw",
        "The turtle retracts into its shell. Until it emerges as a Bonus Action, it has Half Cover, its Speed is 0, and it cannot make attacks.",
      ),
    ];
  if (slug === "water-termite-giant") {
    c.actions = [
      saving(
        c,
        "Noxious Spray",
        "con",
        "con",
        "one creature within 5 feet",
        "the target has the Stunned condition until the end of its next turn.",
      ),
    ];
    c.actions.push(
      utility(
        "Eat Hull",
        "The termite deals 5 (2d4) damage to a wooden vessel within 5 feet. After feeding for 6 rounds, it cannot use this action again until it finishes a Short or Long Rest.",
      ),
    );
  }
  if (slug === "whale-narwhal" || slug === "whale-sperm") {
    trait(c, "Hold Breath", "The whale can hold its breath for 1 hour.");
    if (slug === "whale-sperm") {
      c.senses.blindsight = 60;
      c.actions!.push(
        saving(
          c,
          "Sonic Beam",
          "con",
          "con",
          "each creature in a 50-foot-long, 5-foot-wide Line underwater",
          "the target has the Stunned condition for 1 minute. It repeats the save at the end of each of its turns, ending the effect on a success.",
        ),
      );
    }
  }
  if (slug === "yellow-mold") {
    c.actions = [];
    c.reactions = [
      saving(
        c,
        "Spore Cloud",
        "con",
        "con",
        "each creature within 10 feet when the mold is touched or damaged",
        "the target takes 4 (1d8) Poison damage at the start of each of its turns for 6 rounds. It repeats the save at the end of each of its turns, ending the effect on a success.",
        undefined,
        false,
        1,
      ),
    ];
    trait(
      c,
      "Sunlight Dormancy",
      "While in sunlight, the mold cannot use Spore Cloud.",
    );
  }
  if (slug === "zombraire" || slug === "skeletaire") {
    c.conditionImmunities!.push("Charmed", "Paralyzed", "Unconscious");
    c.resistances = [slug === "zombraire" ? "Bludgeoning" : "Slashing"];
    trait(
      c,
      "Projectile Resistance",
      "The creature takes only 1 damage from each nonmagical arrow, bolt, or sling stone that hits it.",
    );
    c.languages = [
      slug === "zombraire" ? "Common" : "Understands Common but cannot speak",
    ];
    spells(c, "int", ["Magic Missile", "Sleep"]);
  }
  return c;
}

/** Build each source elemental tier around its single attack and material rules. */
function elemental(
  kind: "cold" | "lightning" | "metal" | "wood",
  tier: number,
): Creature {
  const label = ["Staff", "Device", "Spell"][tier];
  const type: DamageType =
    kind === "cold"
      ? "cold"
      : kind === "lightning"
        ? "lightning"
        : kind === "metal"
          ? "slashing"
          : "bludgeoning";
  const c = fromProfile([
    `${label.toLowerCase()}-elemental-${kind}`,
    `${label} ${kind[0].toUpperCase()}${kind.slice(1)} Elemental`,
    tier === 2 ? "Huge" : "Large",
    "elemental",
    [3, 5, 6][tier],
    [16, 17, 18][tier],
    [8, 12, 14][tier],
    [[16, 18, 20][tier], kind === "lightning" ? 14 : 10, 14, 6, 10, 6],
    kind === "lightning"
      ? { walk: 40, fly: 80, hover: true }
      : { walk: kind === "metal" ? 20 : 40 },
    kind === "metal" ? "Blade" : "Strike",
    ["1d12", "2d8", "3d6"][tier],
    type,
  ]);
  c.languages = ["Primordial"];
  c.senses.darkvision = 60;
  c.immunities = [
    "Poison",
    ...(kind === "cold" ? ["Cold"] : kind === "lightning" ? ["Lightning"] : []),
  ];
  c.resistances = ["Bludgeoning", "Piercing", "Slashing"];
  c.conditionImmunities = ["Exhaustion", "Paralyzed", "Petrified", "Poisoned"];
  if (kind === "cold") {
    c.vulnerabilities = ["Fire"];
    trait(
      c,
      "Freezing Aura",
      "A creature that starts its turn within 5 feet of the elemental takes 3 (1d6) Cold damage unless it has Immunity to Cold damage.",
    );
    trait(
      c,
      "Cold Affinity",
      "The elemental's Strike deals an extra 4 (1d8) Cold damage to a creature made of fire, liquid, or jelly.",
    );
    trait(
      c,
      "Freezing Touch",
      "Nonmagical liquids touching the elemental freeze solid. While the ambient temperature exceeds 50 degrees Fahrenheit, the elemental takes 3 (1d6) Fire damage at the start of each of its turns.",
    );
  } else if (kind === "lightning") {
    trait(
      c,
      "Conductive Strike",
      "The elemental's Strike deals an extra 4 (1d8) Lightning damage to a target touching water or metal while not touching solid ground.",
    );
    trait(
      c,
      "Wind Vulnerability",
      "The elemental takes double damage from an Air Elemental's attacks and from effects that deal damage through wind. A Wood Elemental's attacks also deal double damage to it.",
    );
    c.actions!.push(
      saving(
        c,
        "Thunderclap",
        "con",
        "con",
        "each creature within 30 feet",
        "the target has the Deafened condition for 10 minutes.",
      ),
    );
    c.actions!.push(
      utility(
        "Magnetic Pull",
        `Strength Saving Throw: DC ${dc(c, "str")}, one creature carrying a metal object within 60 feet. Failure: The target is pulled up to 20 feet toward the elemental. An unattended metal object weighing no more than 100 pounds moves up to 20 feet toward it instead.`,
      ),
    );
    c.actions![2].kind = "save";
    c.actions![2].save = {
      ability: "str",
      dc: dc(c, "str"),
      onSave: "negates",
    };
  } else if (kind === "metal") {
    c.vulnerabilities = ["Lightning"];
    trait(
      c,
      "Metal Affinity",
      "The elemental has Advantage on attack rolls against creatures wearing metal armor. Its Blade deals an extra 4 (1d8) Slashing damage to a target made of or touching metal.",
    );
    trait(
      c,
      "Water Barrier",
      "The elemental cannot cross a body of water deeper than its height.",
    );
  } else {
    c.vulnerabilities = ["Fire", "Lightning"];
    trait(
      c,
      "Wood Affinity",
      "The elemental's Strike deals an extra 4 (1d8) Bludgeoning damage to a target touching wood, including wooden weapons or shields.",
    );
  }
  return c;
}

const DRAGON_AGES = [
  "Wyrmling",
  "Juvenile",
  "Young",
  "Adult",
  "Mature",
  "Elder",
  "Ancient",
] as const;
const DRAGON_SOURCE = {
  cloud: {
    hd: [8, 9, 10, 11, 12, 13, 14],
    claw: ["1d6", "1d6", "1d6", "2d4", "2d4", "2d6", "2d8"],
    bite: ["3d6", "4d6", "5d6", "6d6", "6d6", "7d6", "7d6"],
    tail: ["1d4", "1d6", "1d6", "2d4", "2d6", "2d6", "2d8"],
    cr: [4, 5, 6, 10, 11, 12, 13],
    ac: [16, 17, 18, 18, 19, 19, 20],
    hp: [90, 104, 123, 150, 168, 190, 210],
    length: [0, 70, 80, 90, 95, 100, 110],
    width: [0, 30, 35, 45, 50, 55, 60],
  },
  plains: {
    hd: [2, 3, 4, 5, 6, 7, 8],
    claw: ["1d4", "1d4", "1d6", "1d6", "1d6", "1d8", "1d8"],
    bite: ["2d4", "2d6", "2d8", "2d10", "2d10", "2d10", "2d12"],
    tail: ["1d4", "1d6", "1d6", "1d8", "1d8", "1d8", "1d10"],
    cr: [1, 2, 3, 6, 7, 8, 9],
    ac: [14, 15, 16, 16, 17, 17, 18],
    hp: [22, 33, 45, 90, 104, 123, 147],
    length: [0, 50, 60, 70, 80, 85, 90],
    width: [0, 25, 30, 30, 35, 40, 45],
  },
  sea: {
    hd: [5, 6, 7, 8, 9, 10, 11],
    claw: ["1d4", "1d6", "1d6", "1d6", "1d6", "1d8", "1d10"],
    bite: ["2d4", "3d4", "3d6", "3d8", "3d8", "3d8", "3d10"],
    tail: [],
    cr: [2, 3, 4, 7, 8, 9, 10],
    ac: [15, 16, 17, 18, 18, 19, 19],
    hp: [40, 52, 67, 123, 147, 162, 178],
    length: [0, 70, 80, 90, 95, 100, 100],
    width: [0, 25, 30, 40, 45, 50, 55],
  },
};

/** Preserve seven source ages and species attacks while adding reviewed 2024 boss options. */
function dragon(species: keyof typeof DRAGON_SOURCE, age: number): Creature {
  const s = DRAGON_SOURCE[species];
  const label = species[0].toUpperCase() + species.slice(1);
  const name =
    age === 0
      ? `${label} Dragon Wyrmling`
      : `${DRAGON_AGES[age]} ${label} Dragon`;
  const slug =
    age === 0
      ? `${species}-dragon-wyrmling`
      : `${DRAGON_AGES[age].toLowerCase()}-${species}-dragon`;
  const size: Size =
    age < 2 ? "Medium" : age < 3 ? "Large" : age < 6 ? "Huge" : "Gargantuan";
  const str = [14, 16, 18, 20, 22, 24, 26][age];
  const con = [12, 14, 16, 18, 18, 20, 22][age];
  const hd = Math.round(
    s.hp[age] / ((HIT_DIE[size] + 1) / 2 + abilityMod(con)),
  );
  const c = fromProfile([
    slug,
    name,
    size,
    "dragon",
    s.cr[age],
    s.ac[age],
    hd,
    [str, 12, con, 12 + age, 12 + age, 12 + age],
    species === "sea"
      ? { walk: 10, fly: 60, swim: 60 }
      : { walk: species === "plains" ? 50 : 30, fly: 80 },
    "Claw",
    s.claw[age],
    "slashing",
  ]);
  c.alignment = species === "cloud" ? "neutral good" : "neutral";
  c.languages = age === 0 ? [] : ["Draconic", "Common"];
  c.senses.darkvision = 120;
  c.senses.blindsight = 30;
  c.skills = {
    perception: abilityMod(c.abilities.wis) + 2 * proficiencyBonus(c.cr!),
    stealth: abilityMod(c.abilities.dex) + proficiencyBonus(c.cr!),
  };
  c.senses.passivePerception = 10 + c.skills.perception!;
  c.actions!.push(attack(c, "Bite", s.bite[age], "piercing"));
  if (species !== "sea")
    c.actions!.push(
      attack(
        c,
        "Tail",
        s.tail[age],
        "bludgeoning",
        "",
        size === "Gargantuan" ? 20 : 15,
      ),
    );
  routine(
    c,
    `makes two Claw attacks and one Bite attack${species !== "sea" ? ", and one Tail attack against a different creature" : ""}.${age > 0 ? " It can replace the Bite attack with a use of its breath weapon if available." : ""}`,
  );
  if (age > 0) {
    const type: DamageType = species === "cloud" ? "cold" : "fire";
    const target =
      species === "sea"
        ? `each creature in a ${s.width[age]}-foot Cube within ${s.length[age]} feet`
        : `each creature in a ${s.length[age]}-foot Cone`;
    const breath = saving(
      c,
      species === "cloud"
        ? "Cold Breath"
        : species === "plains"
          ? "Heat Breath"
          : "Steam Breath",
      species === "cloud" ? "con" : "dex",
      "con",
      target,
      "",
      [`${s.hd[age]}d8`, type],
      true,
    );
    breath.name += " (Recharge 5–6)";
    breath.recharge = { type: "dice", value: 5 };
    c.actions!.push(breath);
    if (species === "cloud") {
      c.immunities = ["Cold", ...(age >= 3 ? ["Lightning"] : [])];
      if (age >= 3)
        c.actions!.push(
          saving(
            c,
            "Lightning Breath",
            "dex",
            "con",
            `each creature in a ${s.length[age]}-foot-long, 5-foot-wide Line`,
            "",
            [`${s.hd[age]}d8`, "lightning"],
            true,
            2,
          ),
        );
    } else if (species === "plains") c.immunities = ["Fire"];
  }
  if (species === "cloud")
    c.actions!.push(
      utility(
        "Change Shape",
        "The dragon shape-shifts into a Small or Medium Humanoid, or returns to its true form. Its statistics are unchanged except its size. Equipment is not transformed. It cannot use its natural attacks, Fly Speed, or breath weapons in Humanoid form. It returns to its true form if it dies.",
      ),
    );
  if (species === "plains")
    trait(
      c,
      "Grassland Camouflage",
      "The dragon has Advantage on Dexterity (Stealth) checks made to hide in grassland.",
    );
  if (species === "sea") {
    trait(c, "Hold Breath", "The dragon can hold its breath for 30 minutes.");
    trait(
      c,
      "Steam Resistance",
      "The dragon is immune to damage from nonmagical steam, including other Sea Dragons' breath weapons, and has Resistance to damage from magical steam.",
    );
  }
  if (age >= 3) {
    c.legendaryResistance = 3;
    c.initiative = abilityMod(c.abilities.dex) + proficiencyBonus(c.cr!);
    trait(
      c,
      "Legendary Resistance (3/Day)",
      "If the dragon fails a saving throw, it can choose to succeed instead.",
    );
    c.legendaryActions = {
      perRound: 3,
      actions: [
        utility(
          species === "sea" ? "Claw Attack" : "Tail Attack",
          `The dragon makes one ${species === "sea" ? "Claw" : "Tail"} attack.`,
        ),
        utility(
          species === "sea" ? "Dive" : "Flight",
          `The dragon moves up to half its ${species === "sea" ? "Swim" : "Fly"} Speed without provoking Opportunity Attacks.`,
        ),
        species === "cloud"
          ? {
              ...utility(
                "Change Shape",
                "The dragon uses Change Shape. The dragon can't take this action again until the start of its next turn.",
              ),
              id: "legendary-change-shape",
            }
          : utility(
              "Veiling Mist",
              "The dragon uses Spellcasting to cast Fog Cloud, if available. The dragon can't take this action again until the start of its next turn.",
            ),
      ],
    };
    const chosen =
      species === "cloud"
        ? ["Detect Magic", "Gust of Wind", "Dispel Magic"]
        : species === "plains"
          ? ["Fog Cloud", "Silent Image"]
          : ["Fog Cloud", "Mirror Image"];
    if (species === "cloud") {
      if (age >= 4) chosen.push("Dimension Door");
      if (age >= 5) chosen.push("Telekinesis");
      if (age >= 6) chosen.push("Disintegrate");
    } else if (species === "plains") {
      if (age >= 4) chosen.push("Mirror Image");
      if (age >= 6) chosen.push("Haste");
    } else if (age >= 5) chosen.push("Water Breathing");
    spells(c, "cha", chosen);
    if (age >= 5) {
      trait(
        c,
        "Breath Shaping",
        `When using ${species === "cloud" ? "Cold Breath" : species === "plains" ? "Heat Breath" : "Steam Breath"}, the dragon can change its area to ${age === 5 ? (species === "sea" ? `a ${s.length[age]}-foot Cone` : `a ${s.length[age]}-foot-long, 5-foot-wide Line`) : `a ${s.length[age]}-foot Cone, a ${s.length[age]}-foot-long, 5-foot-wide Line, or a ${s.width[age]}-foot Cube within ${s.length[age]} feet`}.`,
      );
    }
  }
  return c;
}

export const basicFantasyCreatures: Creature[] = [
  ...profiles.map(fromProfile).map(specialize),
  ...(["cold", "lightning", "metal", "wood"] as const).flatMap((kind) =>
    [0, 1, 2].map((tier) => elemental(kind, tier)),
  ),
  ...(["cloud", "plains", "sea"] as const).flatMap((species) =>
    DRAGON_AGES.map((_, age) => dragon(species, age)),
  ),
].sort((a, b) => a.name.localeCompare(b.name));
