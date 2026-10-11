// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Ingest SRD 5.1 (D&D 2014) from the 5e-bits API (dnd5eapi.co) once, transform into
 * our schema, and write static JSON to output/. Run: `npm run ingest:srd-2014`.
 *
 * A separate, occasional pipeline from the SRD 5.2 PDF ingest — dnd5eapi.co exposes
 * structured monster spellcasting (slots + spells-by-level), which the slot-casting
 * model needs. SRD 5.1 is dual-licensed; we use it under CC-BY-4.0 and never the OGL
 * (see docs/content-licensing.md). The app never calls the API live.
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  mapDndApiMonster,
  mapDndApiSpell,
  type DndApiMonster,
  type DndApiSpell
} from '../src/compendium/dnd5eapi.ts'

import { emitValidatedDataset } from '../src/compendium/datasetEmission.ts'
import { validateDataset, validateSpellDataset } from '../src/compendium/validate.ts'
import { reportSrdValidation } from './lib/srdValidation.ts'

const BASE = 'https://www.dnd5eapi.co/api/2014'

/** GET a JSON resource (relative paths resolve against dnd5eapi.co); non-OK responses throw. */
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url.startsWith('http') ? url : `https://www.dnd5eapi.co${url}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

/** Fetch every item in a collection: pull the index list, then each detail in
 *  bounded-concurrency batches (the API is one request per resource). */
async function fetchAll(endpoint: string): Promise<any[]> {
  const list = await fetchJson(`${BASE}/${endpoint}`)
  const urls: string[] = list.results.map((r: { url: string }) => r.url)
  const out: any[] = []
  const BATCH = 12
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = await Promise.all(urls.slice(i, i + BATCH).map((u) => fetchJson(u)))
    out.push(...batch)
    process.stdout.write(`\r  ${endpoint}: ${out.length}/${urls.length}`)
  }
  process.stdout.write('\n')
  return out
}

/** Map every entry and report all unexpected omissions with their API identity. */
function mapAll<R extends { name: string; index: string }, T>(
  items: R[],
  fn: (r: R) => T,
  label: string
): { records: T[]; errors: number } {
  const ok: T[] = []
  let errors = 0
  for (const item of items) {
    try {
      ok.push(fn(item))
    } catch (e) {
      errors += 1
      console.error(`  ! ${label}: ${item?.name} [${item?.index}]: ${String(e)}`)
    }
  }
  console.log(`  ${label}: mapped ${ok.length}/${items.length} (${errors} errors)`)
  return { records: ok, errors }
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../output')

console.log('Fetching SRD 5.1 spells…')
const spells = mapAll((await fetchAll('spells')) as DndApiSpell[], mapDndApiSpell, 'spells')

console.log('Fetching SRD 5.1 monsters…')
const creatures = mapAll(
  (await fetchAll('monsters')) as DndApiMonster[],
  mapDndApiMonster,
  'monsters'
)

if (spells.errors || creatures.errors) {
  console.error('SRD 2014 mapping failed; no datasets replaced.')
  process.exit(1)
}
const spellReport = validateSpellDataset(spells.records)
const creatureReport = validateDataset(creatures.records)
if (spellReport.errors || creatureReport.errors) {
  reportSrdValidation('spells', spellReport)
  reportSrdValidation('creatures', creatureReport)
  console.error('SRD 2014 validation failed; no datasets replaced.')
  process.exit(1)
}

// Both datasets must pass before the first emitter can replace a destination.
emitValidatedDataset(creatures.records, resolve(outDir, 'srd-2014-creatures.json'), {
  validate: () => creatureReport,
  report: (report) => reportSrdValidation('creatures', report)
})
emitValidatedDataset(spells.records, resolve(outDir, 'srd-2014-spells.json'), {
  validate: () => spellReport,
  report: (report) => reportSrdValidation('spells', report)
})

console.log(
  `\nDone: ${creatures.records.length} creatures, ${spells.records.length} spells → output/`
)
console.log('Source: dnd5eapi.co (SRD 5.1, used under CC-BY-4.0). Fill CREDITS.md 5.1 attribution.')
