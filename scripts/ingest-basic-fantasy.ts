// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Creature } from "../src/schema/creature.ts";
import {
  BASIC_FANTASY_BOOK,
  BASIC_FANTASY_SOURCE,
  basicFantasyCreatures,
} from "../src/compendium/basicFantasy.ts";
import {
  basicFantasyDesignNotes,
  basicFantasyCrReviewExceptions,
} from "../src/compendium/basicFantasyDesign.ts";
import { assertBasicFantasyCounterpartEditions } from "../src/compendium/basicFantasyCounterparts.ts";
import {
  BASIC_FANTASY_HTML_SHA256,
  BASIC_FANTASY_GITLAB_CORE_SHA256,
  BASIC_FANTASY_URL,
  basicFantasyAttribution,
  basicFantasyContributors,
  assertBasicFantasyCounterpartSnapshots,
  assertBasicFantasyCoverage,
  compareBasicFantasyLegacy,
} from "../src/compendium/basicFantasyPreparation.ts";
import { basicFantasyReview } from "../src/compendium/basicFantasyReview.ts";
import {
  basicFantasyVariants,
  extractBasicFantasy,
} from "../src/compendium/basicFantasySource.ts";
import { estimateCr } from "../src/compendium/crestimate.ts";
import { validateDataset } from "../src/compendium/validate.ts";

