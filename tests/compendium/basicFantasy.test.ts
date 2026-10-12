// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { basicFantasyCreatures } from "../../src/compendium/basicFantasy.ts";
import {
  basicFantasyDesignNotes,
  basicFantasyCrReviewExceptions,
} from "../../src/compendium/basicFantasyDesign.ts";
import { assertBasicFantasyCounterpartEditions } from "../../src/compendium/basicFantasyCounterparts.ts";
import {
  assertBasicFantasyCounterpartSnapshots,
  assertBasicFantasyCoverage,
  basicFantasyCounterpartSnapshots,
  compareBasicFantasyLegacy,
} from "../../src/compendium/basicFantasyPreparation.ts";
import { basicFantasyReview } from "../../src/compendium/basicFantasyReview.ts";
import {
  basicFantasyVariants,
  extractBasicFantasy,
  normalizeCreatureName,
} from "../../src/compendium/basicFantasySource.ts";
import {
  estimateCr,
  multiattackDamage,
} from "../../src/compendium/crestimate.ts";
import {
  abilityMod,
  proficiencyBonus,
  validateDataset,
} from "../../src/compendium/validate.ts";

const table = `<table><tr><th></th><th>Ant, Giant</th><th>Ant, Huge</th><th>Ant, Large</th></tr>
<tr><td>Armor Class:</td><td>17</td><td>15</td><td>13</td></tr>
<tr><td>Hit Dice:</td><td>4</td><td>2</td><td>1</td></tr>
<tr><td>Damage:</td><td>2d6</td><td>1d10</td><td>1d6</td></tr></table>`;

/** Find an authored creature while failing clearly if a reviewed variant disappears. */
function creature(slug: string) {
  const found = basicFantasyCreatures.find(
    (candidate) => candidate.id === `basic-fantasy-adaptations:${slug}`,
  );
  if (!found) throw new Error(`Missing fixture creature ${slug}`);
  return found;
}

/** Supply an in-memory source roster and counterpart set for coverage mutation tests. */
function coverageInput() {
  return {
    variants: basicFantasyReview.map((review) => ({
      key: review.key,
      anchor: review.anchor,
      name: review.name,
      stats: {},
    })),
    counterparts: new Set(
      basicFantasyReview.flatMap((review) => review.counterpartIds ?? []),
    ),
  };
}

