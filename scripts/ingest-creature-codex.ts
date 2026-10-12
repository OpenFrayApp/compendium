// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Open5eRecord } from '../src/compendium/open5eTypes.ts'

/**
 * Map Creature Codex (Kobold Press) into our Creature schema, from the Open5e v2 API.
 *
 *   node scripts/ingest-creature-codex.ts [out.json] [cached-open5e.json]
 *
 * Open Game Content used under the OGL 1.0a — see CREDITS.md for the full license text
 * and the Section 15 copyright chain. Open5e is the source because no text-layer copy
 * of the 2018 edition exists to extract and the 2024 revision is closed content; Open5e
 * republishes the OGC with the publisher and licence declared.
 *
 * Pass a cached response as the second argument to re-run without hitting the API.
 */

import { readFileSync } from 'node:fs'
import { emitValidatedDataset } from '../src/compendium/datasetEmission.ts'
import { validateDataset } from '../src/compendium/validate.ts'
import { reportKoboldValidation } from '../src/compendium/koboldIngestion.ts'
import { fetchOpen5ePages } from '../src/compendium/open5ePagination.ts'
import { mapCreatureCodexRecords, RESERVED_INDIVIDUALS } from '../src/compendium/open5eCcdx.ts'

const [outPath = 'output/creature-codex-creatures.json', cachePath] = process.argv.slice(2)

// Open5e 403s the default script User-Agent.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) openfray-compendium'
const API = 'https://api.open5e.com/v2/creatures/?document__key=ccdx&limit=500'

/** Every Creature Codex record, from the cache when given one, else from the API. */
async function fetchRecords(): Promise<Open5eRecord[]> {
  const cached = cachePath ? JSON.parse(readFileSync(cachePath, 'utf8')) : undefined
  let cacheRead = false
  const records = await fetchOpen5ePages<Open5eRecord>(
    API,
    '/v2/creatures/',
    async (url) => {
      if (cachePath) {
        if (cacheRead)
          throw new Error(
            'Incomplete cached Creature Codex snapshot: supply one complete response with next: null'
          )
        cacheRead = true
        return cached
      }
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`Open5e returned ${res.status}`)
      return res.json()
    },
    { parameter: 'document__key', value: 'ccdx' }
  )
  if (cachePath && cached.next !== null)
    throw new Error('Incomplete cached Creature Codex snapshot: next must be null')
  return records
}

const records = await fetchRecords()
const creatures = mapCreatureCodexRecords(records)
const report = emitValidatedDataset(creatures, outPath, {
  validate: validateDataset,
  report: (report) => reportKoboldValidation('kobold-press-ccdx', report)
})
if (report.errors) process.exit(1)

const excluded = records.length - creatures.length
const casters = creatures.filter((c) => c.spellcasting).length
console.log(`mapped ${creatures.length} Creature Codex creatures → ${outPath}`)
console.log(`  ${casters} with structured spellcasting`)
console.log(
  `  excluded ${excluded} Product Identity individuals: ${RESERVED_INDIVIDUALS.join(', ')}`
)
