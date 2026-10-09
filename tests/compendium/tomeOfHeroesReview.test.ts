// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from "vitest";
import type { Spell } from "../../src/schema/spell.ts";
import {
  prepareTomeOfHeroesSpells,
  reviewTomeOfHeroesSpell,
  TOME_OF_HEROES_MATERIALS,
  TOME_OF_HEROES_SOURCE_PAGES,
} from "../../src/compendium/tomeOfHeroesReview.ts";

/** Build a source-specific fixture without importing ignored source datasets. */
function spell(name: string, changes: Partial<Spell> = {}): Spell {
  return {
    id: `kobold-press-toh:${name.toLowerCase().replaceAll(" ", "-")}`,
    source: "kobold-press-toh",
    edition: "5.0",
    name,
    level: 3,
    school: "Transmutation",
    castingTime: "action",
    range: "60 feet",
    duration: "instantaneous",
    concentration: false,
    ritual: false,
    components: {
      verbal: true,
      somatic: true,
      material: Boolean(TOME_OF_HEROES_MATERIALS[name]),
    },
    classes: ["Sorceror", "Wizard"],
    text: "You create an effect.",
    ...changes,
  };
}

describe("Tome of Heroes source review", () => {
  it("pins source coverage and restores source-backed schools, durations, and concentration", () => {
    expect(Object.keys(TOME_OF_HEROES_SOURCE_PAGES)).toHaveLength(91);
    expect(Object.keys(TOME_OF_HEROES_MATERIALS)).toHaveLength(35);
    const input = spell("Jagged Forcelance");
    expect(reviewTomeOfHeroesSpell(input)).toMatchObject({
      id: input.id,
      sourcePage: 291,
      school: "Evocation",
      concentration: true,
      duration: "up to 1 minute",
      classes: ["Bard", "Sorcerer", "Warlock", "Wizard"],
      components: { materials: "a strand of gold wire" },
    });
    expect(reviewTomeOfHeroesSpell(input)).not.toHaveProperty("edition");
    expect(reviewTomeOfHeroesSpell(input)).not.toHaveProperty("mechanics");
    expect(input.school).toBe("Transmutation");
    expect(input.components.materials).toBeUndefined();
    expect(reviewTomeOfHeroesSpell(spell("Iron Gut"))?.concentration).toBe(
      true,
    );
    expect(reviewTomeOfHeroesSpell(spell("Gale"))).toMatchObject({
      concentration: true,
      duration: "up to 1 hour",
    });
    expect(reviewTomeOfHeroesSpell(spell("Babble"))?.duration).toBe(
      "up to 1 hour",
    );
    expect(reviewTomeOfHeroesSpell(spell("High Ground"))?.duration).toBe(
      "up to 10 minutes",
    );
    expect(reviewTomeOfHeroesSpell(spell("Fuse Armor"))?.school).toBe(
      "Abjuration",
    );
  });

  it("withholds the excluded-rule dependency and rejects foreign or rollable cards", () => {
    expect(reviewTomeOfHeroesSpell(spell("Deadly Salvo"))).toBeUndefined();
    expect(() =>
      reviewTomeOfHeroesSpell(spell("Jagged Forcelance", { source: "srd" })),
    ).toThrow("scope");
    expect(() => reviewTomeOfHeroesSpell(spell("Unknown Spell"))).toThrow(
      "scope",
    );
    expect(() =>
      reviewTomeOfHeroesSpell(
        spell("Jagged Forcelance", { mechanics: { attackRoll: true } }),
      ),
    ).toThrow("scope");
    expect(() =>
      reviewTomeOfHeroesSpell(
        spell("Jagged Forcelance", {
          components: { verbal: true, somatic: true, material: false },
        }),
      ),
    ).toThrow("Material flag changed");
    expect(() => prepareTomeOfHeroesSpells("[]")).toThrow("snapshot changed");
  });

  it("applies the publisher's duration erratum without retaining the old concentration flag", () => {
    expect(
      reviewTomeOfHeroesSpell(
        spell("Glare", { concentration: true, duration: "up to 1 minute" }),
      ),
    ).toMatchObject({ duration: "1 round", concentration: false });
  });

  it("adds the errata carrying capacity while preserving the remaining vehicle rules", () => {
    const text =
      "You transform materials. The vehicle can take whatever form you want, but it has AC 18 and 100 hit points. It can hold four creatures.";
    const reviewed = reviewTomeOfHeroesSpell(
      spell("Instant Armored Vehicle", { text }),
    );
    expect(reviewed?.text).toContain("a carrying capacity of 1,000 pounds");
    expect(reviewed?.text).toContain("It can hold four creatures.");
    expect(reviewed?.components.materials).toContain(
      "1,000 gp, which the spell consumes",
    );
  });

  it("applies opportunity-attack and shapechanger errata with exact anchor checks", () => {
    const outmaneuver =
      "On a failed save, the creature's movement is reduced to 0, and you can move up to your speed toward the creature without provoking opportunity attacks. This spell doesn't interrupt your ally's opportunity attack, which happens before the effects of this spell.";
    expect(
      reviewTomeOfHeroesSpell(spell("Outmaneuver", { text: outmaneuver }))
        ?.text,
    ).toContain("until the end of its next turn");
    const silvershout =
      "You unleash a shout that coats all creatures in a 30'foot cone in silver dust. If a creature in that area is a shapeshifter, the dust covering it glows. In addition, each creature must make a saving throw.";
    const reviewed = reviewTomeOfHeroesSpell(
      spell("Silvershout", { text: silvershout }),
    );
    expect(reviewed?.text).toContain(
      "Change Shape bonus action or Shapechanger trait",
    );
    expect(reviewed?.text).toContain(
      "In addition, each creature must make a saving throw.",
    );
    expect(() =>
      reviewTomeOfHeroesSpell(
        spell("Outmaneuver", { text: "Changed wording" }),
      ),
    ).toThrow("errata anchor changed");
    expect(() =>
      reviewTomeOfHeroesSpell(
        spell("Outmaneuver", { text: `${outmaneuver} ${outmaneuver}` }),
      ),
    ).toThrow("errata anchor changed");
  });

  it("preserves printed ambiguities and conditional advantage as unmodeled prose", () => {
    const text =
      "The creature is pulled up to 60 into the air and has advantage under a condition.";
    const reviewed = reviewTomeOfHeroesSpell(
      spell("Immolating Gibbet", { text }),
    );
    expect(reviewed?.text).toBe(text);
    expect(reviewed?.classes).toEqual([
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard",
    ]);
    expect(reviewed).not.toHaveProperty("mechanics");
  });
});
