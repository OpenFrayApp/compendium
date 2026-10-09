// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { auditOpen5e, mapOpen5e, OPEN5E_SIZES, type Open5eRecord } from './open5e.ts'
import { exclusionReason, OPEN5E_SOURCE_REVIEW } from './open5eSources.ts'
import { validateDataset } from './validate.ts'
import { correctOpen5e } from './open5eCorrections.ts'
import { OPEN5E_VALIDATION_EXCEPTIONS } from './open5eExceptions.ts'
import { blackFlagStatistics, provisionalFindings } from './open5eProvisional.ts'

export const OPEN5E_CANDIDATES = {
  'a5e-mm': { name: 'Monstrous Menagerie', source: 'en-publishing-a5e-mm' },
  bfrd: { name: 'Black Flag SRD', source: 'kobold-press-bfrd' },
  'tob-2023': { name: 'Tome of Beasts 1 (2023 Edition)', source: 'kobold-press-tob-2023' },
} as const

export const OPEN5E_BESTIARIES = [] as const

export type CandidateKey = keyof typeof OPEN5E_CANDIDATES
export type PreparationRecord = Open5eRecord
export type JsonFetcher = (url: string) => Promise<unknown>

const API = 'https://api.open5e.com/v2/'
const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

/** Resolve a candidate without allowing existing datasets to be overwritten. */
export function candidateKey(key: string): CandidateKey {
  if (!Object.hasOwn(OPEN5E_CANDIDATES, key)) throw new Error(`Unknown candidate: ${key}`)
  return key as CandidateKey
}

/** Select the DnD 5e batch while retaining explicit access to historical review snapshots. */
export function preparationKeys(key: string): CandidateKey[] {
  return key === 'all' ? [...OPEN5E_BESTIARIES] : [candidateKey(key)]
}

/** Fetch every page of one endpoint while enforcing counts and same-origin pagination. */
async function fetchPages<T>(initial: string, path: string, fetchJson: JsonFetcher): Promise<T[]> {
  let next: string | null = initial
  const visited = new Set<string>()
  const records: T[] = []
  let count: number | undefined
  while (next) {
    const url = new URL(next, API)
    if (url.origin !== new URL(API).origin || url.pathname !== path || url.username || url.password || url.hash) {
      throw new Error('Unexpected pagination URL')
    }
    url.searchParams.set('format', 'json')
    if (visited.has(url.href)) throw new Error('Pagination cycle')
    visited.add(url.href)
    const page = await fetchJson(url.href) as { count: number; next: string | null; results: T[] }
    if (!page || !Number.isInteger(page.count) || page.count < 0 || !Array.isArray(page.results)
      || !(page.next === null || typeof page.next === 'string')) throw new Error('Invalid Open5e page')
    if (count !== undefined && count !== page.count) throw new Error('Count changed during pagination')
    count = page.count
    records.push(...page.results)
    if (records.length > count || (page.next && !page.results.length)) throw new Error('Invalid pagination progress')
    next = page.next
  }
  if (records.length !== count) throw new Error(`Got ${records.length} of ${count} records`)
  return records
}

/** Fetch every v2 creature and reject mixed documents or incomplete records. */
export async function fetchOpen5eRecords(key: CandidateKey, fetchJson: JsonFetcher): Promise<PreparationRecord[]> {
  const records = await fetchPages<PreparationRecord>(`${API}creatures/?format=json&document__key=${key}&limit=100`, '/v2/creatures/', fetchJson)
  assertRecords(records, key)
  return records
}

export interface LegacyRecord {
  name: string
  document__slug: string
  v2_converted_path: string
  page_no?: number | null
  perception?: number | null
  legendary_desc?: string | null
}

const LEGACY_KEYS: Record<CandidateKey, string> = {
  'a5e-mm': 'menagerie', bfrd: 'blackflag', 'tob-2023': 'tob-2023',
}

/** Fetch v1 provenance that the v2 conversion discards. */
export async function fetchLegacyRecords(key: CandidateKey, fetchJson: JsonFetcher): Promise<LegacyRecord[]> {
  const slug = LEGACY_KEYS[key]
  const records = await fetchPages<LegacyRecord>(`https://api.open5e.com/v1/monsters/?format=json&document__slug=${slug}&limit=100`, '/v1/monsters/', fetchJson)
  for (const record of records) {
    if (record.document__slug !== slug || !record.v2_converted_path?.startsWith(`/v2/creatures/${key}_`)) {
      throw new Error(`Unexpected v1 provenance for ${key}`)
    }
  }
  return records
}