describe("Basic Fantasy source extraction", () => {
  it("retains all stat columns even when filter tags omit variants", () => {
    const entries = extractBasicFantasy(
      `<div class="monster" data-tag="Ant, Giant"><section><h2 data-anchor-id="ant">Ants<a class="anchorjs-link">icon</a></h2>${table}<p>Legitimate text.</p><script>Unsafe text</script></section></div>`,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].heading).toBe("Ants");
    expect(entries[0].paragraphs).toEqual(["Legitimate text."]);
    expect(
      basicFantasyVariants(entries).map((variant) => [
        variant.key,
        variant.name,
        variant.stats["Hit Dice:"],
      ]),
    ).toEqual([
      ["ant:1", "Ant, Giant", "4"],
      ["ant:2", "Ant, Huge", "2"],
      ["ant:3", "Ant, Large", "1"],
    ]);
  });

  it("keeps a parent overview separate from nested creature tables and paragraphs", () => {
    const entries = extractBasicFantasy(
      `<section data-tag="Overview" id="overview"><h2>Overview</h2><p>Shared rule.</p><section data-tag="Ant" id="ant"><h3>Ants</h3>${table}<p>Local rule.</p></section></section>`,
    );
    expect(entries[0].tables).toEqual([]);
    expect(entries[0].paragraphs).toEqual(["Shared rule."]);
    expect(entries[1].paragraphs).toEqual(["Local rule."]);
    expect(basicFantasyVariants(entries)[0].key).toBe("overview:overview");
  });

  it("corrects misleading elemental labels using their source headings", () => {
    const html = ["cold", "wood"]
      .map(
        (kind) =>
          `<section data-tag="Staff Elemental, Water" id="elemental-${kind}"><h2>Elemental, ${kind}</h2><table><tr><th></th><th>Staff Elemental, Earth</th></tr><tr><td>Armor Class:</td><td>16</td></tr></table></section>`,
      )
      .join("");
    expect(
      basicFantasyVariants(extractBasicFantasy(html)).map(
        (variant) => variant.name,
      ),
    ).toEqual(["Staff Elemental, Cold", "Staff Elemental, Wood"]);
  });

  it("disambiguates the Owlbear section with the duplicated ostrich anchor", () => {
    const html = ["Owlbear", "Ostrich"]
      .map(
        (name) =>
          `<section data-tag="${name}" id="ostrich-and-emu"><h2>${name}</h2><table><tr><th></th><th>${name}</th></tr><tr><td>Armor Class:</td><td>13</td></tr></table></section>`,
      )
      .join("");
    expect(
      basicFantasyVariants(extractBasicFantasy(html)).map(
        (variant) => variant.key,
      ),
    ).toEqual(["owlbear:1", "ostrich-and-emu:1"]);
  });

  it("uses table labels to distinguish duplicated Lizard Man filter tags", () => {
    const entries = extractBasicFantasy(
      `<section data-tag="Common Lizard Man" data-tag2="Common Lizard Man" id="lizard-man"><h2>Lizard Man</h2><table><tr><th></th><th>Common Lizard Man</th><th>Subterranean Lizard Man</th></tr><tr><td>Armor Class:</td><td>15</td><td>16</td></tr></table></section>`,
    );
    expect(
      basicFantasyVariants(entries).map((variant) => variant.name),
    ).toEqual(["Common Lizard Man", "Subterranean Lizard Man"]);
  });

  it("does not normalize away distinct size labels", () => {
    expect(normalizeCreatureName("Ant, Huge*")).toBe("ant huge");
    expect(normalizeCreatureName("Ant, Large")).not.toBe(
      normalizeCreatureName("Ant, Huge"),
    );
  });

  it("reports changed legacy stat rows and additional HTML-only sections", () => {
    const entries = extractBasicFantasy(
      `<section data-tag="Ant" id="ant-giant-and-huge-large"><h2>Ants</h2>${table}</section><section data-tag="New" id="new"><h2>New</h2></section>`,
    );
    const comparison = compareBasicFantasyLegacy(entries, {
      "ant-giant.rst":
        "| Armor Class: | 17 |\n| Hit Dice: | 4 |\n| Damage: | 2d6 |",
      "old.rst": "Old section",
    });
    expect(comparison.sections[0].status).toBe("stat-rows-differ");
    expect(comparison.sections[1].status).toBe("html-only");
    expect(comparison.legacyOnly).toEqual(["old.rst"]);
  });
});

