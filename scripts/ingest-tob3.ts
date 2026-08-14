// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map the Tome of Beasts 3 blocks (from scripts/tob3.py) into our Creature schema.
 *
 *   node scripts/ingest-tob3.ts <tob3-blocks.json> [out.json]
 *
 * Open Game Content from Tome of Beasts 3 (Kobold Press), used under the OGL 1.0a —
 * see CREDITS.md for the full license text and Section 15 copyright chain.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { mapTob3, type Tob3Block } from '../src/compendium/tob3.ts'

const [inPath, outPath = 'output/tob3-creatures.json'] = process.argv.slice(2)
if (!inPath) {
  console.error('usage: node scripts/ingest-tob3.ts <tob3-blocks.json> [out.json]')
  process.exit(2)
}

const blocks: Tob3Block[] = JSON.parse(readFileSync(inPath, 'utf8'))
const creatures = blocks.map((b) => mapTob3(b)).sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(outPath, JSON.stringify(creatures, null, 0))
console.log(`mapped ${creatures.length} ToB 3 creatures → ${outPath}`)
