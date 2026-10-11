// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, relative, isAbsolute, join } from "node:path";
import { spawnSync } from "node:child_process";
import { reviewWarlockGrimoire } from "../src/compendium/warlockGrimoireReview.ts";
import { validateSpellDataset } from "../src/compendium/validate.ts";

const [
  draftFile,
  rtfFile,
  directory = "output/warlock-grimoire-review",
  ...extra
] = process.argv.slice(2);
if (!draftFile || !rtfFile || extra.length)
  throw new Error(
    "Usage: review:warlock-grimoire -- <draft-json> <source-rtf> [ignored-output-directory]",
  );
const output = resolve(directory);
const route = relative(resolve("output"), output);
if (route.startsWith("..") || isAbsolute(route))
  throw new Error("Review artifacts must remain inside ignored output/");
const drafts = readFileSync(draftFile, "utf8");
const rtf = readFileSync(rtfFile);
const extraction = spawnSync(
  "textutil",
  ["-convert", "txt", "-stdout", resolve(rtfFile)],
  {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout: 30_000,
  },
);
if (extraction.error || extraction.status !== 0)
  throw new Error("Local RTF conversion failed; macOS textutil is required");
const report = {
  ...reviewWarlockGrimoire(drafts, extraction.stdout, rtf),
  existingDraftValidation: validateSpellDataset(JSON.parse(drafts)),
};
mkdirSync(output, { recursive: true });
writeFileSync(
  join(output, "review.json"),
  JSON.stringify(report, null, 2) + "\n",
  { mode: 0o600 },
);
console.log(
  `${report.locatedCount} entries located; ${report.unresolved.length} unresolved; ${report.approvedCount} approved. Private review artifacts remain in ignored output/.`,
);