describe("Basic Fantasy counterpart audit", () => {
  it("covers each source variant with an explicit disposition", () => {
    expect(basicFantasyReview).toHaveLength(260);
    expect(new Set(basicFantasyReview.map((review) => review.key)).size).toBe(
      260,
    );
    expect(
      Object.fromEntries(
        ["counterpart", "convert", "excluded", "overview"].map((status) => [
          status,
          basicFantasyReview.filter((review) => review.status === status)
            .length,
        ]),
      ),
    ).toEqual({ counterpart: 148, convert: 101, excluded: 3, overview: 8 });
    const { variants, counterparts } = coverageInput();
    expect(() =>
      assertBasicFantasyCoverage(variants, basicFantasyCreatures, counterparts),
    ).not.toThrow();
  });

  it("requires every existing counterpart ID to resolve", () => {
    const { variants, counterparts } = coverageInput();
    counterparts.delete("srd-5.2:basilisk");
    expect(() =>
      assertBasicFantasyCoverage(variants, basicFantasyCreatures, counterparts),
    ).toThrow("Missing counterpart");
  });

  it("refuses unknown, missing, or duplicate source variants", () => {
    const { variants, counterparts } = coverageInput();
    expect(() =>
      assertBasicFantasyCoverage(
        [
          ...variants,
          { key: "unknown:1", anchor: "unknown", name: "Unknown", stats: {} },
        ],
        basicFantasyCreatures,
        counterparts,
      ),
    ).toThrow("Unreviewed source variant");
    expect(() =>
      assertBasicFantasyCoverage(
        variants.slice(1),
        basicFantasyCreatures,
        counterparts,
      ),
    ).toThrow("changed or missing");
    expect(() =>
      assertBasicFantasyCoverage(
        [...variants, variants[0]],
        basicFantasyCreatures,
        counterparts,
      ),
    ).toThrow("Duplicate source variant");
  });

  it("refuses omitted or unreviewed authored creatures", () => {
    const { variants, counterparts } = coverageInput();
    expect(() =>
      assertBasicFantasyCoverage(
        variants,
        basicFantasyCreatures.slice(1),
        counterparts,
      ),
    ).toThrow("Missing authored creature");
    expect(() =>
      assertBasicFantasyCoverage(
        variants,
        [
          ...basicFantasyCreatures,
          { ...basicFantasyCreatures[0], id: "extra:creature" },
        ],
        counterparts,
      ),
    ).toThrow("Unreviewed authored creature");
  });

  it("refuses a changed HTML snapshot before emitting any files", () => {
    const directory = mkdtempSync(join(tmpdir(), "basic-fantasy-test-"));
    try {
      const source = join(directory, "changed.html");
      writeFileSync(source, "<html>Changed input</html>");
      const result = spawnSync(
        process.execPath,
        [
          fileURLToPath(
            new URL("../../scripts/ingest-basic-fantasy.ts", import.meta.url),
          ),
          source,
        ],
        { cwd: directory, encoding: "utf8" },
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("HTML snapshot changed");
      expect(existsSync(join(directory, "output"))).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("requires renewed review after any compendium snapshot changes", () => {
    const snapshots = basicFantasyCounterpartSnapshots.map((snapshot) => ({
      ...snapshot,
    }));
    expect(() =>
      assertBasicFantasyCounterpartSnapshots(snapshots),
    ).not.toThrow();
    expect(() =>
      assertBasicFantasyCounterpartSnapshots(snapshots.slice(1)),
    ).toThrow("roster changed");
    expect(() =>
      assertBasicFantasyCounterpartSnapshots([
        ...snapshots,
        { file: "extra-creatures.json", count: 1, sha256: "new" },
      ]),
    ).toThrow("roster changed");
    expect(() =>
      assertBasicFantasyCounterpartSnapshots(
        snapshots.map((snapshot, index) =>
          index === 0 ? { ...snapshot, sha256: "changed" } : snapshot,
        ),
      ),
    ).toThrow("snapshot changed");
  });

  it("exports none of the excluded creatures or overview entries", () => {
    expect(
      basicFantasyReview
        .filter((review) => review.status === "excluded")
        .map((review) => review.name),
    ).toEqual(["Common Deceiver", "Greater Deceiver", "Tentacle Worm"]);
    expect(
      basicFantasyReview
        .filter((review) => ["excluded", "overview"].includes(review.status))
        .every((review) => !review.creatureIds),
    ).toBe(true);
    expect(
      basicFantasyCreatures.some((candidate) =>
        /deceiver|tentacle worm|displacer|carrion crawler/i.test(
          candidate.name,
        ),
      ),
    ).toBe(false);
  });
});

describe("Basic Fantasy source-led 2024 revision", () => {
  it("requires 2024 counterpart evidence, including authored source aliases", () => {
    const existing = basicFantasyReview
      .flatMap((review) => review.counterpartIds ?? [])
      .map((id) => ({ ...creature("cattle"), id }));
    expect(() =>
      assertBasicFantasyCounterpartEditions(existing, basicFantasyCreatures),
    ).not.toThrow();
    const obsolete = existing.map((c) =>
      c.id === "srd-5.2:lion" ? { ...c, edition: "5.0" as const } : c,
    );
    expect(() =>
      assertBasicFantasyCounterpartEditions(obsolete, basicFantasyCreatures),
    ).toThrow("2014-only counterpart");
    expect(
      basicFantasyReview.find((r) => r.key === "mountain-lion:1")!
        .counterpartIds,
    ).toEqual(["srd-5.2:lion"]);
    expect(
      basicFantasyReview.find((r) => r.key === "strangle-vine:1")!
        .counterpartIds,
    ).toEqual([creature("assassin-vine").id]);
    expect(
      basicFantasyReview
        .filter((r) => r.status === "counterpart")
        .every((r) =>
          r.counterpartIds!.every(
            (id) =>
              id.startsWith("srd-5.2:") ||
              id.startsWith("basic-fantasy-adaptations:"),
          ),
        ),
    ).toBe(true);
  });

  it("restores 2014-only species and distinguishes gecko, tuatara, and monitors", () => {
    for (const slug of [
      "ant-giant",
      "bee-giant",
      "bee-giant-queen",
      "beetle-giant-bombardier",
      "assassin-vine",
      "giant-mountain",
      "golem-bone",
      "golem-bronze",
      "golem-wood",
      "leech-giant",
      "common-lizard-man",
      "orc",
      "rock-baboon",
      "caveman",
    ])
      expect(creature(slug).edition).toBe("5.5");
    expect(
      creature("lizard-giant-gecko").traits!.find(
        (t) => t.name === "Spider Climb",
      )!.text,
    ).toContain("ceilings");
    expect(creature("lizard-giant-tuatara").resistances).toContain("Cold");
    expect(multiattackDamage(creature("lizard-giant-tuatara"))).toBe(12);
    expect(creature("large-monitor-lizard").actions![0].text).toContain(
      "at the start of each minute",
    );
    expect(creature("huge-monitor-lizard").actions![0].text).toContain(
      "at the start of each of its turns",
    );
    expect(
      creature("giant-monitor-lizard").traits!.find(
        (t) => t.name === "Upright Sprint",
      ),
    ).toBeDefined();
  });

  it("preserves all seven dragon ages and their distinct attack routines", () => {
    expect(
      basicFantasyCreatures.filter((c) => c.type === "dragon"),
    ).toHaveLength(21);
    for (const species of ["cloud", "plains", "sea"]) {
      const wyrmling = creature(`${species}-dragon-wyrmling`);
      expect(wyrmling.actions!.some((a) => a.name.includes("Breath"))).toBe(
        false,
      );
      const adult = creature(`adult-${species}-dragon`);
      expect(adult.legendaryActions!.actions).toHaveLength(3);
      expect(
        adult.legendaryActions!.actions.some((a) => a.name === "Pounce"),
      ).toBe(false);
      expect(adult.actions!.some((a) => a.name === "Rend")).toBe(false);
      expect(adult.actions!.some((a) => a.name === "Tail")).toBe(
        species !== "sea",
      );
      expect(adult.actions![0].text).toContain(
        "two Claw attacks and one Bite attack",
      );
    }
    expect(
      creature("juvenile-cloud-dragon").actions!.some(
        (a) => a.id === "lightning-breath",
      ),
    ).toBe(false);
    expect(
      creature("adult-cloud-dragon").actions!.some(
        (a) => a.id === "lightning-breath",
      ),
    ).toBe(true);
  });

  it("keeps source attachment, invisible detection, recovery, and spell-age constraints", () => {
    expect(creature("jelly-green").actions![0].damage).toBeUndefined();
    expect(
      creature("jelly-green").traits!.find(
        (t) => t.name === "Sunlight Destruction",
      )!.text,
    ).not.toContain("1 minute");
    expect(creature("golem-amber").senses.truesight).toBeUndefined();
    expect(
      creature("golem-amber").traits!.some(
        (t) => t.name === "See Invisibility",
      ),
    ).toBe(true);
    expect(
      creature("cave-locust-giant").actions!.find(
        (a) => a.name === "Foul Spit",
      )!.recharge,
    ).toBeUndefined();
    const spellsFor = (id: string) =>
      creature(id).spellcasting!.groups.flatMap((g) =>
        g.spells.map((s) => s.name),
      );
    expect(spellsFor("adult-plains-dragon")).not.toContain("Mirror Image");
    expect(spellsFor("mature-plains-dragon")).toContain("Mirror Image");
    expect(spellsFor("ancient-cloud-dragon")).toContain("Disintegrate");
    for (const c of basicFantasyCreatures) {
      const ids = [
        ...(c.actions ?? []),
        ...(c.legendaryActions?.actions ?? []),
        ...(c.reactions ?? []),
      ].map((a) => a.id);
      expect(new Set(ids).size, c.name).toBe(ids.length);
    }
  });

  it("removes invented swallowing and restores the sperm whale sound beam", () => {
    for (const slug of ["fish-giant-catfish", "whale-sperm"])
      expect(creature(slug).actions!.some((a) => /swallow/i.test(a.name))).toBe(
        false,
      );
    const whale = creature("whale-sperm");
    expect(whale.actions!.find((a) => a.name === "Bite")!.damage).toEqual([
      { formula: "3d20", type: "piercing" },
    ]);
    expect(whale.actions!.find((a) => a.name === "Sonic Beam")!.text).toContain(
      "Stunned",
    );
    expect(whale.actions!.some((a) => a.name === "Multiattack")).toBe(false);
    expect(creature("fish-giant-catfish").actions![0].text).toContain(
      "different creature",
    );
  });

  it("restores source attack counts and alternatives instead of generic Rend", () => {
    expect(
      creature("dinosaur-deinonychus").actions!.map((a) => a.name),
    ).toEqual(["Bite"]);
    expect(creature("golem-amber").actions![0].text).toContain(
      "two Claw attacks and one Bite",
    );
    expect(
      creature("living-statue-stone").actions!.find(
        (a) => a.name === "Lava Spray",
      )!.recharge,
    ).toBeUndefined();
    expect(creature("squid-giant-male").actions![0].text).toContain(
      "8 Tentacle",
    );
    expect(multiattackDamage(creature("squid-giant-male"))).toBe(25.5);
    expect(creature("hangman-tree").speed.walk).toBe(0);
    expect(creature("hangman-tree").actions![0].text).toContain(
      "maximum of four",
    );
    expect(creature("water-termite-giant").actions!.map((a) => a.name)).toEqual(
      ["Noxious Spray", "Eat Hull"],
    );
    expect(creature("water-termite-giant").actions![0].text).toContain(
      "Stunned",
    );
    expect(
      creature("lizard-giant-horned-chameleon").actions!.find(
        (a) => a.name === "Tongue",
      )!.text,
    ).not.toContain("at the start of each");
    expect(
      creature("lizard-giant-horned-chameleon").actions!.find(
        (a) => a.name === "Bite",
      )!.text,
    ).toContain("automatically hits");
    expect(
      creature("rhagodessa-giant").actions!.find(
        (a) => a.name === "Adhesive Leg",
      )!.text,
    ).not.toContain("deals 9");
    expect(
      creature("rhagodessa-giant").actions!.find((a) => a.name === "Bite")!
        .text,
    ).toContain("automatically hits");
    expect(creature("giant-cyclops").name).toBe("Cyclop");
    expect(
      creature("giant-cyclops").actions!.some((a) => a.name === "Multiattack"),
    ).toBe(false);
  });

  it("restores persistent pixie invisibility, group nixie charm, and urgoblin regeneration", () => {
    const pixie = creature("pixie");
    expect(
      pixie.actions!.find((a) => a.name === "Invisibility")!.text,
    ).not.toMatch(/attack roll|deals damage/);
    expect(pixie.spellcasting).toBeUndefined();
    expect(
      creature("nixie").actions!.find((a) => a.id === "water-charm")!.text,
    ).toContain("nine other willing nixies");
    expect(
      creature("urgoblin").traits!.some((t) => t.name === "Regeneration"),
    ).toBe(true);
    expect(creature("urgoblin").traits!.some((t) => t.name === "Bully")).toBe(
      false,
    );
    expect(creature("living-statue-crystal").vulnerabilities).toBeUndefined();
    for (const slug of ["zombraire", "skeletaire"])
      expect(
        creature(slug).actions!.some((a) => a.name === "Arcane Bolt"),
      ).toBe(false);
  });
});

describe("Basic Fantasy authored stat blocks", () => {
  it("emits a sorted, typed 2024 dataset with valid math", () => {
    expect(basicFantasyCreatures).toHaveLength(120);
    expect(
      basicFantasyCreatures.every(
        (candidate) =>
          candidate.edition === "5.5" &&
          candidate.source === "basic-fantasy-adaptations",
      ),
    ).toBe(true);
    expect(basicFantasyCreatures.map((candidate) => candidate.name)).toEqual(
      basicFantasyCreatures
        .map((candidate) => candidate.name)
        .sort((a, b) => a.localeCompare(b)),
    );
    const report = validateDataset(basicFantasyCreatures);
    expect(report.errors).toBe(0);
    expect(report.warns).toBe(12);
    expect(
      report.issues.every(
        (issue) =>
          issue.field === "initiative" &&
          /^(Adult|Mature|Elder|Ancient) (Cloud|Plains|Sea) Dragon$/.test(
            issue.name,
          ),
      ),
    ).toBe(true);
  });

  it("preserves source bovine attack alternatives in the 2024 review sample", () => {
    for (const [slug, ac, hpFormula, cr] of [
      ["cattle", 14, "2d10+2", 0.25],
      ["aurochs", 16, "3d10+6", 0.5],
      ["bison", 16, "4d10+8", 0.5],
    ] as const) {
      const c = creature(slug);
      expect(c.edition).toBe("5.5");
      expect(c.ac).toBe(ac);
      expect(c.hpFormula).toBe(hpFormula);
      expect(c.cr).toBe(cr);
      expect(c.speed.walk).toBe(50);
      expect(c.actions!.map((action) => action.name)).toEqual([
        "Headbutt",
        "Trample",
      ]);
      expect(c.actions!.map((action) => action.damage)).toEqual([
        [{ formula: "1d4", type: "bludgeoning" }],
        [{ formula: "2d4", type: "bludgeoning" }],
      ]);
      for (const action of c.actions!) {
        expect(action.toHit).toBe(
          proficiencyBonus(c.cr!) + abilityMod(c.abilities.str),
        );
        expect(action.text).toContain("Melee Attack Roll:");
        expect(action.text).not.toMatch(/Prone|20 feet|20\+/);
      }
      expect(multiattackDamage(c)).toBe(5);
    }
  });

  it("preserves the explicit smaller ant, monitor, roc, and squid variants", () => {
    expect([creature("ant-large").size, creature("ant-huge").size]).toEqual([
      "Small",
      "Medium",
    ]);
    expect([
      creature("large-monitor-lizard").size,
      creature("huge-monitor-lizard").size,
    ]).toEqual(["Medium", "Large"]);
    expect([creature("normal-roc").size, creature("large-roc").size]).toEqual([
      "Large",
      "Huge",
    ]);
    expect([
      creature("squid-giant-male").size,
      creature("squid-giant-female").size,
    ]).toEqual(["Huge", "Gargantuan"]);
  });

  it("keeps repeat saves and counterplay in petrification, charm, dance, and swallowing", () => {
    expect(creature("basilisk-greater").bonusActions![0].text).toContain(
      "if it is still Restrained this way",
    );
    expect(
      creature("nixie").actions!.find((action) => action.id === "water-charm")!
        .text,
    ).toContain("repeats the save");
    expect(creature("spider-giant-tarantula").actions![0].text).toContain(
      "repeats the save",
    );
    for (const slug of ["caecilia-giant", "fish-giant-bass"]) {
      const text = creature(slug).actions!.find(
        (action) => action.id === "bite",
      )!.text;
      expect(text).toContain("no other creature swallowed");
      expect(text).toContain("regurgitates");
      expect(text).toContain("dies");
    }
  });

  it("uses 2024 daily spell groups, single-cost legendary actions, and skill-default initiative", () => {
    for (const candidate of basicFantasyCreatures) {
      expect(candidate.lairActions).toBeUndefined();
      expect(
        candidate.spellcasting?.groups.every(
          (group) => group.usage.type !== "slots",
        ) ?? true,
      ).toBe(true);
      for (const action of candidate.legendaryActions?.actions ?? [])
        expect(action.legendaryCost).toBeUndefined();
      if (candidate.legendaryResistance)
        expect(candidate.initiative).toBe(
          abilityMod(candidate.abilities.dex) + proficiencyBonus(candidate.cr!),
        );
    }
    const cloud = creature("adult-cloud-dragon");
    expect(
      cloud.actions!.find((action) => action.id === "lightning-breath")!
        .recharge,
    ).toEqual({ type: "perDay", value: 2 });
  });

  it("keeps conditional advantages and ongoing damage in prose", () => {
    const piranha = creature("fish-giant-piranha");
    expect(
      piranha.traits!.find((trait) => trait.name === "Blood Scent")!.text,
    ).toContain("don't have all their Hit Points");
    expect(piranha.actions![0].toHit).toBe(4);
    expect(
      creature("barkling").traits!.find(
        (trait) => trait.name === "Pack Tactics",
      ),
    ).toBeUndefined();
    expect(creature("rot-grub").actions![0].text).toContain(
      "Lesser Restoration",
    );
    expect(creature("yellow-mold").reactions![0].recharge).toEqual({
      type: "perDay",
      value: 1,
    });
  });

  it("has design intent and no unreviewed large CR-estimate discrepancies", () => {
    expect(basicFantasyDesignNotes).toHaveLength(120);
    expect(
      basicFantasyDesignNotes.every(
        (note) =>
          note.comparables.length >= 2 && note.signature && note.rationale,
      ),
    ).toBe(true);
    expect(
      basicFantasyCreatures.filter(
        (candidate) =>
          Math.abs(estimateCr(candidate).estimated - candidate.cr!) >= 2 &&
          !basicFantasyCrReviewExceptions[candidate.id],
      ),
    ).toEqual([]);
    expect(
      creature("spider-giant-tarantula").actions!.find(
        (a) => a.name === "Bite",
      )!.damage,
    ).toEqual([{ formula: "1d8", type: "piercing" }]);
  });
});
