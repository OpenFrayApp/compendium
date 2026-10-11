// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { readFileSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { resolve, relative, isAbsolute, join } from "node:path";
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";
import { reviewWarlockGrimoire } from "../src/compendium/warlockGrimoireReview.ts";
import { validateSpellDataset } from "../src/compendium/validate.ts";

/** Read a local RTF into memory without writing or publishing source copies. */
function readBook(file: string) {
  const rtf = readFileSync(file);
  const extraction = spawnSync(
    "textutil",
    ["-convert", "txt", "-stdout", resolve(file)],
    {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      timeout: 30_000,
    },
  );
  if (extraction.error || extraction.status !== 0)
    throw new Error("Local RTF conversion failed; macOS textutil is required");
  return { rtf, transcription: extraction.stdout };
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    "grimoire-2": { type: "string" },
    "grimoire-3": { type: "string" },
    output: { type: "string" },
  },
});
const [draftFile, rtfFile, legacyDirectory, ...extra] = positionals;
if (
  !draftFile ||
  !rtfFile ||
  extra.length ||
  (legacyDirectory && values.output)
)
  throw new Error(
    "Usage: review:warlock-grimoire -- <draft-json> <source-rtf> [--grimoire-2 <source-rtf>] [--grimoire-3 <source-rtf>] [--output <ignored-directory>]",
  );
const output = resolve(
  values.output ?? legacyDirectory ?? "output/warlock-grimoire-review",
);
const route = relative(resolve("output"), output);
if (route.startsWith("..") || isAbsolute(route))
  throw new Error("Review artifacts must remain inside ignored output/");
const drafts = readFileSync(draftFile, "utf8");
const first = readBook(rtfFile);
const second = values["grimoire-2"]
  ? readBook(values["grimoire-2"])
  : undefined;
const third = values["grimoire-3"] ? readBook(values["grimoire-3"]) : undefined;
const report = {
  ...reviewWarlockGrimoire(
    drafts,
    first.transcription,
    first.rtf,
    second,
    third,
  ),
  existingDraftValidation: validateSpellDataset(JSON.parse(drafts)),
};
mkdirSync(output, { recursive: true });
const artifact = join(output, "review.json");
writeFileSync(artifact, JSON.stringify(report, null, 2) + "\n", {
  mode: 0o600,
});
chmodSync(artifact, 0o600);
console.log(
  `${report.locatedCount} entries located; ${report.unresolved.length} unresolved; ${report.approvedCount} approved. Private review artifacts remain in ignored output/.`,
);
