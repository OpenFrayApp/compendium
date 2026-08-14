// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { mapSrd52, type Srd52Block } from '../../src/compendium/srd52.ts'

const block = (over: Partial<Srd52Block>): Srd52Block => ({
  name: 'Test',
  sourcePage: 255,
  header: [],
  sections: {},
  preamble: {},
  ...over,
})

describe('mapSrd52 header', () => {
  const c = mapSrd52(
    block({
      name: 'Aboleth',
      sourcePage: 255,
      header: [
        'Large Aberration, Lawful Evil',
        'AC 17 Initiative +7 (17)',
        'HP 150 (20d10 + 40)',
        'Speed 10 ft., Swim 40 ft.',
        'MOD SAVE MOD SAVE MOD SAVE',
        'Str 21 +5 +5 Dex 9 -1 +3 Con 15 +2 +6',
        'Int 18 +4 +8 WIS 15 +2 +6 Cha 18 +4 +4',
        'Skills History +12, Perception +10',
        'Senses Darkvision 120 ft.; Passive Perception 20',
        'Languages Deep Speech; telepathy 120 ft.',
        'CR 10 (XP 5,900, or 7,200 in lair; PB +4)',
      ],
    }),
  )

  it('parses identity, defenses, abilities, and provenance', () => {
    expect(c.id).toBe('srd-5.2:aboleth')
    expect(c.size).toBe('Large')
    expect(c.type).toBe('aberration')
    expect(c.alignment).toBe('lawful evil')
    expect(c.sourcePage).toBe(255)
    expect(c.ac).toBe(17)
    expect(c.initiative).toBe(7)
    expect(c.maxHp).toBe(150)
    expect(c.hpFormula).toBe('20d10+40')
    expect(c.speed).toEqual({ walk: 10, swim: 40 })
    expect(c.abilities).toEqual({ str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 })
    expect(c.saves).toEqual({ dex: 3, con: 6, int: 8, wis: 6 }) // proficient only
    expect(c.cr).toBe(10)
    expect(c.xp).toBe(5900)
    expect(c.senses.passivePerception).toBe(20)
    expect(c.senses.darkvision).toBe(120)
  })
})

describe('mapSrd52 robustness', () => {
  it('tolerates a save value that lost its + sign', () => {
    const c = mapSrd52(
      block({ header: ['Medium Beast, Unaligned', 'AC 11 Initiative +0', 'HP 9 (2d8)', 'Str 6 -2 -2 Dex 10 +0 2 Con 11 +0 +0', 'Senses Passive Perception 10', 'CR 0 (XP 10; PB +2)'] }),
    )
    expect(c.abilities.dex).toBe(10)
    expect(c.saves?.dex).toBe(2) // "2" read as +2
  })

  it('captures a Skills list that wraps to a second line', () => {
    const c = mapSrd52(
      block({
        header: [
          'Medium Humanoid, Neutral',
          'AC 16 Initiative +4',
          'HP 44 (8d8 + 8)',
          'Str 11 +0 +0 Dex 15 +2 +2 Con 12 +1 +1',
          'Skills Deception +5, Insight +4, Investigation +5,',
          'Perception +6, Stealth +6',
          'Senses Passive Perception 16',
          'CR 1 (XP 200; PB +2)',
        ],
      }),
    )
    expect(c.skills?.perception).toBe(6) // from the wrapped continuation line
    expect(c.skills?.stealth).toBe(6)
  })

  it('splits Immunities into damage and condition immunities', () => {
    const c = mapSrd52(
      block({ header: ['Huge Fiend, Chaotic Evil', 'AC 19 Initiative +14', 'HP 287 (23d12 + 138)', 'Str 26 +8 +8 Dex 15 +2 +2 Con 22 +6 +6', 'Immunities Fire, Poison; Charmed, Frightened, Poisoned', 'Senses Passive Perception 19', 'CR 19 (XP 22,000; PB +6)'] }),
    )
    expect(c.immunities).toEqual(['Fire', 'Poison'])
    expect(c.conditionImmunities).toEqual(['Charmed', 'Frightened', 'Poisoned'])
  })

  it('keeps Gear', () => {
    const c = mapSrd52(block({ header: ['Medium or Small Humanoid, Neutral', 'AC 16 Initiative +10', 'HP 97 (15d8 + 30)', 'Str 11 +0 +0 Dex 18 +4 +4 Con 14 +2 +2', 'Gear Light Crossbow, Shortsword, Studded Leather Armor', 'Senses Passive Perception 16', 'CR 8 (XP 3,900; PB +3)'] }))
    expect(c.gear).toEqual(['Light Crossbow', 'Shortsword', 'Studded Leather Armor'])
    expect(c.size).toBe('Medium or Small')
  })

  it('applies the Archmage XP errata (PDF prints 8,000; CR 12 is 8,400)', () => {
    const c = mapSrd52(block({ name: 'Archmage', header: ['Medium Humanoid, Neutral', 'AC 17 Initiative +2', 'HP 170 (31d8 + 31)', 'Str 10 +0 +0 Dex 14 +2 +2 Con 12 +1 +1', 'Senses Passive Perception 13', 'CR 12 (XP 8,000; PB +4)'] }))
    expect(c.xp).toBe(8400)
  })
})

