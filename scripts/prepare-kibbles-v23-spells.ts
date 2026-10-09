// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  prepareKibblesV23Spells,
  type KibblesV23Snapshot,
} from "../src/compendium/kibblesV23Spells.ts";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const [input, ...extra] = args.filter((arg) => arg !== "--strict");
if (
  !input ||
  extra.length ||
  args.some((arg) => arg.startsWith("--") && arg !== "--strict")
) {
  throw new Error(
    "Usage: npm run prepare:kibbles-v23-spells -- <snapshot.json> [--strict]",
  );
}
const snapshot: KibblesV23Snapshot = JSON.parse(readFileSync(input, "utf8"));
const { spells, report } = prepareKibblesV23Spells(snapshot);
const root = "output/kibbles-casting-v23-preparation";
mkdirSync(root, { recursive: true });
writeFileSync(`${root}/snapshot.json`, JSON.stringify(snapshot, null, 2));
writeFileSync(`${root}/candidate-spells.json`, JSON.stringify(spells));
writeFileSync(`${root}/report.json`, JSON.stringify(report, null, 2));
console.log(
  `Kibbles v2.3: ${spells.length}/${report.rawCount} provisional spells; ${report.withheld.length} withheld; ${report.validation.errors} errors, ${report.validation.warns} warnings → ${root}`,
);
console.log(
  "Full v2.3 source processed, including psionics and blood magic. Elemental-Touched is not imported; publishing remains blocked.",
);
if (strict && !report.publishable) process.exitCode = 1;
