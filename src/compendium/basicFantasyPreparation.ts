// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Creature } from "../schema/creature.ts";
import {
  basicFantasyReview,
  type BasicFantasyReview,
} from "./basicFantasyReview.ts";
import type {
  BasicFantasyEntry,
  BasicFantasyVariant,
} from "./basicFantasySource.ts";
import { normalizeCreatureName } from "./basicFantasySource.ts";

export const BASIC_FANTASY_HTML_SHA256 =
  "afc99d8fbf0dca8b27b659c05bc34a7b9d9a6d46df55e29d102bb5b0488b19e3";
export const BASIC_FANTASY_URL =
  "https://www.basicfantasy.org/srd/monstersAll.html";
export const BASIC_FANTASY_GITLAB_COMMIT =
  "4d2469efef15dc2d232ce150a7453fcbd1d48fea";
export const BASIC_FANTASY_GITLAB_CORE_SHA256 =
  "64fb92baa94d3de876357b50455297b339ca9dd3c3b216553a5941729a8a7aff";

export const basicFantasyCounterpartSnapshots = [
  {
    file: "brood-and-bloom-creatures.json",
    count: 67,
    sha256: "c4554c962f5bd0344450fdfd3730d71cdd15463e086d5edcaba8113e03331e8a",
  },
  {
    file: "creature-codex-creatures.json",
    count: 353,
    sha256: "b2bb1fa3e2c64f3566b1798663472cfd03218c66d5c49c4bb4b7d919e8ae83fe",
  },
  {
    file: "srd-2014-creatures.json",
    count: 334,
    sha256: "246cea4b6cfbc84f6c7c06ea3d32642ec80ceecf63a08fc28e4f108c5501317b",
  },
  {
    file: "srd-creatures.json",
    count: 330,
    sha256: "5ae9fc996bd1a0aa4252b14065a7e8cf80850b9c894722e119898c4775094f03",
  },
  {
    file: "tob1-creatures.json",
    count: 384,
    sha256: "62e0e69927cdd5751775e2b3ed1fd73d291ae3ce811fa912be797fbe12ebf5e7",
  },
  {
    file: "tob2-creatures.json",
    count: 389,
    sha256: "ff78ce8e157e5346eaad53ceef8ff5800db45c0960f3cd5fc56cd2c40aa6e936",
  },
  {
    file: "tob3-creatures.json",
    count: 395,
    sha256: "716b63a0907974eb3be70cd868446e03e4f430625acc5e5416b4e5631290708f",
  },
  {
    file: "waking-garden-creatures.json",
    count: 67,
    sha256: "efaef2f39c1f13a877fa3aee26c35082233da3d56b143580e0d459d74ccd24da",
  },
] as const;

export const basicFantasyContributors = [
  "Ray Allen",
  "William D. Smith, Jr.",
  "Nick Bogan",
  "Evan Moore",
  "Stuart Marshall",
  "Emiliano Marchetti",
  "Antonio Eleuteri",
  "Luigi Castellani",
  "Michael Hensley",
  "Nazim N. Karaca",
  "Arthur Reyes",
  "Todd Roe",
  "Jim Bobb",
  "R. Kevin Smoot",
  "Rachel Ghoul",
  "Tom Hoyt",
  "James Michael Spahn",
  "Matt Sluis",
  "Russ Westbrook",
  "Martin Serena",
  "Joe Ludlum",
  "Aaron G. Motta",
  "Gabe Fua",
];

export const basicFantasyAttribution = [
  "Based on Basic Fantasy Role-Playing Game, 4th Edition, Copyright © 2006–2023 Chris Gonnerman and contributors, https://www.basicfantasy.org/. Text is licensed under CC-BY-SA-4.0, https://creativecommons.org/licenses/by-sa/4.0/.",
  "Changes were made: new DnD 2024 stat blocks, challenge ratings, action economy, saving throws, damage, and duration rules. Art and source lore are excluded. The adapted creature content is licensed under CC-BY-SA-4.0. No endorsement is implied.",
  "Source HTML and license notice are also available from John Atom (jmhimara), https://jmhimara.github.io/bfrpg/, under CC-BY-SA-4.0. The user-supplied saved official HTML is the creature input.",
  'This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.',
];

/** Require one reviewed disposition per source column and an exact conversion roster. */
export function assertBasicFantasyCoverage(
  variants: BasicFantasyVariant[],
  creatures: Creature[],
  counterpartIds: Set<string>,
  reviews: readonly BasicFantasyReview[] = basicFantasyReview,
): void {
  const source = new Map(variants.map((variant) => [variant.key, variant]));
  if (source.size !== variants.length)
    throw new Error("Duplicate source variant keys");
  const reviewed = new Set<string>();
  const required = new Set<string>();
  for (const review of reviews) {
    if (reviewed.has(review.key))
      throw new Error(`Duplicate review: ${review.key}`);
    reviewed.add(review.key);
    if (source.get(review.key)?.name !== review.name)
      throw new Error(`Source variant changed or missing: ${review.key}`);
    if (review.status === "counterpart") {
      if (!review.counterpartIds?.length)
        throw new Error(`Missing counterpart evidence: ${review.key}`);
      for (const id of review.counterpartIds)
        if (
          !counterpartIds.has(id) &&
          !creatures.some((creature) => creature.id === id)
        )
          throw new Error(`Missing counterpart: ${id}`);
    } else if (review.status === "convert") {
      if (!review.creatureIds?.length)
        throw new Error(`Missing conversion: ${review.key}`);
      for (const id of review.creatureIds) {
        if (required.has(id))
          throw new Error(`Duplicate conversion mapping: ${id}`);
        required.add(id);
      }
    } else if (review.creatureIds?.length)
      throw new Error(
        `Excluded or overview block has a conversion: ${review.key}`,
      );
  }
  for (const key of source.keys())
    if (!reviewed.has(key))
      throw new Error(`Unreviewed source variant: ${key}`);
  const actual = new Set(creatures.map((creature) => creature.id));
  if (actual.size !== creatures.length)
    throw new Error("Duplicate creature IDs");
  for (const id of required)
    if (!actual.has(id)) throw new Error(`Missing authored creature: ${id}`);
  for (const id of actual)
    if (!required.has(id))
      throw new Error(`Unreviewed authored creature: ${id}`);
}

