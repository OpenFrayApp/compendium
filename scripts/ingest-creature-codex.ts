// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

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

import { readFileSync, writeFileSync } from 'node:fs'
import {
  isReservedIndividual,
  mapOpen5eCcdx,
  RESERVED_INDIVIDUALS,
  type Open5eCreature,
} from '../src/compendium/open5eCcdx.ts'

const [outPath = 'output/creature-codex-creatures.json', cachePath] = process.argv.slice(2)

// Open5e 403s the default script User-Agent.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) openfray-compendium'
const API = 'https://api.open5e.com/v2/creatures/?document__key=ccdx&limit=500'

/** Every Creature Codex record, from the cache when given one, else from the API. */
async function fetchRecords(): Promise<Open5eCreature[]> {
  if (cachePath) return JSON.parse(readFileSync(cachePath, 'utf8')).results
  const res = await fetch(API, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Open5e returned ${res.status}`)
  const body = (await res.json()) as { count: number; next: string | null; results: Open5eCreature[] }
  if (body.next) throw new Error('paginated response — raise the limit or follow `next`')
  if (body.results.length !== body.count) {
    throw new Error(`got ${body.results.length} of ${body.count} records`)
  }
  return body.results
}

const records = await fetchRecords()
const kept = records.filter((r) => !isReservedIndividual(r.name))
const creatures = kept.map((r) => mapOpen5eCcdx(r)).sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(outPath, JSON.stringify(creatures, null, 0))

const excluded = records.length - kept.length
const casters = creatures.filter((c) => c.spellcasting).length
console.log(`mapped ${creatures.length} Creature Codex creatures → ${outPath}`)
console.log(`  ${casters} with structured spellcasting`)
console.log(`  excluded ${excluded} Product Identity individuals: ${RESERVED_INDIVIDUALS.join(', ')}`)
if (excluded !== RESERVED_INDIVIDUALS.length) {
  console.error(`  WARNING: expected to exclude ${RESERVED_INDIVIDUALS.length} — a name may have changed upstream`)
}