/** Hash exact input bytes so changed snapshots require renewed review. */
function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Emit the reviewed custom book and its source, counterpart, licensing, and balance evidence. */
function main(): void {
  const htmlPath =
    process.argv[2] ?? "output/basic-fantasy-preparation/source.html";
  const compendiumPath = process.argv[3] ?? "../console/public/compendium";
  const legacyPath = process.argv[4];
  const html = readFileSync(htmlPath);
  if (sha256(html) !== BASIC_FANTASY_HTML_SHA256)
    throw new Error(
      "Basic Fantasy HTML snapshot changed; renew the source review",
    );
  const entries = extractBasicFantasy(html.toString("utf8"));
  const variants = basicFantasyVariants(entries);
  const counterpartIds = new Set<string>();
  const existingCreatures: Creature[] = [];
  const snapshots = readdirSync(compendiumPath)
    .filter((file) => file.endsWith("-creatures.json"))
    .sort()
    .map((file) => {
      const bytes = readFileSync(join(compendiumPath, file));
      const creatures: Creature[] = JSON.parse(bytes.toString("utf8"));
      existingCreatures.push(...creatures);
      for (const creature of creatures) counterpartIds.add(creature.id);
      return { file, count: creatures.length, sha256: sha256(bytes) };
    });
  assertBasicFantasyCounterpartSnapshots(snapshots);
  assertBasicFantasyCoverage(variants, basicFantasyCreatures, counterpartIds);
  assertBasicFantasyCounterpartEditions(
    existingCreatures,
    basicFantasyCreatures,
  );
  const validation = validateDataset(basicFantasyCreatures);
  const acceptedInitiativeIds = new Set(
    basicFantasyCreatures
      .filter(
        (creature) =>
          creature.type === "dragon" && creature.legendaryResistance,
      )
      .map((creature) => creature.id),
  );
  const unexpectedIssues = validation.issues.filter(
    (issue) =>
      issue.severity === "error" ||
      issue.field !== "initiative" ||
      !acceptedInitiativeIds.has(issue.id),
  );
  if (unexpectedIssues.length)
    throw new Error(
      `Invalid Basic Fantasy dataset: ${JSON.stringify(unexpectedIssues)}`,
    );
  const estimates = basicFantasyCreatures.map((creature) => {
    const estimate = estimateCr(creature);
    return {
      id: creature.id,
      name: creature.name,
      listed: creature.cr,
      ...estimate,
      delta: estimate.estimated - creature.cr!,
    };
  });
  const flagged = estimates.filter((estimate) => Math.abs(estimate.delta) >= 2);
  const unreviewed = flagged.filter(
    (estimate) => !basicFantasyCrReviewExceptions[estimate.id],
  );
  if (unreviewed.length)
    throw new Error(`CR review required: ${JSON.stringify(unreviewed)}`);
  const legacyFiles = legacyPath
    ? Object.fromEntries(
        readdirSync(legacyPath)
          .filter((file) => file.endsWith(".rst"))
          .sort()
          .map((file) => [file, readFileSync(join(legacyPath, file), "utf8")]),
      )
    : undefined;
  if (
    legacyFiles &&
    sha256(Buffer.from(JSON.stringify(legacyFiles))) !==
      BASIC_FANTASY_GITLAB_CORE_SHA256
  )
    throw new Error(
      "GitLab core snapshot changed; renew the legacy comparison",
    );
  const counts = Object.fromEntries(
    ["counterpart", "convert", "overview", "excluded"].map((status) => [
      status,
      basicFantasyReview.filter((review) => review.status === status).length,
    ]),
  );
  const out = "output/basic-fantasy-preparation";
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "source.html"), html);
  writeFileSync(join(out, "entries.json"), JSON.stringify(entries, null, 2));
  writeFileSync(
    "output/basic-fantasy-creatures.json",
    JSON.stringify(basicFantasyCreatures, null, 2),
  );
  writeFileSync(
    join(out, "report.json"),
    JSON.stringify(
      {
        book: BASIC_FANTASY_BOOK,
        source: BASIC_FANTASY_SOURCE,
        rulesEdition: "5.5",
        originalSystem: "Basic Fantasy Role-Playing Game, 4th Edition",
        sourceUrl: BASIC_FANTASY_URL,
        sourceSha256: BASIC_FANTASY_HTML_SHA256,
        sections: entries.length,
        statBlocks: variants.filter(
          (variant) => Object.keys(variant.stats).length,
        ).length,
        counts,
        creatures: basicFantasyCreatures.length,
        counterpartSnapshots: snapshots,
        reviews: basicFantasyReview,
        contentLicense: "CC-BY-SA-4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        licenseEvidenceUrl: "https://jmhimara.github.io/bfrpg/",
        attribution: basicFantasyAttribution,
        contributors: basicFantasyContributors,
        validation,
        acceptedWarningRationale:
          "Adult and older dragons intentionally use Dex + PB initiative from the installed dnd-create-monster skill. The generic validator prefers Dex + 2 PB.",
        crEstimates: estimates,
        reviewedCrDiscrepancies: flagged.map((estimate) => ({
          ...estimate,
          rationale: basicFantasyCrReviewExceptions[estimate.id],
        })),
        reviewMethod:
          "Source-led per-creature review against saved fourth-edition tables and prose; SRD 5.2 balance checks using dnd-create-monster. Math validation is not source-fidelity approval or playtesting.",
        designNotes: basicFantasyDesignNotes,
        ...(legacyFiles
          ? {
              legacyComparison: compareBasicFantasyLegacy(entries, legacyFiles),
            }
          : {}),
        publishable: false,
        publicationBlockers: [
          "Register the book and source in the console and site before publication.",
          "Add CC-BY-SA attribution, changes notice, and ShareAlike terms to console CREDITS.md and in-app credits.",
          "Confirm the official preface notice for the saved HTML; the accessible mirror supplies the current licensing evidence.",
          "The three reserved-IP-risk source columns are permanently excluded from this collection at the user’s request.",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    `${BASIC_FANTASY_BOOK}: ${variants.length} reviewed entries; ${counts.counterpart} counterparts; ${counts.convert} conversions → ${basicFantasyCreatures.length} creatures; ${counts.excluded} excluded; ${counts.overview} overviews`,
  );
  console.log(
    `Validation: ${validation.errors} errors, ${validation.warns} documented initiative warnings; ${flagged.length} explicitly reviewed CR-estimator discrepancies; ${unreviewed.length} unreviewed discrepancies. Publication pending.`,
  );
  console.log(
    "Wrote output/basic-fantasy-creatures.json and output/basic-fantasy-preparation/report.json",
  );
}

main();
