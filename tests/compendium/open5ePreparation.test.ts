// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it, vi } from 'vitest'
import {
  assertRecords, candidateKey, fetchLegacyRecords, fetchOpen5eRecords, preparationKeys, prepareOpen5e, withLegacy,
  type PreparationRecord,
} from '../../src/compendium/open5ePreparation.ts'

/** Build a complete creature record for preparation tests. */
function record(key = 'bfrd_test'): PreparationRecord {
  return {
    key, name: 'Test Creature', document: { key: 'bfrd' },
    size: { name: 'Medium' }, type: { name: 'Beast' }, alignment: 'unaligned',
    armor_class: 10, hit_points: 4, hit_dice: '1d8', challenge_rating: 0,
    ability_scores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    speed: { walk: 30 },
  }
}

describe('Open5e preparation', () => {
  it('keeps the active batch empty while allowing explicit historical review', () => {
    expect(preparationKeys('all')).toEqual([])
    expect(preparationKeys('tob-2023')).toEqual(['tob-2023'])
    expect(preparationKeys('a5e-mm')).toEqual(['a5e-mm'])
    expect(preparationKeys('bfrd')).toEqual(['bfrd'])
    for (const key of ['tdcs', 'toh', 'toString', '../console']) {
      expect(() => preparationKeys(key)).toThrow('Unknown candidate')
    }
  })

  it('allows only missing sources, including prototype-like keys', () => {
    expect(candidateKey('a5e-mm')).toBe('a5e-mm')
    for (const key of ['tob', 'ccdx', 'srd-2024', 'toString', '../console']) {
      expect(() => candidateKey(key)).toThrow('Unknown candidate')
    }
  })

  it('follows pages and forces JSON on pagination links', async () => {
    const fetchJson = vi.fn()
      .mockResolvedValueOnce({ count: 2, next: '/v2/creatures/?offset=1', results: [record()] })
      .mockResolvedValueOnce({ count: 2, next: null, results: [record('bfrd_second')] })
    expect(await fetchOpen5eRecords('bfrd', fetchJson)).toHaveLength(2)
    expect(fetchJson.mock.calls[1][0]).toContain('format=json')
  })

  it('rejects incomplete, inconsistent, and malformed pages', async () => {
    for (const page of [
      { count: 2, next: null, results: [record()] },
      { count: 0, next: null, results: [record()] },
      { count: 1, next: null, results: 'bad' },
      { count: 1, results: [record()] },
      { count: 1, next: '/v2/creatures/?offset=1', results: [] },
    ]) {
      await expect(fetchOpen5eRecords('bfrd', async () => page)).rejects.toThrow()
    }
    const fetchJson = vi.fn()
      .mockResolvedValueOnce({ count: 2, next: '/v2/creatures/?offset=1', results: [record()] })
      .mockResolvedValueOnce({ count: 3, next: null, results: [record('bfrd_second')] })
    await expect(fetchOpen5eRecords('bfrd', fetchJson)).rejects.toThrow('Count changed')
  })

  it('rejects external pagination and cycles', async () => {
    await expect(fetchOpen5eRecords('bfrd', async () => ({ count: 2, next: 'https://example.com/', results: [record()] })))
      .rejects.toThrow('Unexpected pagination URL')
    await expect(fetchOpen5eRecords('bfrd', async (url) => ({ count: 2, next: url, results: [record()] })))
      .rejects.toThrow('Pagination cycle')
  })

  it('rejects duplicate keys, mixed sources, empty snapshots, and missing stats', () => {
    expect(() => assertRecords([record(), record()], 'bfrd')).toThrow('duplicate')
    expect(() => assertRecords([record()], 'tob-2023')).toThrow('outside document')
    expect(() => assertRecords([], 'bfrd')).toThrow('Empty')
    expect(() => assertRecords([{ ...record(), hit_points: undefined }], 'bfrd')).toThrow('core stats')
    expect(() => assertRecords([{ ...record(), ability_scores: {} }], 'bfrd')).toThrow('core stats')
  })

  it('checks legacy snapshot joins and source identity', async () => {
    const legacy = { name: 'Test Creature', document__slug: 'blackflag', v2_converted_path: '/v2/creatures/bfrd_test/' }
    expect(withLegacy([record()], [legacy])[0].legacy).toEqual(legacy)
    expect(withLegacy([{ ...record(), name: 'Test Creature’s' }], [{ ...legacy, name: "TEST CREATURE'S" }])[0].legacy?.name).toBe("TEST CREATURE'S")
    expect(() => withLegacy([record()], [])).toThrow('Incomplete')
    expect(() => withLegacy([record()], [{ ...legacy, name: 'Wrong' }])).toThrow('Missing v1 match')
    expect(() => withLegacy([record()], [{ ...legacy, v2_converted_path: '/v2/creatures/bfrd_other/' }])).toThrow('Missing v1 match')
    await expect(fetchLegacyRecords('bfrd', async () => ({ count: 1, next: null, results: [legacy] }))).resolves.toEqual([legacy])
    await expect(fetchLegacyRecords('bfrd', async () => ({ count: 1, next: null, results: [{ ...legacy, document__slug: 'tob' }] }))).rejects.toThrow('Unexpected v1 provenance')
  })

  it('records exclusions and withholds unrepresentable source sizes', () => {
    const records = [
      { ...record('tob-2023_bear-king'), name: 'Bear King', document: { key: 'tob-2023' } },
      { ...record('tob-2023_spawn'), name: 'Spawn of Akyishigal', document: { key: 'tob-2023' } },
      { ...record('tob-2023_spawn-arbeyach'), name: 'Spawn of Arbeyach', document: { key: 'tob-2023' } },
      { ...record('tob-2023_ia-affrat'), name: 'Ia’Affrat', document: { key: 'tob-2023' } },
      { ...record('tob-2023_krake-spawn'), name: 'Krake Spawn', document: { key: 'tob-2023' } },
      { ...record('tob-2023_bandit-lord'), name: 'Bandit Lord', document: { key: 'tob-2023' } },
      { ...record('tob-2023_titan'), name: 'Titan', size: { name: 'Titanic' }, document: { key: 'tob-2023' } },
    ]
    const result = prepareOpen5e('tob-2023', records)
    expect(result.creatures.map((c) => c.name)).toEqual(['Bandit Lord', 'Krake Spawn'])
    expect(result.report.excluded.map((r) => r.name)).toEqual(['Bear King', 'Spawn of Akyishigal', 'Spawn of Arbeyach', 'Ia’Affrat'])
    expect(result.report.withheld.map((r) => r.name)).toEqual(['Titan'])
    expect(result.report.publishable).toBe(false)
  })

  it('uses separate source IDs and blocks publication even when validation passes', () => {
    const result = prepareOpen5e('bfrd', [record()])
    expect(result.creatures[0].id).toBe('kobold-press-bfrd:test-creature')
    expect(result.report.validation.errors).toBe(0)
    expect(result.report.publishable).toBe(false)
    expect(result.report.exclusionsReviewed).toBe(false)
    expect(result.report.rawCount).toBe(1)
  })

  it('preserves bad source values for review instead of silently fixing them', () => {
    const result = prepareOpen5e('bfrd', [{ ...record(), hit_points: 99 }])
    expect(result.creatures[0].maxHp).toBe(99)
    expect(result.report.validation.errors).toBeGreaterThan(0)
    expect(result.report.publishable).toBe(false)
  })
})
