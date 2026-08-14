// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Estimate a creature's challenge rating from its own numbers, using the DMG's method:
 * a defensive rating from effective hit points and AC, an offensive rating from
 * three-round damage and attack bonus / save DC, averaged.
 *
 * This is a review aid for OpenFray's original libraries — it says "this block's damage
 * is priced two steps above its rating", not "the rating is wrong". It prices damage and
 * durability, which is all the DMG method prices; a creature whose threat is control
 * (Charm, Frightened, terrain) reads low here and is not necessarily mis-rated.
 */

import type { Action } from '../schema/action.ts'
import type { Creature } from '../schema/creature.ts'

/** DMG p.274: CR, top of the hit-point band, expected AC, top of the damage band,
 *  expected attack bonus, expected save DC. */
const BANDS: readonly (readonly [number, number, number, number, number, number])[] = [
  [0, 6, 13, 1, 3, 13], [0.125, 35, 13, 3, 3, 13], [0.25, 49, 13, 5, 3, 13], [0.5, 70, 13, 8, 3, 13],
  [1, 85, 13, 14, 3, 13], [2, 100, 13, 20, 3, 13], [3, 115, 13, 26, 4, 13], [4, 130, 14, 32, 5, 14],
  [5, 145, 15, 38, 6, 15], [6, 160, 15, 44, 6, 15], [7, 175, 15, 50, 6, 15], [8, 190, 16, 56, 7, 16],
  [9, 205, 16, 62, 7, 16], [10, 220, 17, 68, 7, 16], [11, 235, 17, 74, 8, 17], [12, 250, 17, 80, 8, 17],
  [13, 265, 18, 86, 8, 18], [14, 280, 18, 92, 8, 18], [15, 295, 18, 98, 8, 18], [16, 310, 18, 104, 9, 18],
  [17, 325, 19, 110, 10, 19], [18, 340, 19, 116, 10, 19], [19, 355, 19, 122, 10, 19], [20, 400, 19, 140, 10, 19],
  [21, 445, 19, 158, 11, 20], [22, 490, 19, 176, 11, 20], [23, 535, 19, 194, 11, 20], [24, 580, 19, 212, 12, 21],
]

/** First band whose hit-point ceiling covers the value; above the table, the last band. */
const bandByHp = (hp: number) => BANDS.find((b) => hp <= b[1]) ?? BANDS[BANDS.length - 1]
/** First band whose damage-per-round ceiling covers the value; above the table, the last band. */
const bandByDpr = (d: number) => BANDS.find((d2) => d <= d2[3]) ?? BANDS[BANDS.length - 1]
/** Index of the band row with exactly this CR, or 0 when the CR is not in the table. */
const rowOf = (cr: number) => Math.max(0, BANDS.findIndex((b) => b[0] === cr))
/** CR of the band row at this index, clamped to the table's ends. */
const crAt = (row: number) => BANDS[Math.max(0, Math.min(BANDS.length - 1, row))][0]

/** Average of an `NdM+K` formula, or a flat number. */
export function averageDamage(formula: string): number {
  const m = /^(\d+)d(\d+)\s*([+-]\s*\d+)?$/.exec(formula.trim())
  if (!m) return Number(formula) || 0
  return (Number(m[1]) * (Number(m[2]) + 1)) / 2 + Number((m[3] ?? '0').replace(/\s/g, ''))
}

/**
 * On-hit damage for one use of an action. Riders that tick "at the start of each of its
 * turns" are ongoing damage on an already-caught target, not part of this round's burst,
 * so they'd inflate the rating of every grappler.
 */
export function actionDamage(a: Action | undefined): number {
  if (!a) return 0
  const text = a.text ?? ''
  // Walk the prose in step with the damage list so each component is judged by its own
  // clause — the window has to stop where the next component starts, or a trailing
  // "at the start of each of its turns" would disqualify everything before it too.
  const parts = a.damage ?? []
  /** A formula as the prose prints it ("2d8+5" → "2d8 + 5"), for locating its clause. */
  const spoken = (f: string) => f.replace(/([+-])/, ' $1 ')
  const positions = parts.map((d) => {
    const at = text.indexOf(spoken(d.formula))
    return at >= 0 ? at : text.indexOf(d.formula)
  })
  return parts.reduce((sum, d, i) => {
    const start = positions[i]
    const end = positions.slice(i + 1).find((p) => p > start) ?? text.length
    const clause = start >= 0 ? text.slice(start, end) : ''
    return /at the (start|end) of each/i.test(clause) ? sum : sum + averageDamage(d.formula)
  }, 0)
}

const COUNT_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }

/** Match key for an action name: lowercased, apostrophes straightened. A curly-vs-straight
 *  mismatch between a name and the prose that cites it is otherwise a silent miss. */
const actionKey = (name: string): string => name.trim().toLowerCase().replace(/[‘’]/g, "'")

/** The action a piece of prose names, e.g. the "Rend" in "makes one Rend attack". */
const namedAction = (c: Creature, name: string): Action | undefined =>
  (c.actions ?? []).find((a) => actionKey(a.name) === actionKey(name))

/**
 * Damage of an entry that carries none of its own because it delegates — a legendary
 * "Rend. The creature makes one Rend attack." is worth a Rend, not nothing.
 */
