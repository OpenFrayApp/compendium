// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import type { Spell } from "../schema/spell.ts";
import { tomeOfHeroesClasses } from "./tomeOfHeroesClasses.ts";

export const TOME_OF_HEROES_PDF_SHA256 =
  "de2d8b5bbe6f92cb2ee31df68192c042883bfe965aa52ab6d91be374d882c38c";
export const TOME_OF_HEROES_CANDIDATE_SHA256 =
  "275e34dc40b6543539d1f28da6bec116fbf0aaca5967d9e5ed2ddaa027a4b08a";
export const TOME_OF_HEROES_SOURCE_PAGES: Readonly<Record<string, number>> = {
  "Ambush Chute": 273,
  "Armored Formation": 274,
  Babble: 274,
  "Battle Mind": 274,
  "Beast Within": 275,
  "Betraying Bauble": 275,
  Bloodlust: 275,
  "Blunted Edge": 275,
  "Bolster Fortifications": 276,
  "Bound Haze": 276,
  "Burst Stone": 276,
  "Butterfly Effect": 277,
  "Calm Beasts": 277,
  "Clear the Board": 277,
  "Conjure Construct": 277,
  "Conjure Spectral Allies": 278,
  "Convey Inner Peace": 278,
  "Crown of Thorns": 278,
  "Damaging Intel": 278,
  "Deadly Salvo": 279,
  "Divine Retribution": 279,
  Dreamwine: 280,
  "Emerald Eyes": 280,
  "Enchanted Bloom": 281,
  Eruption: 281,
  Feint: 282,
  "Fey Food": 282,
  "Fey-Touched Blade": 282,
  "Forced Reposition": 283,
  "Furious Wail": 283,
  "Fuse Armor": 284,
  Gale: 284,
  Glare: 284,
  "High Ground": 286,
  "Immolating Gibbet": 288,
  "Inexorable Summons": 288,
  "Instant Armored Vehicle": 289,
  "Invested Champion": 290,
  "Iron Gut": 290,
  "Jagged Forcelance": 291,
  "Jarring Growl": 291,
  Lance: 292,
  "Less Fool, I": 292,
  "Life Burst": 292,
  "Lightless Torch": 293,
  "Long Game": 293,
  "Magma Spray": 293,
  "Mantle of the Brave": 294,
  "Martyr's Rally": 294,
  "Mass Faerie Fire": 294,
  Misdirection: 296,
  Mud: 296,
  "Muted Foe": 296,
  "Never Surrender": 296,
  "Oathbound Implement": 297,
  Outmaneuver: 297,
  "Oversized Paws": 297,
  Pincer: 298,
  "Piper's Lure": 298,
  "Portal Jaunt": 298,
  "Portal Trap": 299,
  "Power Word Fling": 299,
  "Power Word Rend": 299,
  "Reaper's Knell": 300,
  "Rebounding Bolt": 300,
  "Repulsing Wall": 300,
  Retribution: 301,
  "Rockfall Ward": 301,
  "Sacrifice Pawn": 301,
  "Sacrificial Healing": 302,
  "Safe Transposition": 302,
  "Secret Blind": 302,
  "Shared Frenzy": 303,
  "Shocking Volley": 303,
  Sightburst: 303,
  Silvershout: 303,
  "Smelting Blast": 303,
  Sneer: 304,
  "Spiked Barricade": 304,
  Spite: 304,
  "Steam Gout": 304,
  "Stone Aegis": 305,
  "Stone Fetch": 305,
  "Sudden Slue": 306,
  "Sudden Stampede": 306,
  "Toadstool Ring": 307,
  "Toothless Beast": 307,
  "Trollish Charge": 308,
  "Vine Carpet": 308,
  "War Horn": 308,
  "Wild Hunt": 308,
};

export const TOME_OF_HEROES_MATERIALS: Readonly<Record<string, string>> = {
  "Armored Formation": "a miniature shield carved from wood",
  "Battle Mind": "a bit of spiderweb or a small crystal orb",
  "Beast Within": "fang from a lycanthrope",
  "Bolster Fortifications": "a piece of metal, stone, or wood",
  "Butterfly Effect": "a butterfly wing",
  "Clear the Board": "obsidian or ivory chess piece",
  "Conjure Construct": "a small metal figurine",
  "Conjure Spectral Allies": "a pinch of graveyard dirt",
  "Convey Inner Peace":
    "powdered gemstones worth at least 50 gp, which the spell consumes",
  "Crown of Thorns": "a piece of thorned vine",
  Dreamwine:
    "a bottle of elvish wine worth at least 25 gp, which the spell consumes",
  "Emerald Eyes": "emerald worth at least 25 gp",
  "Enchanted Bloom":
    "a rose cut within the past 24 hours and ritual oils worth 100 gp, which the spell consumes",
  "Fey Food": "a spoonful of honey",
  Gale: "a bit of driftwood",
  "Immolating Gibbet": "a small loop of burnt rope",
  "Instant Armored Vehicle":
    "a diamond, metal scraps, and screws worth a combined value of at least 1,000 gp, which the spell consumes",
  "Invested Champion": "a vial of holy water",
  "Iron Gut": "a bezoar",
  "Jagged Forcelance": "a strand of gold wire",
  "Magma Spray": "a pinch of sulfur or a piece of brimstone",
  Mud: "a dollop of mud",
  "Oversized Paws": "claw or talon from a bear or other large animal",
  "Piper's Lure": "a pipe or horn",
  "Portal Jaunt": "a small brass key",
  "Reaper's Knell": "a silver bell",
  "Rebounding Bolt": "a miniature arrow",
  "Repulsing Wall": "a snail shell",
  "Sacrificial Healing": "a silver knife",
  Silvershout: "ounce of silver powder",
  "Spiked Barricade": "a wooden toothpick",
  "Sudden Stampede": "a horseshoe",
  "Toadstool Ring": "a bit of dried mushroom",
  "War Horn": "metal horn worth at least 50 gp",
  "Wild Hunt":
    "a jeweled dagger worth at least 500 gp, which the spell consumes",
};

