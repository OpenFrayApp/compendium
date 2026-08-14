// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Emit "The Waking Garden" library — original OpenFray creatures — into the Creature
 * schema JSON the app ships in public/compendium/waking-garden-creatures.json.
 *
 *   node scripts/ingest-waking-garden.ts [out.json]
 *
 * Like Brood & Bloom there is no PDF and no prose parser: the creatures are authored
 * directly (and type-checked by tsc) in ../src/compendium/waking-garden.ts. This runner
 * sorts them, runs the shared invariant validator, and refuses to write on any error, so
 * a bad edit can't reach the app. Original content, not OGL/CC-BY — see CREDITS.md.
 */

import { writeFileSync } from 'node:fs'
import { validateDataset } from '../src/compendium/validate.ts'
import { wakingGardenCreatures } from '../src/compendium/waking-garden.ts'

const outPath = process.argv[2] ?? 'output/waking-garden-creatures.json'
const creatures = [...wakingGardenCreatures].sort((a, b) => a.name.localeCompare(b.name))

const report = validateDataset(creatures)
console.log(`waking garden: ${report.count} creatures — errors: ${report.errors}, warnings: ${report.warns}`)
if (report.errors) {
  for (const [field, n] of Object.entries(report.errorsByField).sort((a, b) => b[1] - a[1]))
    console.error(`  ${String(n).padStart(4)}  ${field}`)
  process.exit(1)
}

writeFileSync(outPath, JSON.stringify(creatures, null, 0))
console.log(`mapped ${creatures.length} Waking Garden creatures → ${outPath}`)