/** Normalize typography and capitalization while retaining the substantive source name. */
function identityName(name: string): string {
  return name.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/** Attach checked v1 provenance to matching v2 records without altering raw snapshots. */
export function withLegacy(records: PreparationRecord[], legacy: LegacyRecord[]): PreparationRecord[] {
  const lookup = new Map(legacy.map((r) => [r.v2_converted_path.split('/')[3], r]))
  if (lookup.size !== legacy.length || legacy.length !== records.length) throw new Error('Incomplete or duplicate v1 provenance')
  return records.map((r) => {
    const original = lookup.get(r.key)
    if (!original || identityName(original.name) !== identityName(r.name)) throw new Error(`Missing v1 match: ${r.key}: ${JSON.stringify(original?.name)} vs ${JSON.stringify(r.name)}`)
    return { ...r, legacy: original }
  })
}

/** Reject mixed documents, duplicate keys, and missing core stats before mapping. */
export function assertRecords(records: PreparationRecord[], key: CandidateKey): void {
  if (!Array.isArray(records) || !records.length) throw new Error('Empty or invalid creature snapshot')
  const seen = new Set<string>()
  for (const r of records) {
    if (!r || r.document?.key !== key) throw new Error(`Record outside document ${key}`)
    if (!r.key || seen.has(r.key)) throw new Error(`Missing or duplicate record key: ${r.key}`)
    seen.add(r.key)
    if (!r.name?.trim() || !r.size?.name || !r.type?.name
      || ![r.armor_class, r.hit_points, r.challenge_rating, ...ABILITIES.map((a) => r.ability_scores?.[a])]
        .every((n) => typeof n === 'number' && Number.isFinite(n))) {
      throw new Error(`Missing core stats: ${r.key}`)
    }
    if (r.hit_dice != null && typeof r.hit_dice !== 'string') throw new Error(`Invalid hit dice: ${r.key}`)
    for (const entries of [r.actions, r.traits]) {
      if (entries != null && (!Array.isArray(entries) || entries.some((entry) =>
        !entry || typeof entry.name !== 'string' || !entry.name.trim() || typeof entry.desc !== 'string'))) {
        throw new Error(`Invalid action or trait entries: ${r.key}`)
      }
    }
    for (const map of [r.saving_throws, r.skill_bonuses, r.modifiers]) {
      if (map && Object.values(map).some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
        throw new Error(`Invalid stat bonuses: ${r.key}`)
      }
    }
    for (const action of r.actions ?? []) {
      if (action.legendary_action_cost != null && (!Number.isInteger(action.legendary_action_cost) || action.legendary_action_cost < 1)) {
        throw new Error(`Invalid legendary cost: ${r.key}: ${action.name}`)
      }
      if (action.usage_limits && (!Number.isInteger(action.usage_limits.param) || action.usage_limits.param < 1)) {
        throw new Error(`Invalid usage limit: ${r.key}: ${action.name}`)
      }
    }
  }
}

/** Create provisional mappings and a report that never grants publishing approval. */
export function prepareOpen5e(key: CandidateKey, records: PreparationRecord[]) {
  assertRecords(records, key)
  const candidate = OPEN5E_CANDIDATES[key]
  const excluded = records.flatMap((r) => {
    const reason = exclusionReason(key, r.name)
    return reason ? [{ key: r.key, name: r.name, reason }] : []
  })
  const eligible = records.filter((r) => !exclusionReason(key, r.name))
  const withheld = eligible.filter((r) => !OPEN5E_SIZES.some((size) => size === r.size?.name))
    .map((r) => ({ key: r.key, name: r.name, reason: `Unsupported source size: ${r.size?.name}; the vendored schema must not be forked.` }))
  const kept = eligible.filter((r) => !withheld.some((w) => w.key === r.key))
  const corrections = kept.map((r) => ({ original: r, ...correctOpen5e(r) }))
  const mappings = corrections.map(({ corrected }) => ({ record: corrected, creature: mapOpen5e(corrected, candidate.source) }))
  const creatures = mappings.map((m) => m.creature).sort((a, b) => a.name.localeCompare(b.name))
  const fidelity = mappings.flatMap(({ record, creature }) => auditOpen5e(record, creature)
    .map((message) => ({ key: record.key, name: record.name, message })))
  const validation = validateDataset(creatures, OPEN5E_VALIDATION_EXCEPTIONS)
  const sourceStatistics = key === 'bfrd'
    ? mappings.map(({ record, creature }) => blackFlagStatistics(record, creature)) : []
  return {
    creatures,
    sourceStatistics,
    report: {
      document: key,
      name: candidate.name,
      source: candidate.source,
      publishable: false,
      licenseReview: OPEN5E_SOURCE_REVIEW[key],
      blockers: [
        ...OPEN5E_SOURCE_REVIEW[key].blockers,
        'Resolve fidelity findings and verify source-specific mechanics before publishing.',
        'Review raw actions against mapped actions, including structured attacks, legendary costs, and spell links.',
        'Resolve validation errors and review warnings before producing a publishable dataset.',
        'Register the library and update console credits only in a separately authorized publishing change.',
      ],
      exclusionsReviewed: false,
      excluded,
      withheld,
      corrections: corrections.flatMap(({ original, applied }) => applied.map((fix) => ({ key: original.key, ...fix }))),
      fidelity,
      rawCount: records.length,
      keptCount: creatures.length,
      reviewedExceptions: validation.issues.filter((issue) => issue.review),
      provisionalFindings: provisionalFindings(creatures),
      sourceStatisticsFindings: sourceStatistics.flatMap((entry) => entry.findings.map((message) => ({ key: entry.key, name: entry.name, message }))),
      validation,
    },
  }
}
