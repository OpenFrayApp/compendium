// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  approveReferenceSpells,
  REFERENCE_SPELL_APPROVALS,
} from "../src/compendium/referenceSpellPublication.ts";

const destination = process.argv[2];
if (!destination)
  throw new Error(
    "Usage: npm run export:reference-spells -- <console-public-compendium-directory>",
  );
// Check every library before exporting any of them, so a stale snapshot cannot partially ship.
const approved = REFERENCE_SPELL_APPROVALS.map((approval) => {
  const content = readFileSync(
    join("output", approval.preparation, "candidate-spells.json"),
    "utf8",
  );
  approveReferenceSpells(content, approval);
  return { approval, content };
});
mkdirSync(destination, { recursive: true });
for (const { approval, content } of approved) {
  writeFileSync(join(destination, approval.file), content);
  console.log(
    `Exported ${approval.count} reference-only spells: ${approval.file}`,
  );
}
