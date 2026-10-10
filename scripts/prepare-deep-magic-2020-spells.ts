// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEEP_MAGIC_2020_CANDIDATE_SHA256,
  DEEP_MAGIC_2020_PDF_SHA256,
  DEEP_MAGIC_2020_RITUAL_HOLDS,
  prepareDeepMagic2020Spells,
} from "../src/compendium/deepMagic2020Review.ts";
import { validateSpellDataset } from "../src/compendium/validate.ts";
import { reviewDeepMagic2020Licensing } from "../src/compendium/deepMagic2020Licensing.ts";

const [input, destination = "output/deep-magic-2020-preparation", ...extra] =
  process.argv.slice(2);
if (!input || extra.length)
  throw new Error(
    "Usage: node scripts/prepare-deep-magic-2020-spells.ts <pinned-candidates.json> [output-directory]",
  );
const spells = prepareDeepMagic2020Spells(readFileSync(input, "utf8"));
const licensing = reviewDeepMagic2020Licensing(spells);
const validation = validateSpellDataset(spells);
if (validation.errors || validation.warns)
  throw new Error(
    `Deep Magic 2020 has ${validation.errors} errors and ${validation.warns} warnings`,
  );
const content = JSON.stringify(spells);
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "candidate-spells.json"), content);
writeFileSync(
  join(destination, "report.json"),
  JSON.stringify(
    {
      publishable: false,
      approvedCount: 0,
      referenceOnly: true,
      source: "kobold-press-deepm",
      sourcePdfSha256: DEEP_MAGIC_2020_PDF_SHA256,
      inputSha256: DEEP_MAGIC_2020_CANDIDATE_SHA256,
      candidateSha256: createHash("sha256").update(content).digest("hex"),
      inputCount: 515,
      keptCount: spells.length,
      licensing,
      classReview: {
        status: "reconciled-against-main-and-specialty-lists",
        mainListPhysicalPages: [7, 33],
        membershipCorrections: 44,
        affectedExistingCards: 38,
        restoredMissingLists: 75,
        spellingCorrections: 9,
        retainedMainListDifferences: {
          ocrAndSpecialtyLists: 15,
          mythosLearningContext: 18,
        },
        notice:
          "Class availability is reference metadata, not character-build automation. This review does not approve unreviewed effect text or publication.",
      },
      missingClassLists: spells
        .filter((spell) => !spell.classes?.length)
        .map((spell) => spell.name),
      omitted: [
        {
          name: "Anchoring Rope (Reaction)",
          reason:
            "Duplicate API card; retain both printed casting options on Anchoring Rope.",
        },
      ],
      withheld: DEEP_MAGIC_2020_RITUAL_HOLDS.map((name) => ({
        name,
        reason:
          "Pending clearance for custom Ritual Focus and group-spellcasting rules outside the 2020 spells-only grant.",
      })),
      publisherErrata: {
        url: "https://koboldpress.com/errata/",
        section: "Deep Magic (2020)",
        date: "2025-05-29",
        appliedSpells: [
          "Animated Scroll",
          "Memento Mori",
          "Torrent of Fire",
          "Thunder Bolt",
          "Shadow Hands",
          "Slither",
        ],
      },
      transformations: [
        "Restore Anchoring Rope's printed action/reaction casting time from physical page 37.",
        "Retain Blood Armor's casting prerequisite outside the material description from physical page 319.",
        "Apply six non-held spell corrections from the publisher's 2020-book errata.",
        "Restore 75 missing class lists from visually checked 2020 book entries.",
        "Preserve Encrypt / Decrypt's printed Alteration school from physical page 67.",
        "Restore 25 printed ranges, including Bloodshot’s 30 feet and 24 omitted area qualifiers, plus four printed durations.",
        "Restore Instant Snare's printed scaling above 2nd level from physical page 87.",
        "Remove API-only endings absent from the 2020 Hobble Mount and Mass Hobble Mount blocks.",
        "Remove API editorial notes from Drown and Freeze Blood.",
        "Omit Candle’s Insight’s non-mechanical setting-use paragraph from physical page 48.",
        "Restore printed Poison in Frenzied Bolt’s table and remove Hedren’s duplicated to your.",
        "Restore Bloodhound’s 3rd-level-or-higher scaling and Heart to Heart’s explicit one-of-you trigger.",
        "Restore Killing Fields’ printed damage wording and three separate rule subheads.",
        "Restore Conjure Spectral Dead’s printed 4th-level ghost or wight options in place of the API’s will-o’-wisp.",
        "Restore the printed Sorcerer class spelling on nine API cards.",
        "Reconcile 44 class memberships on 38 cards against main and specialty lists; preserve 33 explained main-list differences.",
        "Record 17 hash-pinned exception decisions under the accepted Open5e selection basis.",
        "Withhold 11 spells pending clearance of their custom Ritual Focus dependencies.",
        "Preserve all other reviewed spell fields; add no combat automation.",
      ],
      blockers: [
        ...(licensing.pendingExceptionCount
          ? [
              "Resolve new or changed named-reference and supporting-rule exceptions.",
            ]
          : []),
        "Changed snapshots require renewed source review; supporting systems remain external manual references.",
        "Export requires the separate hash-pinned reference approval; the console must ship the full OGL, verified 35-notice chain, OGC designation, and manual verdicts.",
      ],
      validation,
    },
    null,
    2,
  ),
);
console.log(
  `${spells.length} provisional cards; zero approved; ${validation.errors} errors and ${validation.warns} warnings → ${destination}`,
);
