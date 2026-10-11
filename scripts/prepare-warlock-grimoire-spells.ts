// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mkdirSync, writeFileSync } from "node:fs";
import { WARLOCK_GRIMOIRE_SPELLS } from "../src/compendium/warlockGrimoireSpells.ts";
import { validateSpellDataset } from "../src/compendium/validate.ts";
import {
  WARLOCK_CONTENT_BOUNDARIES,
  WARLOCK_EXCLUDED_SPELLS,
} from "../src/compendium/warlockContentBoundaries.ts";

const selected = new Set<string>(
  WARLOCK_CONTENT_BOUNDARIES.filter((entry) => entry.status === "reviewed").map(
    (entry) => entry.id,
  ),
);
if (
  WARLOCK_GRIMOIRE_SPELLS.length !== selected.size ||
  new Set(WARLOCK_GRIMOIRE_SPELLS.map((spell) => spell.id)).size !==
    selected.size ||
  WARLOCK_GRIMOIRE_SPELLS.some(
    (spell) => !selected.has(spell.id) || spell.edition || spell.mechanics,
  )
)
  throw new Error("Warlock preparation scope changed");
const validation = validateSpellDataset(WARLOCK_GRIMOIRE_SPELLS);
if (
  validation.issues.some(
    (issue) =>
      issue.severity === "error" ||
      issue.id !== "kobold-press-wz:zymurgic-aura" ||
      issue.field !== "components" ||
      issue.message !== "material flag and material text disagree",
  )
)
  throw new Error("Unaccepted Warlock validation finding");
const root = "output/warlock-grimoire-preparation";
mkdirSync(root, { recursive: true });
writeFileSync(
  `${root}/candidate-spells.json`,
  JSON.stringify(WARLOCK_GRIMOIRE_SPELLS),
);
writeFileSync(
  `${root}/report.json`,
  JSON.stringify(
    {
      count: WARLOCK_GRIMOIRE_SPELLS.length,
      withheld: WARLOCK_CONTENT_BOUNDARIES.filter(
        (entry) => entry.status === "withheld",
      ).map((entry) => entry.id),
      excluded: WARLOCK_EXCLUDED_SPELLS,
      validation,
    },
    null,
    2,
  ),
);
console.log(
  `Prepared ${WARLOCK_GRIMOIRE_SPELLS.length} source-corrected Warlock references.`,
);