function delegatedDamage(c: Creature, a: Action): number {
  const own = actionDamage(a)
  if (own) return own
  const m = /\b(?:makes|uses)\s+(?:one\s+)?([A-Z][A-Za-z’' -]+?)(?:\s+attack)?(?:[.,]|$)/.exec(a.text ?? '')
  return m ? actionDamage(namedAction(c, m[1])) : 0
}

/** Damage from one round of Multiattack, resolving the actions its prose names. */
export function multiattackDamage(c: Creature): number {
  const actions = c.actions ?? []
  const ma = actions.find((a) => /^multiattack$/i.test(a.name))
  // The routine is what the creature can do every round, so a recharge action is only a
  // fallback when it has nothing else — otherwise a nova would be counted as sustained.
  const best = () => {
    const sustained = actions.filter((a) => !a.recharge)
    return Math.max(0, ...(sustained.length ? sustained : actions).map(actionDamage))
  }
  if (!ma?.text) return best()

  /** Total one branch: count × named attack, plus "uses X", scaled by any "maximum of N" cap. */
  const branchDamage = (branch: string): number => {
    let total = 0
    for (const m of branch.matchAll(/\b(one|two|three|four|five|six|\d+)\s+([A-Z][A-Za-z’' -]+?)\s+attacks?/g))
      total += (COUNT_WORDS[m[1].toLowerCase()] ?? Number(m[1])) * actionDamage(namedAction(c, m[2]))
    for (const m of branch.matchAll(/\buses\s+([A-Z][A-Za-z’' -]+?)(?:[.,]|$)/g)) total += actionDamage(namedAction(c, m[1]))
    // "one Surfacing Limb attack for each limb it has raised, to a maximum of three" —
    // the count lives in the cap, not in front of the attack's name.
    const cap = /to a maximum of\s+(one|two|three|four|five|six|\d+)/i.exec(branch)
    if (cap) total *= COUNT_WORDS[cap[1].toLowerCase()] ?? Number(cap[1])
    return total
  }
  // "three Char Claw attacks, or two Char Claw attacks and uses Ruinous Glare" — the
  // creature picks one branch, so score the best of them, never the sum.
  return Math.max(...ma.text.split(/,?\s+or\s+/i).map(branchDamage)) || best()
}

/**
 * How much a damage type is actually worth resisting, by how often a party deals it.
 * Resistance to Poison is close to free; resistance to all three physical types roughly
 * halves a martial party's output. Without this weighting every Plant with Poison
 * immunity reads as a tank.
 */
function soakWeight(entry: string): number {
  const type = entry.toLowerCase()
  // "(from nonmagical attacks)" stops mattering once the party has magic weapons.
  const qualifier = /nonmagical/.test(type) ? 0.35 : 1
  if (/bludgeoning|piercing|slashing/.test(type)) return 1 * qualifier
  if (/poison|psychic/.test(type)) return 0.15 * qualifier
  return 0.4 * qualifier
}

/** Effective hit points: resistance and immunity buy survivability, less so at high CR
 *  (DMG p.277), and only in proportion to how commonly the damage shows up. */
export function effectiveHp(c: Creature): number {
  const soak =
    (c.resistances ?? []).reduce((s, r) => s + soakWeight(r), 0) +
    (c.immunities ?? []).reduce((s, i) => s + soakWeight(i) * 1.25, 0)
  if (!soak) return c.maxHp
  const cr = c.cr ?? 0
  const ceiling = cr <= 4 ? 2 : cr <= 10 ? 1.5 : cr <= 16 ? 1.25 : 1
  return Math.round(c.maxHp * (1 + (ceiling - 1) * Math.min(1, soak / 3)))
}

/**
 * Damage per round across the first three rounds: a recharge nova opens if it beats the
 * routine, then the routine repeats, plus one damaging legendary action per round.
 */
export function damagePerRound(c: Creature): number {
  const routine = multiattackDamage(c)
  const nova = Math.max(0, ...(c.actions ?? []).filter((a) => a.recharge).map(actionDamage))
  const legendary = Math.max(0, ...(c.legendaryActions?.actions ?? []).map((a) => delegatedDamage(c, a)))
  return (nova > routine ? (nova + 2 * routine) / 3 : routine) + legendary
}

export interface CrEstimate {
  defensive: number
  offensive: number
  /** The two halves averaged — compare against the block's listed `cr`. */
  estimated: number
  effectiveHp: number
  damagePerRound: number
  attackBonus: number
  saveDc: number
}

/** Rate defense (effective HP, AC) and offense (DPR, accuracy) on the DMG bands, averaged. */
export function estimateCr(c: Creature): CrEstimate {
  const offensive = [...(c.actions ?? []), ...(c.legendaryActions?.actions ?? [])]
  const attackBonus = Math.max(0, ...offensive.map((a) => a.toHit ?? 0))
  const saveDc = Math.max(0, ...offensive.map((a) => a.save?.dc ?? 0))

  const ehp = effectiveHp(c)
  const defBand = bandByHp(ehp)
  // Every 2 points of AC off the band's expectation moves the rating a step.
  const defensive = crAt(rowOf(defBand[0]) + Math.round((c.ac - defBand[2]) / 2))

  const dpr = damagePerRound(c)
  const offBand = bandByDpr(dpr)
  const accuracy = attackBonus > 0 ? (attackBonus - offBand[4]) / 2 : saveDc > 0 ? (saveDc - offBand[5]) / 2 : 0
  const offRating = crAt(rowOf(offBand[0]) + Math.round(accuracy))

  return {
    defensive,
    offensive: offRating,
    estimated: (defensive + offRating) / 2,
    effectiveHp: ehp,
    damagePerRound: Math.round(dpr),
    attackBonus,
    saveDc,
  }
}
