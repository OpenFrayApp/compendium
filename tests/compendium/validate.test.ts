// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import type { Creature } from '../../src/schema/creature.ts'
import type { Spell } from '../../src/schema/spell.ts'
import {
  diffDatasets,
  hpFromFormula,
  proficiencyBonus,
  validateCreature,
  validateSpell,
} from '../../src/compendium/validate.ts'

/** A self-consistent CR-10 creature: saves = mod + PB(4), XP = table, HP = formula avg. */
function base(): Creature {
  return {
    id: 'srd-5.2:test',
    source: 'srd-5.2',
    edition: '5.5',
    name: 'Test',
    size: 'Large',
    type: 'aberration',
    alignment: 'lawful evil',
    ac: 17,
    maxHp: 150,
    hpFormula: '20d10+40',
    initiative: 7,
    speed: { walk: 10, swim: 40 },
    abilities: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
    saves: { dex: 3, con: 6, int: 8, wis: 6 }, // mod + PB(4)
    senses: { passivePerception: 12 }, // 10 + Wis mod (+2)
    cr: 10,
    xp: 5900,
  }
}

const errs = (c: Creature) => validateCreature(c).filter((i) => i.severity === 'error')
const fields = (c: Creature) => validateCreature(c).map((i) => i.field)

describe('helpers', () => {
  it('proficiencyBonus follows the CR table', () => {
    expect(proficiencyBonus(0)).toBe(2)
    expect(proficiencyBonus(4)).toBe(2)
    expect(proficiencyBonus(5)).toBe(3)
    expect(proficiencyBonus(10)).toBe(4)
    expect(proficiencyBonus(16)).toBe(5)
    expect(proficiencyBonus(20)).toBe(6)
    expect(proficiencyBonus(24)).toBe(7)
    expect(proficiencyBonus(30)).toBe(9)
  })

  it('hpFromFormula averages dice + modifier, floored', () => {
    expect(hpFromFormula('20d10+40')).toBe(150)
    expect(hpFromFormula('1d8')).toBe(4)
    expect(hpFromFormula('2d6-2')).toBe(5)
    expect(hpFromFormula('garbage')).toBeNull()
  })
})

describe('validateCreature invariants', () => {
  it('passes a self-consistent creature with no errors or warnings', () => {
    expect(validateCreature(base())).toEqual([])
  })

  it('flags a save that is not mod + proficiency bonus', () => {
    const c = base()
    c.saves!.con = 7 // should be 6
    expect(errs(c).map((i) => i.field)).toContain('saves.con')
  })

  it('flags XP that does not match the CR table', () => {
    const c = base()
    c.xp = 5000 // CR 10 is 5900
    expect(errs(c).map((i) => i.field)).toContain('xp')
  })

  it('flags maxHp that does not match the dice formula', () => {
    const c = base()
    c.maxHp = 140 // 20d10+40 averages 150
    expect(errs(c).map((i) => i.field)).toContain('hpFormula')
  })

  it('flags out-of-range ability scores', () => {
    const c = base()
    c.abilities.con = 0
    expect(errs(c).map((i) => i.field)).toContain('abilities.con')
  })

  it('warns (not errors) on missing alignment', () => {
    const c = base()
    delete c.alignment
    const issues = validateCreature(c)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ field: 'alignment', severity: 'warn' })
  })

  it('warns when passive perception is inconsistent with Perception', () => {
    const c = base()
    c.senses.passivePerception = 20 // expected 12
    expect(fields(c)).toContain('senses.passivePerception')
  })
})

/** A self-consistent 2nd-level spell: no Concentration, no ritual, no scaling. */
function spell(over: Partial<Spell> = {}): Spell {
  return {
    id: 'srd-5.2:test-spell',
    source: 'srd-5.2',
    edition: '5.5',
    name: 'Test Spell',
    level: 2,
    school: 'Evocation',
    castingTime: 'Action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    text: 'It does a thing.',
    ...over,
  }
}

describe('validateSpell', () => {
  const fields = (s: Spell) => validateSpell(s).map((i) => i.field)

  it('passes a self-consistent spell', () => {
    expect(validateSpell(spell())).toEqual([])
  })

  it('requires a Concentration spell to state its duration as "up to …"', () => {
    expect(fields(spell({ concentration: true, duration: '1 minute' }))).toContain('duration')
    expect(fields(spell({ concentration: true, duration: 'up to 1 minute' }))).not.toContain('duration')
  })

  it('rejects a duration that repeats the word the card already prints', () => {
    expect(fields(spell({ concentration: true, duration: 'up to 1 minute, Concentration' }))).toContain('duration')
  })

  it('holds the ritual flag and the casting time to the same story', () => {
    expect(fields(spell({ ritual: true }))).toContain('ritual')
    expect(fields(spell({ ritual: true, castingTime: 'Action or Ritual' }))).not.toContain('ritual')
  })

  it('rejects slot scaling that is not above the spell’s own level', () => {
    const damage = [{ formula: '4d6', type: 'fire' as const }]
    expect(
      fields(spell({ mechanics: { scaling: [{ level: 2, by: 'slot', damage }] } })),
    ).toContain('mechanics.scaling')
  })

  it('rejects character scaling on anything but a cantrip', () => {
    const damage = [{ formula: '2d10', type: 'fire' as const }]
    expect(fields(spell({ mechanics: { scaling: [{ level: 5, by: 'character', damage }] } }))).toContain(
      'mechanics.scaling',
    )
    expect(
      fields(spell({ level: 0, mechanics: { scaling: [{ level: 5, by: 'character', damage }] } })),
    ).not.toContain('mechanics.scaling')
  })

  it('warns when the material flag and the material text disagree', () => {
    expect(fields(spell({ components: { verbal: true, somatic: true, material: true } }))).toContain(
      'components',
    )
  })
})

describe('diffDatasets', () => {
  it('reports field differences and coverage gaps, matching by name', () => {
    const candidate = [base()]
    const refMissingAlignment = { ...base() }
    delete refMissingAlignment.alignment
    const extra = { ...base(), id: 'srd-5.2:ref-only', name: 'Ref Only' }
    const report = diffDatasets(candidate, [refMissingAlignment, extra])

    expect(report.matched).toBe(1)
    expect(report.onlyInReference).toEqual(['Ref Only'])
    expect(report.onlyInCandidate).toEqual([])
    expect(report.diffs).toEqual([
      { name: 'Test', field: 'alignment', candidate: 'lawful evil', reference: null },
    ])
  })

  it('finds zero diffs for identical datasets', () => {
    const ds = [base()]
    const report = diffDatasets(ds, ds.map((c) => ({ ...c })))
    expect(report.diffs).toEqual([])
    expect(report.matched).toBe(1)
  })
})
