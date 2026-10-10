// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  approveReferenceSpells,
  referenceSpellApprovalsFor,
} from "../src/compendium/referenceSpellPublication.ts";

const [destination, flag, source, ...extra] = process.argv.slice(2);
if (
  !destination ||
  extra.length ||
  (flag !== undefined && (flag !== "--source" || !source))
)
  throw new Error(
    "Usage: npm run export:reference-spells -- <console-public-compendium-directory> [--source <approved-source>]",
  );
// Check every library before exporting any of them, so a stale snapshot cannot partially ship.
const approved = referenceSpellApprovalsFor(source).map((approval) => {
  const content = readFileSync(
    join("output", approval.preparation, "candidate-spells.json"),
    "utf8",
  );
  const spells = approveReferenceSpells(content, approval);
  return { approval, content: JSON.stringify(spells) };
});
mkdirSync(destination, { recursive: true });
for (const { approval, content } of approved) {
  writeFileSync(join(destination, approval.file), content);
  console.log(
    `Exported ${approval.count} reference-only spells: ${approval.file}`,
  );
}