/** Enforce the reviewed library snapshots before trusting counterpart decisions. */
export function assertBasicFantasyCounterpartSnapshots(
  actual: { file: string; count: number; sha256: string }[],
): void {
  if (actual.length !== basicFantasyCounterpartSnapshots.length)
    throw new Error("Compendium roster changed; renew the counterpart audit");
  for (const expected of basicFantasyCounterpartSnapshots) {
    const found = actual.find((snapshot) => snapshot.file === expected.file);
    if (
      !found ||
      found.count !== expected.count ||
      found.sha256 !== expected.sha256
    )
      throw new Error(
        `Compendium snapshot changed: ${expected.file}; renew the counterpart audit`,
      );
  }
}

const legacyAliases: Record<string, string> = {
  "ant-giant-and-huge-large": "ant-giant",
  "basilisk-common-greater": "basilisk",
  "black-pudding-black-jelly": "black-pudding",
  "deceiver-panther-hydra": "displacer",
  "dragon-cloud": "dragon-gold",
  "dragon-desert-blue-dragon": "dragon-blue",
  "dragon-forest-green-dragon": "dragon-green",
  "dragon-ice-white-dragon": "dragon-white",
  "dragon-mountain-red-dragon": "dragon-red",
  "dragon-plains-yellow-dragon": "dragon-yellow",
  "dragon-sea-gray-dragon": "dragon-sea",
  "dragon-swamp-black-dragon": "dragon-black",
  "ghoul-and-ghast": "ghoul",
  "jelly-black-black-pudding": "black-pudding",
  "jelly-glass-gelatinous-cube": "gelatinous-cube",
  "jelly-gray-gray-ooze": "gray-ooze",
  "jelly-green-green-slime": "green-slime",
  "jelly-ochre": "ochre-jelly",
  "salamander-flame": "salamander",
  "salamander-frost": "salamander",
  "troll-and-trollwife": "troll",
  "cattle-including-aurochs-and-bison": "cattle",
};

/** Compare the saved HTML's displayed stat rows with the older GitLab core, preserving differences. */
export function compareBasicFantasyLegacy(
  entries: BasicFantasyEntry[],
  files: Record<string, string>,
) {
  const used = new Set<string>();
  const sections = entries.map((entry) => {
    const slug =
      entry.heading === "Owlbear"
        ? "owlbear"
        : (legacyAliases[entry.anchor] ?? entry.anchor);
    const legacy = files[`${slug}.rst`];
    if (!legacy)
      return {
        anchor: entry.anchor,
        heading: entry.heading,
        status: "html-only" as const,
      };
    used.add(`${slug}.rst`);
    const rows = legacy
      .split("\n")
      .filter((line) => line.startsWith("|"))
      .map((line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim()),
      );
    const ghast =
      entry.anchor === "ghoul-and-ghast" ? files["ghast.rst"] : undefined;
    if (ghast) {
      used.add("ghast.rst");
      const ghastRows = ghast
        .split("\n")
        .filter((line) => line.startsWith("|"))
        .map((line) =>
          line
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim()),
        );
      for (const row of rows)
        row.push(
          ...(ghastRows
            .find(
              (other) =>
                normalizeCreatureName(other[0]) ===
                normalizeCreatureName(row[0]),
            )
            ?.slice(1) ?? []),
        );
    }
    const sourceTable = entry.tables.find((table) =>
      table.some((row) => row[0]?.startsWith("Armor Class:")),
    );
    const differences = (sourceTable ?? [])
      .filter((row) => row[0])
      .flatMap((row) => {
        const before =
          rows
            .find(
              (previous) =>
                normalizeCreatureName(previous[0]) ===
                normalizeCreatureName(row[0]),
            )
            ?.slice(1) ?? [];
        const after = row.slice(1);
        return JSON.stringify(before.map(normalizeCreatureName)) ===
          JSON.stringify(after.map(normalizeCreatureName))
          ? []
          : [{ field: row[0], before, after }];
      });
    return {
      anchor: entry.anchor,
      heading: entry.heading,
      legacyFile: `${slug}.rst`,
      status: differences.length
        ? ("stat-rows-differ" as const)
        : ("stat-rows-match" as const),
      differences,
    };
  });
  return {
    commit: BASIC_FANTASY_GITLAB_COMMIT,
    scope: "bestiary/bfrpg/core",
    legacyEntries: Object.keys(files).length,
    htmlSections: entries.length,
    method:
      "Compare displayed stat rows by section aliases. This is a structural comparison, not a semantic or lore-equivalence claim.",
    sections,
    legacyOnly: Object.keys(files)
      .filter((file) => !used.has(file))
      .sort(),
  };
}
