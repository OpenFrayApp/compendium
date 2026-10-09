// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import {
  assertRecords, candidateKey, fetchOpen5eRecords, fetchLegacyRecords, OPEN5E_CANDIDATES, preparationKeys, prepareOpen5e, withLegacy,
  type LegacyRecord, type PreparationRecord,
} from '../src/compendium/open5ePreparation.ts'

/** Fetch JSON explicitly; Open5e otherwise returns its browsable HTML interface. */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 openfray-compendium', Accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`Open5e returned ${response.status}: ${url}`)
  return response.json()
}

/** Save a reproducible raw snapshot and provisional dataset in compendium output only. */
async function prepare(key: string, cachePath?: string): Promise<void> {
  const selected = candidateKey(key)
  const dir = `output/open5e-preparation/${selected}`
  let snapshot: { document: { key: string }; records: PreparationRecord[]; legacy?: LegacyRecord[]; fetchedAt: string }
  if (cachePath) {
    snapshot = JSON.parse(readFileSync(cachePath, 'utf8'))
    if (snapshot.document?.key !== selected) throw new Error('Cache document does not match candidate')
  } else {
    const document = await fetchJson(`https://api.open5e.com/v2/documents/${selected}/?format=json`) as { key: string }
    if (document.key !== selected) throw new Error('Unexpected document metadata')
    const [records, legacy] = await Promise.all([
      fetchOpen5eRecords(selected, fetchJson), fetchLegacyRecords(selected, fetchJson),
    ])
    snapshot = { document, records, legacy, fetchedAt: new Date().toISOString() }
  }
  assertRecords(snapshot.records, selected)
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/raw.json`, JSON.stringify(snapshot, null, 2))
  const records = snapshot.legacy ? withLegacy(snapshot.records, snapshot.legacy) : snapshot.records
  const { creatures, sourceStatistics, report } = prepareOpen5e(selected, records)
  if (!snapshot.legacy) report.blockers.push('Snapshot lacks v1 provenance; refetch before reviewing legendary budgets and Perception.')
  writeFileSync(`${dir}/candidate-creatures.json`, JSON.stringify(creatures))
  writeFileSync(`${dir}/source-statistics.json`, JSON.stringify(sourceStatistics, null, 2))
  writeFileSync(`${dir}/report.json`, JSON.stringify({ ...report, documentMetadata: snapshot.document, fetchedAt: snapshot.fetchedAt }, null, 2))
  console.log(`${selected}: ${creatures.length} provisional creatures; ${report.excluded.length} excluded; ${report.validation.errors} errors, ${report.validation.warns} warnings; ${report.fidelity.length} fidelity findings → ${dir}`)
  console.log('Publishing blocked: see report.json. No console files changed.')
  if (strict && !report.publishable) process.exitCode = 1
}

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const [key, cachePath, ...extra] = args.filter((arg) => arg !== '--strict')
if (!key || extra.length || (key === 'all' && cachePath)) {
  throw new Error(`Usage: npm run prepare:open5e -- <${Object.keys(OPEN5E_CANDIDATES).join('|')}|all> [raw.json] [--strict]`)
}
const selectedKeys = preparationKeys(key)
if (!selectedKeys.length) console.log('No active Open5e bestiaries selected. Historical reviews require an explicit document key.')
for (const selected of selectedKeys) await prepare(selected, cachePath)
