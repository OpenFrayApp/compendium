// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import {
  flattenMarkdown,
  isReservedIndividual,
  mapOpen5eCcdx,
  type Open5eCreature,
} from '../../src/compendium/open5eCcdx.ts'

/** A minimal Open5e v2 record; overrides fill in what a case is about. */
const record = (over: Partial<Open5eCreature> = {}): Open5eCreature => ({
  key: 'ccdx_test',
  name: 'Test Creature',
  size: { name: 'Large' },
  type: { name: 'Celestial' },
  alignment: 'lawful good',
  armor_class: 14,
  hit_points: 105,
  hit_dice: '10d10+50',
  challenge_rating: 5,
  experience_points: 1800,
  passive_perception: 12,
  ability_scores: {
    strength: 22,
    dexterity: 12,
    constitution: 20,
    intelligence: 10,
    wisdom: 14,
    charisma: 14,
  },
  speed: { walk: 50, unit: 'feet' },
  ...over,
})

describe('flattenMarkdown', () => {
  it('collapses the markdown Open5e wraps prose in', () => {
    expect(flattenMarkdown('**Bold.** Text\n\n- one\n- two')).toBe('Bold. Text one two')
  })

  it('leaves already-flat prose alone', () => {
    expect(flattenMarkdown('The creature makes two attacks.')).toBe(
      'The creature makes two attacks.',
    )
  })
})

describe('isReservedIndividual', () => {
  it('matches the confirmed Product Identity names', () => {
    expect(isReservedIndividual('Monkey King')).toBe(true)
    expect(isReservedIndividual('avatar of shoth')).toBe(true)
  })

  it('is exact, so a similarly-named creature is still Open Game Content', () => {
    // "Ankou Soul Seeker" is a kind of creature; only the singular Herald is reserved.
    expect(isReservedIndividual('Ankou Soul Seeker')).toBe(false)
    expect(isReservedIndividual('Storm Lord')).toBe(false)
  })
})

describe('mapOpen5eCcdx', () => {
  it('renders the structured fields into a creature', () => {
    const c = mapOpen5eCcdx(record())
    expect(c.id).toBe('kobold-press-ccdx:test-creature')
    expect(c.source).toBe('kobold-press-ccdx')
    expect(c.edition).toBe('5.0')
    expect(c.size).toBe('Large')
    expect(c.type).toBe('celestial')
    expect(c.alignment).toBe('lawful good')
    expect(c.ac).toBe(14)
    expect(c.maxHp).toBe(105)
    expect(c.hpFormula).toBe('10d10+50')
    expect(c.cr).toBe(5)
    expect(c.xp).toBe(1800)
    expect(c.abilities).toEqual({ str: 22, dex: 12, con: 20, int: 10, wis: 14, cha: 14 })
    expect(c.speed).toEqual({ walk: 50 })
  })

  it('emits no page number, since Open5e carries none', () => {
    // A zero would reach the stat block's source line as "pg. 0".
    expect(mapOpen5eCcdx(record()).sourcePage).toBeUndefined()
  })

  it('prints a fractional CR the way the stat line does', () => {
    expect(mapOpen5eCcdx(record({ challenge_rating: 0.25, experience_points: 50 })).cr).toBe(0.25)
    expect(mapOpen5eCcdx(record({ challenge_rating: 0.125, experience_points: 25 })).cr).toBe(0.125)
  })

  it('carries senses, saves and skills through the shared parsers', () => {
    const c = mapOpen5eCcdx(
      record({
        darkvision_range: 60,
        saving_throws: { constitution: 9, wisdom: 5 },
        skill_bonuses: { athletics: 9, animal_handling: 5 },
      }),
    )
    expect(c.senses).toEqual({ passivePerception: 12, darkvision: 60 })
    expect(c.saves).toEqual({ con: 9, wis: 5 })
    expect(c.skills).toEqual({ athletics: 9, animalHandling: 5 })
  })

  it('sorts actions into their stat-block sections', () => {
    const c = mapOpen5eCcdx(
      record({
        actions: [
          { name: 'Claw', desc: 'Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage.', action_type: 'ACTION', order_in_statblock: 2 },
          { name: 'Multiattack', desc: 'The creature makes two attacks.', action_type: 'ACTION', order_in_statblock: 1 },
          { name: 'Parry', desc: 'The creature adds 3 to its AC.', action_type: 'REACTION' },
          { name: 'Move', desc: 'The creature moves up to its speed.', action_type: 'LEGENDARY_ACTION' },
        ],
      }),
    )
    // Multiattack leads, as it does in print, because Open5e's own ordering is honored.
    expect(c.actions?.map((a) => a.name)).toEqual(['Multiattack', 'Claw'])
    expect(c.reactions?.map((a) => a.name)).toEqual(['Parry'])
    expect(c.legendaryActions?.actions.map((a) => a.name)).toEqual(['Move'])
  })

  it('parses a slot caster, which needs the markdown flattened first', () => {
    const c = mapOpen5eCcdx(
      record({
        traits: [
          {
            name: 'Spellcasting',
            desc:
              'The creature is a 5th-level spellcaster. Its spellcasting ability is Wisdom ' +
              '(spell save DC 14).\n\n' +
              '**Cantrips (at will)**: guidance, sacred flame\n\n' +
              '**1st level (4 slots)**: bane, cure wounds\n\n' +
              '**2nd level (3 slots)**: hold person',
          },
        ],
      }),
    )
    expect(c.spellcasting?.ability).toBe('wis')
    expect(c.spellcasting?.saveDc).toBe(14)
    expect(c.spellcasting?.slots).toEqual({ 1: 4, 2: 3 })
    const named = c.spellcasting?.groups.flatMap((g) => g.spells.map((s) => s.name)) ?? []
    expect(named).toContain('hold person')
    // 2014 books cast from the 5.1 library, like the three Tomes.
    const refs = c.spellcasting?.groups.flatMap((g) => g.spells.map((s) => s.ref)) ?? []
    expect(refs.every((r) => r == null || r.startsWith('srd-5.1:'))).toBe(true)
  })

  it('parses an innate caster', () => {
    const c = mapOpen5eCcdx(
      record({
        traits: [
          {
            name: 'Innate Spellcasting',
            desc:
              "The creature's innate spellcasting ability is Charisma (spell save DC 13). " +
              'It can innately cast the following spells, requiring no material components:\n\n' +
              '**At will**: dancing lights\n\n' +
              '**1/day each**: darkness, faerie fire',
          },
        ],
      }),
    )
    expect(c.spellcasting?.ability).toBe('cha')
    expect(c.spellcasting?.saveDc).toBe(13)
    expect(c.spellcasting?.groups.length).toBeGreaterThan(0)
  })
})
