// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map the structured SRD 5.2 blocks (from scripts/extract-srd52-pdf.py) into our
 * Creature schema and write the compendium JSON.
 *
 *   node scripts/ingest-srd52.ts <structured.json> [out.json] [spells.json]
 *
 * Pass the spells JSON (e.g. the app's srd-spells.json) to hover-link cast spell
 * names in the prose. Sourced from WotC's official SRD 5.2 PDF under CC-BY-4.0.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { makeSpellLinker } from '../src/compendium/spelllinker.ts'
import { mapSrd52, type Srd52Block } from '../src/compendium/srd52.ts'

const [inPath, outPath = 'output/srd-creatures.json', spellsPath] = process.argv.slice(2)
if (!inPath) {
  console.error('usage: node scripts/ingest-srd52.ts <structured.json> [out.json] [spells.json]')
  process.exit(2)
}

const opts: { linkSpells?: (t: string) => string } = {}
if (spellsPath) {
  const spells: { name: string; id: string }[] = JSON.parse(readFileSync(spellsPath, 'utf8'))
  opts.linkSpells = makeSpellLinker(spells.map((s) => ({ name: s.name, ref: s.id })))
}

const blocks: Srd52Block[] = JSON.parse(readFileSync(inPath, 'utf8'))
const creatures = blocks.map((b) => mapSrd52(b, opts))
writeFileSync(outPath, JSON.stringify(creatures, null, 0))
console.log(`mapped ${creatures.length} creatures → ${outPath}${spellsPath ? ' (spells linked)' : ''}`)
