// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { mapSrd52Spell, type Srd52SpellBlock } from '../../src/compendium/srd52spells.ts'

const block = (over: Partial<Srd52SpellBlock>): Srd52SpellBlock => ({
  name: 'Test',
  sourcePage: 1,
  header: 'Level 1 Evocation (Wizard)',
  castingTime: 'Action',
  range: 'Self',
  components: 'V, S',
  duration: 'Instantaneous',
  text: '',
  ...over,
})

describe('mapSrd52Spell display fields', () => {
  it('parses a leveled spell header and components', () => {
    const s = mapSrd52Spell(block({
      name: 'Fireball',
      header: 'Level 3 Evocation (Sorcerer, Wizard)',
      castingTime: 'Action',
      range: '150 feet',
      components: 'V, S, M (a ball of bat guano and sulfur)',
      duration: 'Instantaneous',
      text: 'Each creature in the area makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\n\nUsing a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3.',
    }))
    expect(s.id).toBe('srd-5.2:fireball')
    expect(s.level).toBe(3)
    expect(s.school).toBe('Evocation')
    expect(s.classes).toEqual(['Sorcerer', 'Wizard'])
    expect(s.castingTime).toBe('Action')
    expect(s.components).toEqual({ verbal: true, somatic: true, material: true, materials: 'a ball of bat guano and sulfur' })
  })

  it('treats a cantrip header as level 0', () => {
    const s = mapSrd52Spell(block({ name: 'Fire Bolt', header: 'Evocation Cantrip (Sorcerer, Wizard)' }))
    expect(s.level).toBe(0)
    expect(s.school).toBe('Evocation')
  })

  it('flags ritual from the casting time and concentration from the duration', () => {
    const s = mapSrd52Spell(block({ castingTime: 'Action or Ritual', duration: 'Concentration, up to 10 minutes' }))
    expect(s.ritual).toBe(true)
    expect(s.concentration).toBe(true)
  })

  it('fixes the PDF name-font casing quirk', () => {
    expect(mapSrd52Spell(block({ name: 'Acid SplASh' })).name).toBe('Acid Splash')
    expect(mapSrd52Spell(block({ name: 'Glyph of Warding' })).name).toBe('Glyph of Warding')
  })
})

describe('mapSrd52Spell mechanics', () => {
  it('parses damage, a save, and same-die slot scaling', () => {
    const s = mapSrd52Spell(block({
      header: 'Level 3 Evocation (Wizard)',
      text: 'makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\n\nUsing a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3.',
    }))
    expect(s.mechanics?.damage).toEqual([{ formula: '8d6', type: 'fire' }])
    expect(s.mechanics?.save).toEqual({ ability: 'dex', onSave: 'half' })
    expect(s.mechanics?.scaling?.[0]).toEqual({ level: 4, by: 'slot', damage: [{ formula: '9d6', type: 'fire' }] })
    expect(s.mechanics?.scaling?.at(-1)).toEqual({ level: 9, by: 'slot', damage: [{ formula: '14d6', type: 'fire' }] })
  })

  it('parses a spell attack and character (cantrip) scaling', () => {
    const s = mapSrd52Spell(block({
      header: 'Evocation Cantrip (Wizard)',
      text: 'Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage.\n\nCantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).',
    }))
    expect(s.mechanics?.attackRoll).toBe(true)
    expect(s.mechanics?.scaling).toEqual([
      { level: 5, by: 'character', damage: [{ formula: '2d10', type: 'fire' }] },
      { level: 11, by: 'character', damage: [{ formula: '3d10', type: 'fire' }] },
      { level: 17, by: 'character', damage: [{ formula: '4d10', type: 'fire' }] },
    ])
  })

  it('captures multiple damage types and scales each matching die', () => {
    const s = mapSrd52Spell(block({
      header: 'Level 5 Evocation (Cleric)',
      text: 'taking 5d6 Fire damage and 5d6 Radiant damage on a failed save or half as much damage on a successful one.\n\nUsing a Higher-Level Spell Slot. The Fire damage and Radiant damage increase by 1d6 each for each spell slot level above 5.',
    }))
    expect(s.mechanics?.damage).toEqual([
      { formula: '5d6', type: 'fire' },
      { formula: '5d6', type: 'radiant' },
    ])
    expect(s.mechanics?.scaling?.[0].damage).toEqual([
      { formula: '6d6', type: 'fire' },
      { formula: '6d6', type: 'radiant' },
    ])
  })

  it('reads the "<type> damage equal to NdM" phrasing of conjured-weapon spells', () => {
    const s = mapSrd52Spell(block({
      text: 'you make a melee spell attack against a target. On a hit, the target takes Force damage equal to 4d12 plus your spellcasting ability modifier.',
    }))
    expect(s.mechanics?.damage).toEqual([{ formula: '4d12', type: 'force' }])
  })

  it('lifts damage due a turn later out of the immediate damage', () => {
    const s = mapSrd52Spell(block({
      name: 'Acid Arrow',
      header: 'Level 2 Evocation (Wizard)',
      text: 'Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn.',
    }))
    // Rolled with the initial hit, the later 2d4 would land a turn early.
    expect(s.mechanics?.damage).toEqual([{ formula: '4d4', type: 'acid' }])
    expect(s.mechanics?.delayed).toEqual({
      damage: [{ formula: '2d4', type: 'acid' }],
      when: 'endOfNextTurn',
    })
  })

  it('reads the "and another NdM" wording of the later clause', () => {
    const s = mapSrd52Spell(block({
      name: 'Vitriolic Sphere',
      header: 'Level 4 Evocation (Wizard)',
      text: 'On a failed save, a creature takes 10d4 Acid damage and another 5d4 Acid damage at the end of its next turn.\n\nUsing a Higher-Level Spell Slot. The initial damage increases by 2d4 for each spell slot level above 4.',
    }))
    expect(s.mechanics?.damage).toEqual([{ formula: '10d4', type: 'acid' }])
    expect(s.mechanics?.delayed?.damage).toEqual([{ formula: '5d4', type: 'acid' }])
    // Only the initial damage scales — the later clause is out of the scaled set.
    expect(s.mechanics?.scaling?.map((v) => v.damage)).toEqual([
      [{ formula: '12d4', type: 'acid' }],
      [{ formula: '14d4', type: 'acid' }],
      [{ formula: '16d4', type: 'acid' }],
      [{ formula: '18d4', type: 'acid' }],
      [{ formula: '20d4', type: 'acid' }],
    ])
  })

  it('leaves a utility spell without mechanics', () => {
    const s = mapSrd52Spell(block({ text: 'A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier.' }))
    expect(s.mechanics).toBeUndefined()
  })
})
