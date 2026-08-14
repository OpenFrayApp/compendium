// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Emit "Brood & Bloom"'s spells — original OpenFray content — into the Spell schema JSON
 * the app ships in public/compendium/brood-and-bloom-spells.json.
 *
 *   node scripts/ingest-brood-and-bloom-spells.ts [out.json]
 *
 * Like the book's creatures there is no PDF and no prose parser: the spells are authored
 * directly (and type-checked by tsc) in ../src/compendium/brood-and-bloom-spells.ts. This
 * runner sorts them, runs the spell invariants, and refuses to write on any error, so a
 * bad edit can't reach the app. Original content, not OGL/CC-BY — see CREDITS.md.
 */

import { writeFileSync } from 'node:fs'
import { broodAndBloomSpells } from '../src/compendium/brood-and-bloom-spells.ts'
import { validateSpellDataset } from '../src/compendium/validate.ts'

const outPath = process.argv[2] ?? 'output/brood-and-bloom-spells.json'
const spells = [...broodAndBloomSpells].sort((a, b) => a.name.localeCompare(b.name))

const report = validateSpellDataset(spells)
console.log(`brood & bloom spells: ${report.count} spells — errors: ${report.errors}, warnings: ${report.warns}`)
for (const issue of report.issues) console.error(`  ${issue.severity}  ${issue.name}: ${issue.field} — ${issue.message}`)
if (report.errors) process.exit(1)

writeFileSync(outPath, JSON.stringify(spells, null, 0))
console.log(`mapped ${spells.length} Brood & Bloom spells → ${outPath}`)
