// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { mapTob3, type Tob3Block } from '../../src/compendium/tob3.ts'

const block = (over: Partial<Tob3Block>): Tob3Block => ({
  name: 'Test',
  sourcePage: 10,
  header: ['Large Aberration, Chaotic Evil'],
  traits: [],
  sections: {},
  ...over,
})

describe('mapTob3 spellcasting', () => {
  const c = mapTob3(
    block({
      name: 'Adult Prismatic Dragon',
      sections: {
        Actions: [
          {
            name: 'Spellcasting',
            text: '. The prismatic dragon casts one of the following spells, requiring no material components and using Intelligence as the spellcasting ability (spell save DC 17): At will: charm person, color spray 1/day: prismatic wall',
          },
        ],
      },
    }),
  )

  it('lifts a Spellcasting action into the structured block', () => {
    expect(c.spellcasting?.ability).toBe('int')
    expect(c.spellcasting?.saveDc).toBe(17)
    expect(c.spellcasting?.groups[0].usage).toEqual({ type: 'atWill' })
    expect(c.spellcasting?.groups[0].spells.map((s) => s.name)).toEqual(['charm person', 'color spray'])
    expect(c.spellcasting?.groups[1].usage).toEqual({ type: 'perDay', per: 1 })
  })

  it('removes Spellcasting from the plain action list', () => {
    expect(c.actions ?? []).not.toContainEqual(expect.objectContaining({ name: 'Spellcasting' }))
  })
})

describe('mapTob3 bulleted "choose one" actions', () => {
  const c = mapTob3(
    block({
      name: 'Ahu-Nixta Mechanon',
      sections: {
        Actions: [
          {
            name: 'Utility Arm',
            text:
              'The mechanon has one of the following attack options: ' +
              '•\t Grabbing Claw. Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 8 (2d4 + 3) piercing damage. ' +
              '•\t Sonic Disruptor. Ranged Spell Attack: +4 to hit, range 60 ft., one target. Hit: 9 (2d6 + 2) thunder damage. ' +
              '•\t Telekinetic Projector. The mechanon fires a ray. The target must succeed on a DC 13 Strength saving throw or be moved 30 feet.',
          },
        ],
      },
    }),
  )

  it('keeps a framing parent and adds a clickable sub-action per option', () => {
    const names = (c.actions ?? []).map((a) => a.name)
    expect(names).toEqual(['Utility Arm', 'Grabbing Claw', 'Sonic Disruptor', 'Telekinetic Projector'])
  })

  it('parses each option as its real attack/save', () => {
    const by = (n: string) => (c.actions ?? []).find((a) => a.name === n)!
    expect(by('Grabbing Claw').kind).toBe('melee')
    expect(by('Grabbing Claw').toHit).toBe(5)
    expect(by('Sonic Disruptor').kind).toBe('ranged')
    expect(by('Telekinetic Projector').kind).toBe('save')
    expect(by('Telekinetic Projector').save?.dc).toBe(13)
  })
})

describe('mapTob3 recharge "choose one" (breath weapon)', () => {
  const c = mapTob3(
    block({
      name: 'Adult Prismatic Dragon',
      sections: {
        Actions: [
          {
            name: 'Breath Weapon (Recharge 5–6)',
            text:
              '. The prismatic dragon uses one of the following breath weapons: ' +
              '• Light Beam. Each creature in a 90-foot line must make a DC 19 Dexterity saving throw, taking 45 (10d8) radiant damage on a failed save, or half as much on a success. ' +
              '• Rainbow Blast. Each creature in a 60-foot cone must make a DC 19 Dexterity saving throw, taking 36 (8d8) damage on a failed save, or half as much on a success.',
          },
        ],
      },
    }),
  )
  const by = (n: string) => (c.actions ?? []).find((a) => a.name === n)!

  it('puts the recharge on the rollable options, not the framing parent', () => {
    // Parent is framing only — no recharge to strand (it is not usable).
    expect(by('Breath Weapon').recharge).toBeUndefined()
    expect(by('Light Beam').recharge).toEqual({ type: 'dice', value: 5 })
    expect(by('Rainbow Blast').recharge).toEqual({ type: 'dice', value: 5 })
  })

  it('keeps each option a rollable save', () => {
    expect(by('Light Beam').kind).toBe('save')
    expect(by('Light Beam').save?.dc).toBe(19)
    expect(by('Rainbow Blast').kind).toBe('save')
  })
})

describe('mapTob3 prose tidy', () => {
  it('strips the leading "." the extractor leaves on a split entry', () => {
    const c = mapTob3(
      block({
        sections: { Actions: [{ name: 'Frightful Presence', text: '. Each creature must save.' }] },
      }),
    )
    expect(c.actions?.[0].text).toBe('Each creature must save.')
  })
})

describe('mapTob3 ToB 2 trait spellcasting (2014 format)', () => {
  it('lifts an innate trait ("ability is X") into structured groups', () => {
    const c = mapTob3(
      block({
        name: 'Angel',
        traits: [
          {
            name: 'Innate Spellcasting',
            text: "The angel's spellcasting ability is Charisma (spell save DC 19). It can innately cast the following spells: At will: detect evil and good, invisibility (self only) 3/day each: calm emotions 1/day: holy aura",
          },
        ],
      }),
      'kobold-press-tob2',
    )
    expect(c.id).toBe('kobold-press-tob2:angel')
    expect(c.spellcasting?.ability).toBe('cha')
    expect(c.spellcasting?.saveDc).toBe(19)
    // ToB 2 is 5.0 — cast spells link to the 5.1 library.
    expect(c.spellcasting?.groups[0]).toEqual({
      usage: { type: 'atWill' },
      spells: [
        { name: 'detect evil and good', ref: 'srd-5.1:detect-evil-and-good' },
        { name: 'invisibility', ref: 'srd-5.1:invisibility' },
      ],
    })
    expect(c.spellcasting?.groups[1].usage).toEqual({ type: 'perDay', per: 3 })
    expect(c.spellcasting?.groups[2].usage).toEqual({ type: 'perDay', per: 1 })
    // The prose trait is consumed, not left behind.
    expect((c.traits ?? []).some((t) => /spellcasting/i.test(t.name))).toBe(false)
  })

  it('lifts a slot-based caster into per-level slot pools', () => {
    const c = mapTob3(
      block({
        name: 'Savant',
        traits: [
          {
            name: 'Spellcasting',
            text: 'The savant is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 15, +8 to hit with spell attacks). The savant has the following wizard spells prepared: Cantrips (at will): fire bolt, light 1st level (4 slots): magic missile, shield 2nd level (3 slots): misty step',
          },
        ],
      }),
      'kobold-press-tob2',
    )
    expect(c.spellcasting?.ability).toBe('int')
    expect(c.spellcasting?.toHit).toBe(8)
    expect(c.spellcasting?.slots).toEqual({ '1': 4, '2': 3 })
    expect(c.spellcasting?.groups.find((g) => g.usage.type === 'atWill')?.spells.map((s) => s.name)).toEqual(['fire bolt', 'light'])
    expect(c.spellcasting?.groups.find((g) => g.usage.type === 'slots' && g.usage.level === 1)?.spells.map((s) => s.name)).toEqual(['magic missile', 'shield'])
  })
})
