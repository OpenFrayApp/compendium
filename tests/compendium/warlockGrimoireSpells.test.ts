// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from "vitest";
import { WARLOCK_GRIMOIRE_SPELLS } from "../../src/compendium/warlockGrimoireSpells.ts";
import {
  WARLOCK_CONTENT_BOUNDARIES,
  WARLOCK_EXCLUDED_SPELLS,
} from "../../src/compendium/warlockContentBoundaries.ts";
import {
  approveReferenceSpells,
  referenceSpellApprovalsFor,
} from "../../src/compendium/referenceSpellPublication.ts";
import {
  validateSpellDataset,
  validateSpell,
} from "../../src/compendium/validate.ts";

/** Find one source-corrected Warlock reference. */
function card(key: string) {
  return WARLOCK_GRIMOIRE_SPELLS.find(
    (spell) => spell.id === `kobold-press-wz:${key}`,
  )!;
}

describe("Warlock source-corrected reference cards", () => {
  it("publishes exactly the 35 reviewed IDs without mechanics, invented classes, or excluded entries", () => {
    const selected = WARLOCK_CONTENT_BOUNDARIES.filter(
      (entry) => entry.status === "reviewed",
    )
      .map((entry) => entry.id)
      .sort();
    expect(WARLOCK_GRIMOIRE_SPELLS.map((spell) => spell.id).sort()).toEqual(
      selected,
    );
    for (const spell of WARLOCK_GRIMOIRE_SPELLS) {
      expect(spell.source).toBe("kobold-press-wz");
      expect(spell.edition).toBeUndefined();
      expect(spell.mechanics).toBeUndefined();
      expect(spell.classes ?? []).not.toContain("Sorceror");
      expect(
        WARLOCK_EXCLUDED_SPELLS.some((entry) => entry.id === spell.id),
      ).toBe(false);
    }
    expect(
      WARLOCK_GRIMOIRE_SPELLS.filter((spell) => !spell.classes),
    ).toHaveLength(12);
  });

  it("pins the approved preparation snapshot and only accepts the source-unspecified material warning", () => {
    const content = JSON.stringify(WARLOCK_GRIMOIRE_SPELLS);
    const approval = referenceSpellApprovalsFor("kobold-press-wz")[0];
    expect(approveReferenceSpells(content, approval)).toHaveLength(35);
    expect(approval.acceptedWarningIds).toEqual([
      "kobold-press-wz:zymurgic-aura",
    ]);
    const validation = validateSpellDataset(WARLOCK_GRIMOIRE_SPELLS);
    expect(
      validation.issues.filter((issue) => issue.severity === "error"),
    ).toEqual([]);
    expect(validation.issues).toMatchObject([
      {
        id: "kobold-press-wz:zymurgic-aura",
        field: "components",
        severity: "warn",
      },
    ]);
    expect(card("zymurgic-aura").components).toMatchObject({ material: true });
    expect(card("zymurgic-aura").components.materials).toBeUndefined();
  });

  it("uses the supplied Liminal Magic rules rather than the materially different drafts", () => {
    expect(card("bardo").text).toMatch(/Intelligence saving throw/);
    expect(card("bardo").text).toMatch(/cleric or a paladin/);
    expect(card("hypnic-jerk").text).toContain("2d6 force damage");
    expect(card("hypnic-jerk").text).not.toContain("drops one object");
    expect(card("hypnagogia").text).toMatch(/paralyzed/);
    expect(card("hypnagogia").text).toContain("| d4 | Effect |");
    expect(card("hypnagogia").concentration).toBe(false);
    expect(card("mind-maze")).toMatchObject({
      school: "Enchantment",
      concentration: true,
    });
    expect(card("subliminal-aversion")).toMatchObject({ school: "Abjuration" });
    expect(card("subliminal-aversion").text).toContain("disadvantage");
    expect(card("subliminal-aversion").text).not.toContain("within 5 feet");
  });

  it("retains exceptional saves, durations, ley-line dependencies, and supporting references in prose", () => {
    expect(card("remove-insulation").text).toContain("Fortitude");
    expect(card("suppress-regeneration").text).toContain("Fortitude");
    expect(card("eternal-echo")).toMatchObject({
      concentration: true,
      duration: "special",
    });
    expect(card("storm-of-axes")).toMatchObject({
      concentration: true,
      duration: "special (+ 1 round)",
    });
    expect(card("vengeful-panopy-of-the-ley-line-ignited").text).toContain(
      "ley line",
    );
    expect(card("rise-of-the-green").text).toContain("treant");
    expect(card("march-of-the-dead").text).toContain("construct creatures");
    expect(card("march-of-the-dead").text).toContain("24 hours");
  });

  it("excludes reserved descriptors without changing mechanical requirements", () => {
    for (const spell of WARLOCK_GRIMOIRE_SPELLS)
      expect(spell.text).not.toMatch(
        /Evermaw|Stross Library|Wasted West|Bemmea|Vitreous Mire|Plains of Bone|Voidlike|from the Void/,
      );
    expect(card("door-of-the-far-traveler").castingTime).toContain(
      "1 hour of attunement",
    );
    expect(card("vengeful-panopy-of-the-ley-line-ignited").name).toContain(
      "Panoply",
    );
  });

  it("accepts explicit Special concentration duration but still rejects a fixed or repeated duration", () => {
    for (const duration of ["special", "special (+ 1 round)"])
      expect(
        validateSpell({ ...card("eternal-echo"), duration }).filter(
          (issue) => issue.severity === "error",
        ),
      ).toEqual([]);
    for (const duration of [
      "1 round",
      "Concentration, up to 1 minute",
      "special unknown",
    ])
      expect(
        validateSpell({ ...card("eternal-echo"), duration }).some(
          (issue) => issue.field === "duration" && issue.severity === "error",
        ),
      ).toBe(true);
  });
});
