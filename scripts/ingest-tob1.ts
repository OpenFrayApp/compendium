// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map the Tome of Beasts (1st volume) blocks (from scripts/tob1.py) into our Creature
 * schema. ToB 1 is a 2014-format Kobold book, so it shares the ToB 2/3 mapper.
 *
 *   node scripts/ingest-tob1.ts <tob1-blocks.json> [out.json]
 *
 * Open Game Content from Tome of Beasts (Kobold Press, © 2016 Open Design), used under
 * the OGL 1.0a — see CREDITS.md for the full license text and Section 15 copyright chain.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { mapTob3, type Tob3Block } from '../src/compendium/tob3.ts'

const [inPath, outPath = 'output/tob1-creatures.json'] = process.argv.slice(2)
if (!inPath) {
  console.error('usage: node scripts/ingest-tob1.ts <tob1-blocks.json> [out.json]')
  process.exit(2)
}

const blocks: Tob3Block[] = JSON.parse(readFileSync(inPath, 'utf8'))
const creatures = blocks.map((b) => mapTob3(b, 'kobold-press-tob')).sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(outPath, JSON.stringify(creatures, null, 0))
console.log(`mapped ${creatures.length} ToB 1 creatures → ${outPath}`)