describe('mapSrd52 sections', () => {
  const c = mapSrd52(
    block({
      name: 'Adult Red Dragon',
      header: ['Huge Dragon (Chromatic), Chaotic Evil', 'AC 19 Initiative +12', 'HP 256 (19d12 + 133)', 'Str 27 +8 +8 Dex 10 +0 +6 Con 25 +7 +7', 'Senses Passive Perception 23', 'CR 17 (XP 18,000, or 20,000 in lair; PB +6)'],
      sections: {
        Traits: [{ name: 'Legendary Resistance (3/Day, or 4/Day in Lair)', text: 'If the dragon fails a saving throw, it can choose to succeed instead.' }],
        Actions: [
          { name: 'Rend', text: 'Melee Attack Roll: +14, reach 10 ft. Hit: 13 (1d10 + 8) Slashing damage plus 5 (2d4) Fire damage.' },
          { name: 'Fire Breath (Recharge 5–6)', text: 'Dexterity Saving Throw: DC 21, each creature in a 60-foot Cone. Failure: 59 (17d6) Fire damage. Success: Half damage.' },
          { name: 'Spellcasting', text: 'The dragon casts one of the following spells, using Charisma as the spellcasting ability (spell save DC 20): At Will: Detect Magic, Scorching Ray 1/Day: Fireball' },
        ],
        'Legendary Actions': [{ name: 'Pounce', text: 'The dragon moves up to half its Speed.' }],
      },
      preamble: { 'Legendary Actions': 'Legendary Action Uses: 3 (4 in Lair).' },
    }),
  )

  it('parses an attack with two damage components', () => {
    const rend = c.actions?.find((a) => a.name === 'Rend')
    expect(rend?.kind).toBe('melee')
    expect(rend?.toHit).toBe(14)
    expect(rend?.reach).toBe(10)
    expect(rend?.damage).toEqual([
      { formula: '1d10+8', type: 'slashing' },
      { formula: '2d4', type: 'fire' },
    ])
  })

  it('parses a save action with recharge', () => {
    const breath = c.actions?.find((a) => a.name === 'Fire Breath')
    expect(breath?.kind).toBe('save')
    expect(breath?.recharge).toEqual({ type: 'dice', value: 5 })
    expect(breath?.save).toEqual({ ability: 'dex', dc: 21, onSave: 'half' })
  })

  it('lifts Spellcasting out of Actions into a structured block', () => {
    expect(c.actions?.some((a) => a.name === 'Spellcasting')).toBe(false)
    expect(c.spellcasting?.ability).toBe('cha')
    expect(c.spellcasting?.saveDc).toBe(20)
    expect(c.spellcasting?.groups[0]).toEqual({
      usage: { type: 'atWill' },
      spells: [
        { name: 'Detect Magic', ref: 'srd-5.2:detect-magic' },
        { name: 'Scorching Ray', ref: 'srd-5.2:scorching-ray' },
      ],
    })
  })

  it('parses legendary actions and resistance', () => {
    expect(c.legendaryActions?.perRound).toBe(3)
    expect(c.legendaryActions?.actions[0].name).toBe('Pounce')
    expect(c.legendaryResistance).toBe(3)
    expect(c.legendaryResistanceLair).toBe(4)
  })

  it('keeps a spell whose clarification contains commas as one entry', () => {
    const brass = mapSrd52(
      block({
        name: 'Adult Brass Dragon',
        header: ['Huge Dragon (Metallic), Chaotic Good', 'AC 18 Initiative +10', 'HP 172 (15d12 + 75)', 'CR 13 (XP 10,000; PB +5)'],
        sections: {
          Actions: [
            {
              name: 'Spellcasting',
              text: 'The dragon casts using Charisma as the spellcasting ability (spell save DC 16): At Will: Detect Magic, Minor Illusion, Scorching Ray, Shapechange (Beast or Humanoid form only, no Temporary Hit Points gained from the spell, and no Concentration or Temporary Hit Points required to maintain the spell), Speak with Animals 1/Day Each: Detect Thoughts, Control Weather',
            },
          ],
        },
      }),
    )
    expect(brass.spellcasting?.groups[0].spells.map((s) => s.name)).toEqual([
      'Detect Magic',
      'Minor Illusion',
      'Scorching Ray',
      'Shapechange',
      'Speak with Animals',
    ])
  })
})
