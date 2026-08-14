// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Emit "On Strong Waters and Potent Simples"'s spells — original OpenFray content — into
 * the Spell schema JSON the app ships in public/compendium/strong-waters-spells.json.
 *
 *   node scripts/ingest-strong-waters-spells.ts [out.json]
 *
 * Like Brood & Bloom there is no PDF and no prose parser: the spells are authored
 * directly (and type-checked by tsc) in ../src/compendium/strong-waters-spells.ts. This
 * runner sorts them, runs the spell invariants, and refuses to write on any error, so a
 * bad edit can't reach the app. Original content, not OGL/CC-BY — see CREDITS.md.
 */

import { writeFileSync } from 'node:fs'
import { strongWatersSpells } from '../src/compendium/strong-waters-spells.ts'
import { validateSpellDataset } from '../src/compendium/validate.ts'

const outPath = process.argv[2] ?? 'output/strong-waters-spells.json'
const spells = [...strongWatersSpells].sort((a, b) => a.name.localeCompare(b.name))

const report = validateSpellDataset(spells)
console.log(`strong waters spells: ${report.count} spells — errors: ${report.errors}, warnings: ${report.warns}`)
for (const issue of report.issues) console.error(`  ${issue.severity}  ${issue.name}: ${issue.field} — ${issue.message}`)
if (report.errors) process.exit(1)

writeFileSync(outPath, JSON.stringify(spells, null, 0))
console.log(`mapped ${spells.length} Strong Waters spells → ${outPath}`)
