// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  prepareTomeOfHeroesSpells,
  TOME_OF_HEROES_CANDIDATE_SHA256,
  TOME_OF_HEROES_PDF_SHA256,
} from "../src/compendium/tomeOfHeroesReview.ts";
import { validateSpellDataset } from "../src/compendium/validate.ts";

const [input, destination = "output/tome-of-heroes-preparation", ...extra] =
  process.argv.slice(2);
if (!input || extra.length) {
  throw new Error(
    "Usage: npm run prepare:tome-of-heroes-spells -- <reviewed-open5e-candidates.json> [output-directory]",
  );
}
const spells = prepareTomeOfHeroesSpells(readFileSync(input, "utf8"));
const validation = validateSpellDataset(spells);
if (validation.errors || validation.warns) {
  throw new Error(
    `Tome of Heroes has ${validation.errors} errors and ${validation.warns} warnings`,
  );
}
const content = JSON.stringify(spells);
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "candidate-spells.json"), content);
writeFileSync(
  join(destination, "report.json"),
  JSON.stringify(
    {
      publishable: false,
      referenceOnly: true,
      source: "kobold-press-toh",
      sourcePdfSha256: TOME_OF_HEROES_PDF_SHA256,
      inputSha256: TOME_OF_HEROES_CANDIDATE_SHA256,
      candidateSha256: createHash("sha256").update(content).digest("hex"),
      keptCount: spells.length,
      withheld: [
        {
          name: "Deadly Salvo",
          reason: "Depends on excluded gunpowder weapon rules",
        },
      ],
      licenseEvidence: {
        declarationPage: 3,
        completeOglPage: 320,
        license: "OGL-1.0a",
      },
      errataUrl: "https://koboldpress.com/errata/#tome-of-heroes",
      errataDate: "2025-05-29",
      transformations: [
        "Restore 35 material descriptions from the book's spell headers.",
        "Correct source-backed schools, durations, and concentration flags.",
        "Apply publisher errata; preserve already-correct Conjure Construct scaling.",
        "Check class lists against pages 270–272; normalize Sorceror and restore Immolating Gibbet's Sorcerer assignment.",
        "Retain book page references and source-specific IDs; omit all rollable mechanics.",
        "Preserve printed ambiguities in Immolating Gibbet, Less Fool, I, and Secret Blind.",
      ],
      blockers: [
        "Renew hash-pinned reference approval and integrate console registration, credits, and coverage tests before publication.",
      ],
      validation,
    },
    null,
    2,
  ),
);
console.log(
  `${spells.length} reference candidates; Deadly Salvo withheld; zero validation findings → ${destination}`,
);
