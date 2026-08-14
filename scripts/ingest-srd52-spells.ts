// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map the structured SRD 5.2.1 spell blocks (from
 * scripts/extract-srd52-spells-pdf.py) into our Spell schema and write the
 * compendium JSON.
 *
 *   node scripts/ingest-srd52-spells.ts <spell-blocks.json> [out.json]
 *
 * Sourced from WotC's official SRD 5.2.1 PDF under CC-BY-4.0.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { mapSrd52Spell, type Srd52SpellBlock } from '../src/compendium/srd52spells.ts'

const [inPath, outPath = 'output/srd-spells.json'] = process.argv.slice(2)
if (!inPath) {
  console.error('usage: node scripts/ingest-srd52-spells.ts <spell-blocks.json> [out.json]')
  process.exit(2)
}

const blocks: Srd52SpellBlock[] = JSON.parse(readFileSync(inPath, 'utf8'))
const spells = blocks.map(mapSrd52Spell).sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(outPath, JSON.stringify(spells, null, 0))
console.log(`mapped ${spells.length} spells → ${outPath}`)
