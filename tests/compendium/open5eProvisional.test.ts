// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { prepareOpen5e, type PreparationRecord } from '../../src/compendium/open5ePreparation.ts'
import { provisionalFindings } from '../../src/compendium/open5eProvisional.ts'
import { validateDataset } from '../../src/compendium/validate.ts'

/** Build an API record retaining Black Flag's separate statistics. */
function aboleth(): PreparationRecord {
  return {
    key: 'bfrd_aboleth', name: 'Aboleth', document: { key: 'bfrd' },
    size: { name: 'Large' }, type: { name: 'Aberration' }, armor_class: 17, hit_points: 165, challenge_rating: 10,
    ability_scores: { strength: 20, dexterity: 8, constitution: 22, intelligence: 26, wisdom: 22, charisma: 18 },
    modifiers: { strength: 5, dexterity: -1, constitution: 6, intelligence: 8, wisdom: 6, charisma: 4 },
    legacy: { name: 'Aboleth', document__slug: 'blackflag', v2_converted_path: '/v2/creatures/bfrd_aboleth/', perception: 20 },
    actions: [{ name: 'Tentacle', desc: 'Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 (3d6+5) bludgeoning damage.', attacks: [{ to_hit_mod: 9, reach: 10 }] }],
  }
}

describe('provisional source retention', () => {
  it('labels retained API arithmetic without waiving strict checks or claiming primary evidence', () => {
    const record: PreparationRecord = {
      ...aboleth(), key: 'a5e-mm_yobbo', name: 'Yobbo', document: { key: 'a5e-mm' },
      hit_points: 11, hit_dice: '3d6', challenge_rating: 1,
    }
    const result = prepareOpen5e('a5e-mm', [record])
    expect(result.report.provisionalFindings).toHaveLength(1)
    expect(result.report.provisionalFindings[0]).toMatchObject({ status: 'unverified-open5e', severity: 'error', field: 'hpFormula' })
    expect(result.report.reviewedExceptions).toHaveLength(0)
    expect(result.report.validation.errors).toBe(1)
    expect(validateDataset(result.creatures).errors).toBe(1)
    expect(result.creatures[0].maxHp).toBe(11)
    expect(result.report.publishable).toBe(false)
    const creature = result.creatures[0]
    for (const change of [{ maxHp: 12 }, { hpFormula: '4d6' }, { source: 'other' }, { id: 'other' }]) {
      expect(provisionalFindings([{ ...creature, ...change }])).toEqual([])
    }
  })

  it.each([
    ['kobold-press-tob-2023', 'soul-eater', 'con', 17, 7, 5],
    ['green-ronin-tdcs', 'stoneguard', 'str', 18, 7, 8],
    ['green-ronin-tdcs', 'stoneguard', 'con', 20, 7, 9],
    ['green-ronin-tdcs', 'stoneguard', 'wis', 14, 7, 6],
    ['green-ronin-tdcs', 'waverider', 'con', 12, 4, 4],
    ['green-ronin-tdcs', 'waverider', 'wis', 16, 4, 6],
  ] as const)('guards provisional save inputs for %s:%s %s', (source, name, ability, score, cr, value) => {
    const base = prepareOpen5e('bfrd', [aboleth()]).creatures[0]
    const creature = { ...base, id: `${source}:${name}`, source, cr,
      abilities: { ...base.abilities, [ability]: score }, saves: { [ability]: value } }
    expect(provisionalFindings([creature])).toHaveLength(1)
    for (const changed of [
      { ...creature, cr: cr + 1 },
      { ...creature, abilities: { ...creature.abilities, [ability]: score + 2 } },
      { ...creature, saves: { [ability]: value + 2 } },
      { ...creature, source: 'other' },
    ]) expect(provisionalFindings([changed])).toEqual([])
  })

  it('retains Miremuck HP while keeping unrelated errors outside the provisional labels', () => {
    const base = prepareOpen5e('bfrd', [aboleth()]).creatures[0]
    const creature = { ...base, source: 'en-publishing-a5e-mm', id: 'en-publishing-a5e-mm:miremuck-goblin-king', maxHp: 62, hpFormula: '8d8+16', ac: -1 }
    expect(provisionalFindings([creature]).map((issue) => issue.field)).toEqual(['hpFormula'])
    expect(validateDataset([creature]).errors).toBe(2)
    expect(provisionalFindings([{ ...creature, maxHp: 63 }])).toEqual([])
  })

  it('preserves modifiers and publisher-checked fixed statistics without recalculating attacks', () => {
    const result = prepareOpen5e('bfrd', [aboleth()])
    expect(result.sourceStatistics[0]).toMatchObject({
      modifiers: { str: 5, dex: -1, con: 6, int: 8, wis: 6, cha: 4 },
      perception: 20, stealth: 9, status: 'publisher-checked-statistics', findings: [],
      evidence: 'https://bfrd.net/creatures/aboleth',
    })
    expect(result.creatures[0].actions?.[0]).toMatchObject({ toHit: 9, damage: [{ formula: '3d6+5', type: 'bludgeoning' }] })
    expect(result.sourceStatistics[0].synthesizedScores).toEqual(result.creatures[0].abilities)
    expect(result.report.publishable).toBe(false)
  })

  it('recovers checked Ancient Red Dragon Stealth without clamping synthesized scores', () => {
    const record = aboleth()
    const values = [10, 7, 16, 4, 9, 13]
    const abilities = Object.keys(record.ability_scores!)
    record.key = 'bfrd_ancient-red-dragon'
    record.name = 'Ancient Red Dragon'
    record.modifiers = Object.fromEntries(abilities.map((ability, index) => [ability, values[index]]))
    record.ability_scores = Object.fromEntries(abilities.map((ability, index) => [ability, 10 + 2 * values[index]]))
    record.legacy = { ...record.legacy!, perception: 26 }
    const result = prepareOpen5e('bfrd', [record])
    expect(result.sourceStatistics[0]).toMatchObject({ stealth: 17, perception: 26, status: 'publisher-checked-statistics' })
    expect(result.creatures[0].abilities.con).toBe(42)
    expect(result.report.validation.errors).toBe(2)
    expect(result.report.publishable).toBe(false)
  })

  it('does not infer missing statistics or reuse publisher evidence after drift', () => {
    for (const change of [
      { modifiers: undefined }, { legacy: undefined },
      { modifiers: { ...aboleth().modifiers, wisdom: 7 } },
      { key: 'bfrd_other', name: 'Other' },
    ]) {
      const result = prepareOpen5e('bfrd', [{ ...aboleth(), ...change }])
      expect(result.sourceStatistics[0].stealth).toBeNull()
      expect(result.sourceStatistics[0].status).toBe('unverified-open5e')
      expect(result.sourceStatistics[0].findings.length).toBeGreaterThan(0)
    }
    const missing = prepareOpen5e('bfrd', [{ ...aboleth(), modifiers: undefined, legacy: undefined }])
    expect(Object.values(missing.sourceStatistics[0].modifiers)).toEqual([null, null, null, null, null, null])
    expect(missing.sourceStatistics[0].perception).toBeNull()
  })

  it('keeps out-of-range synthesized scores and their validation errors intact', () => {
    const record = aboleth()
    record.ability_scores!.constitution = 42
    record.modifiers!.constitution = 16
    const result = prepareOpen5e('bfrd', [record])
    expect(result.creatures[0].abilities.con).toBe(42)
    expect(result.sourceStatistics[0].modifiers.con).toBe(16)
    expect(result.report.validation.errors).toBe(1)
  })
})
