// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { auditOpen5e, mapOpen5e, type Open5eRecord } from '../../src/compendium/open5e.ts'
import { exclusionReason } from '../../src/compendium/open5eSources.ts'

/** Build a source record with explicit numeric values for mapper tests. */
function record(overrides: Partial<Open5eRecord> = {}): Open5eRecord {
  return {
    key: 'bfrd_test', name: 'Test Creature', document: { key: 'bfrd' },
    size: { name: 'Medium' }, type: { name: 'Beast' }, armor_class: 10,
    hit_points: 165, challenge_rating: 10,
    ability_scores: { strength: 20, dexterity: 8, constitution: 22, intelligence: 26, wisdom: 22, charisma: 18 },
    speed: { walk: 10, swim: 40 }, ...overrides,
  }
}

describe('source-faithful Open5e mapping', () => {
  it('retains HP without a dice formula and does not invent alignment', () => {
    const mapped = mapOpen5e(record({ alignment: 'chaotic evil' }), 'kobold-press-bfrd')
    expect(mapped.maxHp).toBe(165)
    expect(mapped.hpFormula).toBeUndefined()
    expect(mapped.alignment).toBeUndefined()
    expect(mapped.abilities.con).toBe(22)
  })

  it('omits saves equal to the fallback modifier but keeps unusual published overrides', () => {
    expect(mapOpen5e(record({ saving_throws: { strength: 5, dexterity: -1, wisdom: 0 } }), 'test').saves)
      .toEqual({ wis: 0 })
    expect(mapOpen5e(record({ saving_throws: { strength: 5, dexterity: -1 } }), 'test').saves).toBeUndefined()
  })

  it('restores a two-action legendary budget and metadata costs', () => {
    const raw = record({ document: { key: 'a5e-mm' }, actions: [
      { name: 'The aboleth can take 2 legendary actions', desc: 'Regains them at the start of its turn.', action_type: 'LEGENDARY_ACTION' },
      { name: 'Soul Drain', desc: 'One target takes 22 (4d10) psychic damage.', action_type: 'LEGENDARY_ACTION', legendary_action_cost: 2 },
    ] })
    const mapped = mapOpen5e(raw, 'test')
    expect(mapped.legendaryActions?.perRound).toBe(2)
    expect(mapped.legendaryActions?.actions).toHaveLength(1)
    expect(mapped.legendaryActions?.actions[0].legendaryCost).toBe(2)
    expect(auditOpen5e(raw, mapped)).toEqual([])
  })

  it('restores recharge and abbreviated Black Flag save mechanics', () => {
    const mapped = mapOpen5e(record({ actions: [{
      name: 'Psychic Torrent', action_type: 'ACTION', usage_limits: { type: 'RECHARGE_ON_ROLL', param: 5 },
      desc: 'Each target must make a DC 16 WIS save, taking 49 (14d6) psychic damage on a failure, or half the damage on a success.',
    }] }), 'test')
    expect(mapped.actions?.[0].recharge).toEqual({ type: 'dice', value: 5 })
    expect(mapped.actions?.[0].save).toEqual({ ability: 'wis', dc: 16, onSave: 'half' })
    expect(mapped.actions?.[0].damage).toEqual([{ formula: '14d6', type: 'psychic' }])
  })

  it('preserves prose-only spellcasting when it cannot be structured', () => {
    const raw = record({ actions: [{ name: 'Spellcasting', desc: 'The creature casts a source-specific spell.', action_type: 'ACTION' }] })
    const mapped = mapOpen5e(raw, 'test')
    expect(mapped.actions?.[0].name).toBe('Spellcasting')
    expect(mapped.actions?.[0].text).toContain('source-specific spell')
    expect(auditOpen5e(raw, mapped)).toEqual([])
  })

  it('keeps spellcasting trait prose alongside usable spell references', () => {
    const mapped = mapOpen5e(record({ traits: [{
      name: 'Innate Spellcasting', desc: 'Its spellcasting ability is Wisdom (spell save DC 16). At will: detect magic',
    }] }), 'test')
    expect(mapped.spellcasting?.groups[0].spells[0].ref).toBe('srd-5.1:detect-magic')
    expect(mapped.traits?.[0].text).toContain('At will: detect magic')
  })

  it('recovers source pages, Perception, and legacy legendary budgets', () => {
    const mapped = mapOpen5e(record({
      actions: [{ name: 'Detect', desc: 'Detects creatures.', action_type: 'LEGENDARY_ACTION' }],
      legacy: { name: 'Test Creature', document__slug: 'blackflag', v2_converted_path: '/v2/creatures/bfrd_test/', page_no: 12, perception: 20, legendary_desc: 'The creature can take 4 legendary actions.' },
    }), 'test')
    expect(mapped.sourcePage).toBe(12)
    expect(mapped.senses.passivePerception).toBe(20)
    expect(mapped.skills?.perception).toBe(10)
    expect(mapped.legendaryActions?.perRound).toBe(4)
  })

  it('preserves attack metadata, sections, hover, and signed bonuses', () => {
    const mapped = mapOpen5e(record({ speed: { fly: 30 }, speed_all: { hover: true }, actions: [{
      name: 'Bolt', desc: 'Ranged Spell Attack: -1 to hit, range 30 ft. Hit: 3 (1d6) fire damage.',
      action_type: 'BONUS_ACTION', attacks: [{ to_hit_mod: -1, range: 30, long_range: 60 }],
    }] }), 'test')
    expect(mapped.speed.hover).toBe(true)
    expect(mapped.bonusActions?.[0].toHit).toBe(-1)
    expect(mapped.bonusActions?.[0].kind).toBe('ranged')
    expect(mapped.bonusActions?.[0].range).toEqual({ normal: 30, long: 60 })
  })

  it('normalizes trait-name whitespace without reporting a lost trait', () => {
    const raw = record({ traits: [{ name: 'Amphibious ', desc: 'Breathes air and water.' }] })
    const mapped = mapOpen5e(raw, 'test')
    expect(mapped.traits?.[0].name).toBe('Amphibious')
    expect(auditOpen5e(raw, mapped)).toEqual([])
  })

  it('flags unsupported mechanics rather than dropping them unnoticed', () => {
    const raw = record({ actions: [{ name: 'Mythic', desc: 'Special rules.', action_type: 'MYTHIC_ACTION', usage_limits: { type: 'UNKNOWN', param: 1 } }] })
    expect(auditOpen5e(raw, mapOpen5e(raw, 'test'))).toContain('Unsupported action section: MYTHIC_ACTION')
  })

  it('excludes reserved individuals and related entries while retaining unrelated generic creatures', () => {
    for (const name of ['Bear King', 'Akyishigal', 'Camazotz', 'Lord of the Hunt', 'Queen of Witches', 'Baba Yaga’s Horsemen', "Ia'Affrat", 'Spawn of Akyishigal', 'Spawn of Arbeyach']) {
      expect(exclusionReason('tob-2023', name)).toBeTruthy()
    }
    for (const name of ['Krake Spawn', 'Bandit Lord', 'Giant Ant Queen', 'Grick']) {
      expect(exclusionReason('tob-2023', name)).toBeUndefined()
    }
    expect(exclusionReason('a5e-mm', 'Mind Flayer')).toBeTruthy()
  })
})
