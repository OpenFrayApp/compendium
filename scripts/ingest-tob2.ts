// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map the Tome of Beasts 2 blocks (from scripts/tob2.py) into our Creature schema.
 *
 *   node scripts/ingest-tob2.ts <tob2-blocks.json> [out.json]
 *
 * Open Game Content from Tome of Beasts 2 (Kobold Press), used under the OGL 1.0a —
 * see CREDITS.md for the full license text and Section 15 copyright chain. Shares the
 * 2014-format mapper with ToB 3 (map2014StatBlock), differing only in the source id.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { map2014StatBlock, type StatBlock2014 } from '../src/formats/statBlock2014.ts'

const [inPath, outPath = 'output/tob2-creatures.json'] = process.argv.slice(2)
if (!inPath) {
  console.error('usage: node scripts/ingest-tob2.ts <tob2-blocks.json> [out.json]')
  process.exit(2)
}

const blocks: StatBlock2014[] = JSON.parse(readFileSync(inPath, 'utf8'))
const creatures = blocks
  .map((b) => map2014StatBlock(b, 'kobold-press-tob2'))
  .sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(outPath, JSON.stringify(creatures, null, 0))
console.log(`mapped ${creatures.length} ToB 2 creatures → ${outPath}`)