const HEADER_CORRECTIONS: Readonly<
  Record<string, Partial<Pick<Spell, "school" | "duration" | "concentration">>>
> = {
  Babble: { duration: "up to 1 hour" },
  "Fuse Armor": { school: "Abjuration" },
  Gale: { concentration: true, duration: "up to 1 hour" },
  Glare: { concentration: false, duration: "1 round" },
  "High Ground": { duration: "up to 10 minutes" },
  "Immolating Gibbet": { school: "Evocation" },
  "Iron Gut": { concentration: true },
  "Jagged Forcelance": {
    school: "Evocation",
    concentration: true,
    duration: "up to 1 minute",
  },
};

const ERRATA: Readonly<Record<string, { before: string; after: string }>> = {
  "Instant Armored Vehicle": {
    before:
      "The vehicle can take whatever form you want, but it has AC 18 and 100 hit points.",
    after:
      "The vehicle can take whatever form you want, but it has AC 18, 100 hit points, and a carrying capacity of 1,000 pounds.",
  },
  Outmaneuver: {
    before:
      "On a failed save, the creature's movement is reduced to 0, and you can move up to your speed toward the creature without provoking opportunity attacks. This spell doesn't interrupt your ally's opportunity attack, which happens before the effects of this spell.",
    after:
      "On a failed save, the creature’s movement is reduced to 0 until the end of its next turn, and you can move up to your speed toward the creature without provoking opportunity attacks. This spell doesn’t interrupt the triggering opportunity attack, which happens before the effects of this spell.",
  },
  Silvershout: {
    before:
      "You unleash a shout that coats all creatures in a 30'foot cone in silver dust. If a creature in that area is a shapeshifter, the dust covering it glows.",
    after:
      "You unleash a shout that coats all creatures in a 30-foot cone in silver dust until the dust is brushed off, washed away, or otherwise removed as an action. If a creature coated in dust is a shapechanger, the dust glows. For the purposes of this spell, “shapechanger” is any creature with the Change Shape bonus action or Shapechanger trait.",
  },
};

/** Apply book-specific header evidence and publisher errata without adding automation. */
export function reviewTomeOfHeroesSpell(spell: Spell): Spell | undefined {
  const sourcePage = TOME_OF_HEROES_SOURCE_PAGES[spell.name];
  if (spell.source !== "kobold-press-toh" || !sourcePage || spell.mechanics) {
    throw new Error("Unreviewed Tome of Heroes spell scope");
  }
  if (spell.name === "Deadly Salvo") return undefined;
  const classes = tomeOfHeroesClasses(spell.name);
  if (!classes.length)
    throw new Error(`Missing publisher class list for ${spell.name}`);
  const materials = TOME_OF_HEROES_MATERIALS[spell.name];
  if (materials && !spell.components.material) {
    throw new Error(`Material flag changed for ${spell.name}`);
  }
  let text = spell.text;
  const errata = ERRATA[spell.name];
  if (errata) {
    if (text.split(errata.before).length !== 2) {
      throw new Error(`Publisher errata anchor changed for ${spell.name}`);
    }
    text = text.replace(errata.before, errata.after);
  }
  const { edition: _edition, ...reference } = spell;
  return {
    ...reference,
    ...HEADER_CORRECTIONS[spell.name],
    sourcePage,
    components: { ...spell.components, ...(materials && { materials }) },
    classes,
    text,
  };
}

/** Reject changed API candidates before applying the reviewed source-specific corrections. */
export function prepareTomeOfHeroesSpells(content: string): Spell[] {
  if (
    createHash("sha256").update(content).digest("hex") !==
    TOME_OF_HEROES_CANDIDATE_SHA256
  ) {
    throw new Error(
      "Tome of Heroes input snapshot changed; renew its source review",
    );
  }
  const candidates: Spell[] = JSON.parse(content);
  if (
    candidates.length !== 91 ||
    new Set(candidates.map((spell) => spell.id)).size !== 91
  ) {
    throw new Error("Tome of Heroes candidate scope changed");
  }
  return candidates.flatMap((spell) => {
    const reviewed = reviewTomeOfHeroesSpell(spell);
    return reviewed ? [reviewed] : [];
  });
}
