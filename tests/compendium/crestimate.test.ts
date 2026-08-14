// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import type { Action } from '../../src/schema/action.ts'
import type { Creature } from '../../src/schema/creature.ts'
import {
  actionDamage,
  averageDamage,
  damagePerRound,
  effectiveHp,
  estimateCr,
  multiattackDamage,
} from '../../src/compendium/crestimate.ts'

function base(over: Partial<Creature> = {}): Creature {
  return {
    id: 'openfray-test:thing',
    source: 'openfray-test',
    name: 'Thing',
    size: 'Large',
    type: 'plant',
    ac: 15,
    maxHp: 140,
    speed: { walk: 30 },
    cr: 5,
    abilities: { str: 16, dex: 10, con: 16, int: 6, wis: 10, cha: 6 },
    senses: { passivePerception: 10 },
    ...over,
  }
}

const attack = (name: string, formula: string, text: string): Action => ({
  id: name.toLowerCase(),
  name,
  kind: 'melee',
  toHit: 6,
  damage: [{ formula, type: 'slashing' }],
  text,
})

describe('averageDamage', () => {
  it('averages dice with and without a modifier, and passes flat damage through', () => {
    expect(averageDamage('2d8')).toBe(9)
    expect(averageDamage('3d6+4')).toBe(14.5)
    expect(averageDamage('1')).toBe(1)
  })
})

describe('actionDamage', () => {
  it('sums every damage component of one hit', () => {
    const a = attack('Lash', '2d6+4', 'Hit: 11 (2d6 + 4) Slashing damage plus 7 (2d6) Fire damage.')
    a.damage!.push({ formula: '2d6', type: 'fire' })
    expect(actionDamage(a)).toBe(18)
  })

  it('ignores a rider that ticks at the start of each turn — that is ongoing, not burst', () => {
    const a = attack('Grab', '2d6', 'Hit: 7 (2d6) Slashing damage, and it takes 21 (6d6) Acid damage at the start of each of its turns.')
    a.damage!.push({ formula: '6d6', type: 'acid' })
    expect(actionDamage(a)).toBe(7)
  })
})

describe('multiattackDamage', () => {
  const lash = attack('Lash', '2d6+4', 'Hit: 11 (2d6 + 4) Slashing damage.') // 11
  const bite = attack('Bite', '2d10+4', 'Hit: 15 (2d10 + 4) Slashing damage.') // 15

  it('resolves the actions the prose names', () => {
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes two Lash attacks and one Bite attack.' }
    expect(multiattackDamage(base({ actions: [ma, lash, bite] }))).toBe(37)
  })

  it('scores the best branch of an either/or Multiattack, never the sum', () => {
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes three Lash attacks, or one Lash attack and one Bite attack.' }
    expect(multiattackDamage(base({ actions: [ma, lash, bite] }))).toBe(33)
  })

  it('falls back to the hardest single action when there is no Multiattack', () => {
    expect(multiattackDamage(base({ actions: [lash, bite] }))).toBe(15)
  })

  it('reads a possessive action name through either apostrophe', () => {
    const blade = attack('Lector’s Blade', '2d8+3', 'Hit: 12 (2d8 + 3) Slashing damage.') // 12
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes three Lector’s Blade attacks.' }
    expect(multiattackDamage(base({ actions: [ma, blade] }))).toBe(36)
    const straight = { ...ma, text: "It makes three Lector's Blade attacks." }
    expect(multiattackDamage(base({ actions: [straight, blade] }))).toBe(36)
  })
})

describe('damagePerRound', () => {
  it('opens with a recharge nova only when it beats the routine', () => {
    const lash = attack('Lash', '2d6', 'Hit: 7 (2d6) Slashing damage.') // 7
    const nova = { ...attack('Blast', '12d6', 'Failure: 42 (12d6) Fire damage.'), recharge: { type: 'dice' as const, value: 5 } } // 42
    // Rounds: 42, 7, 7 → 18.67
    expect(damagePerRound(base({ actions: [lash, nova] }))).toBeCloseTo(18.67, 1)
  })
})

describe('effectiveHp', () => {
  it('leaves a creature with no damage soak alone', () => {
    expect(effectiveHp(base())).toBe(140)
  })

  it('prices physical resistance far above Poison immunity — a party deals one constantly', () => {
    const physical = effectiveHp(base({ resistances: ['Bludgeoning', 'Piercing', 'Slashing'] }))
    const poison = effectiveHp(base({ immunities: ['Poison'] }))
    expect(physical).toBeGreaterThan(poison)
    expect(poison).toBeLessThan(155) // barely moves the rating
  })

  it('discounts resistance that only holds against nonmagical attacks', () => {
    const plain = effectiveHp(base({ resistances: ['Slashing'] }))
    const qualified = effectiveHp(base({ resistances: ['Slashing (from nonmagical attacks)'] }))
    expect(qualified).toBeLessThan(plain)
  })
})

describe('estimateCr', () => {
  it('rates a block that matches its band at its listed CR', () => {
    // CR 5 wants ~131-145 hp, AC 15, 33-38 damage, attack +6.
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes three Lash attacks.' }
    const lash = attack('Lash', '2d8+3', 'Hit: 12 (2d8 + 3) Slashing damage.') // 12 × 3 = 36
    expect(estimateCr(base({ actions: [ma, lash] })).estimated).toBe(5)
  })

  it('rates a glass cannon above its hit points and below its damage', () => {
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes three Lash attacks.' }
    const lash = attack('Lash', '4d10+6', 'Hit: 28 (4d10 + 6) Slashing damage.')
    const e = estimateCr(base({ maxHp: 40, actions: [ma, lash] }))
    expect(e.defensive).toBeLessThan(e.offensive)
  })
})

describe('delegated attacks', () => {
  const rend = attack('Rend', '4d10+9', 'Melee Attack Roll: +16, reach 20 ft. Hit: 31 (4d10 + 9) Bludgeoning damage.') // 31

  it('scores a legendary action that just repeats one of the creature’s attacks', () => {
    const legendary = { id: 'rend', name: 'Rend', kind: 'utility' as const, toHit: null, text: 'The creature makes one Rend attack.' }
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes two Rend attacks.' }
    const c = base({ actions: [ma, rend], legendaryActions: { perRound: 3, actions: [legendary] } })
    expect(damagePerRound(c)).toBe(31 * 3) // two in the routine, one legendary
  })

  it('reads a count expressed as a cap rather than in front of the attack', () => {
    const ma = { id: 'multiattack', name: 'Multiattack', kind: 'utility' as const, toHit: null, text: 'It makes one Rend attack for each limb it has raised, to a maximum of three.' }
    expect(multiattackDamage(base({ actions: [ma, rend] }))).toBe(31 * 3)
  })
})
