// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Action, Recharge } from '../schema/action.ts'
import type { Ability, Size } from '../schema/primitives.ts'
import type { Creature } from '../schema/creature.ts'
import { flattenMarkdown, toBlock, type Open5eCreature } from './open5eCcdx.ts'
import { mapTob3 } from './tob3.ts'
import type { LegacyRecord } from './open5ePreparation.ts'

export const OPEN5E_SIZES: readonly Size[] = ['Tiny', 'Small', 'Medium or Small', 'Medium', 'Large', 'Huge', 'Gargantuan']

export const OPEN5E_ABILITIES: Record<string, Ability> = {
  strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha',
}

export interface Open5eAction {
  name?: string
  desc?: string
  action_type?: string
  order_in_statblock?: number
  legendary_action_cost?: number | null
  usage_limits?: { type: string; param: number } | null
  attacks?: { to_hit_mod?: number; reach?: number | null; range?: number | null; long_range?: number | null }[]
}

export interface Open5eRecord extends Open5eCreature {
  document: { key: string }
  actions?: Open5eAction[]
  speed_all?: { hover?: boolean }
  initiative_bonus?: number | null
  modifiers?: Record<string, number>
  legacy?: LegacyRecord
}

const ACTION_FIELDS = {
  ACTION: 'actions', BONUS_ACTION: 'bonusActions', REACTION: 'reactions', LAIR_ACTION: 'lairActions',
} as const
const INTRO = /can take (\d+) legendary actions/i

/** Expand abbreviated saves for the shared prose parser without changing source semantics. */
function mechanicsText(text: string): string {
  return flattenMarkdown(text.replace(/<br\s*\/?\s*>/gi, '\n'))
    .replace(/DC\s+(\d+)\s+(STR|DEX|CON|INT|WIS|CHA)\s+save\b/gi, (_, dc, ability: string) => {
      const full = Object.keys(OPEN5E_ABILITIES).find((k) => k.startsWith(ability.toLowerCase()))!
      return `DC ${dc} ${full[0].toUpperCase()}${full.slice(1)} saving throw`
    })
}

/** Restore usage and legendary costs that Open5e strips out of action names. */
function actionName(action: Open5eAction): string {
  let name = action.name ?? ''
  const usage = action.usage_limits
  if (usage && !/\(Recharge|\d+\s*\/\s*Day/i.test(name)) {
    if (usage.type === 'RECHARGE_ON_ROLL') name += ` (Recharge ${usage.param}–6)`
    if (usage.type === 'PER_DAY') name += ` (${usage.param}/Day)`
  }
  if (action.action_type === 'LEGENDARY_ACTION' && action.legendary_action_cost != null && !/Costs?\s+\d+/i.test(name)) {
    name += ` (Costs ${action.legendary_action_cost} Actions)`
  }
  return name
}

/** Recover tracked usage from a structured Open5e action. */
function recharge(usage: Open5eAction['usage_limits']): Recharge | undefined {
  if (usage?.type === 'RECHARGE_ON_ROLL') return { type: 'dice', value: usage.param }
  if (usage?.type === 'PER_DAY') return { type: 'perDay', value: usage.param }
  return undefined
}

/** Find a mapped action by its display name after removing tracked metadata. */
export function mappedAction(creature: Creature, original: Open5eAction): Action | undefined {
  const name = (original.name ?? '').replace(/\(Costs?\s+\d+\s+Actions?\)|\(Recharge\s+\d(?:\s*[–-]\s*\d)?\)|\(\d+\s*\/\s*Day\)/gi, '').trim()
  const type = original.action_type ?? 'ACTION'
  const actions = type === 'LEGENDARY_ACTION' ? creature.legendaryActions?.actions
    : creature[ACTION_FIELDS[type as keyof typeof ACTION_FIELDS]]
  return actions?.find((action) => action.name === name)
}

/** Map structured Open5e records while retaining their numeric values and mechanics prose. */
export function mapOpen5e(record: Open5eRecord, source: string): Creature {
  if (!OPEN5E_SIZES.includes(record.size?.name as Size)) throw new Error(`Unsupported creature size: ${record.key}: ${record.size?.name}`)
  const introductions = (record.actions ?? []).filter((a) => a.action_type === 'LEGENDARY_ACTION' && INTRO.test(a.name ?? ''))
  const normalized: Open5eRecord = {
    ...record,
    traits: record.traits?.map((t) => ({ ...t, name: t.name?.trim(), desc: mechanicsText(t.desc ?? '') })),
    actions: record.actions?.filter((a) => !introductions.includes(a)).map((a) => ({
      ...a, name: actionName(a), desc: mechanicsText(a.desc ?? ''),
    })),
  }
  const block = toBlock(normalized)
  // The shared mapper removes Spellcasting actions even when parsing fails.
  const casting = block.sections.Actions?.filter((a) => /^Spellcasting$/i.test(a.name)) ?? []
  const creature = mapTob3(block, source)
  creature.name = record.name
  creature.size = record.size!.name as Size
  creature.type = record.type!.name!.toLowerCase()
  creature.ac = record.armor_class!
  creature.maxHp = record.hit_points!
  creature.cr = record.challenge_rating
  creature.abilities = Object.fromEntries(Object.entries(OPEN5E_ABILITIES)
    .map(([full, short]) => [short, record.ability_scores![full]])) as Creature['abilities']
  if (record.initiative_bonus != null) creature.initiative = record.initiative_bonus
  if (record.hit_dice) creature.hpFormula = record.hit_dice.replace(/\s+/g, '')
  else delete creature.hpFormula
  if (record.experience_points != null) creature.xp = record.experience_points
  if (record.saving_throws) {
    creature.saves = Object.fromEntries(Object.entries(record.saving_throws)
      .filter(([full, value]) => Object.hasOwn(OPEN5E_ABILITIES, full)
        && value !== Math.floor((record.ability_scores![full] - 10) / 2))
      .map(([full, value]) => [OPEN5E_ABILITIES[full], value]))
    if (!Object.keys(creature.saves).length) delete creature.saves
  }
  if (record.speed_all?.hover && creature.speed.fly) creature.speed.hover = true
  if (record.legacy?.page_no && record.legacy.page_no > 0) creature.sourcePage = record.legacy.page_no
  if (!record.alignment) delete creature.alignment
  if (record.document.key === 'bfrd') {
    // Black Flag has no alignment or ability scores; do not present v2's invented alignment.
    delete creature.alignment
    if (record.legacy?.perception != null) {
      creature.senses.passivePerception = record.legacy.perception
      creature.skills = { ...creature.skills, perception: record.legacy.perception - 10 }
    }
  }

  for (const trait of normalized.traits ?? []) {
    if (/spellcasting/i.test(trait.name ?? '') && !creature.traits?.some((t) => t.name === trait.name)) {
      (creature.traits ??= []).push({ name: trait.name!, text: trait.desc! })
    }
  }
  for (const action of casting) {
    (creature.actions ??= []).push({ id: 'spellcasting', name: action.name, text: action.text, kind: 'utility', toHit: null })
  }
  const legacyBudget = INTRO.exec(record.legacy?.legendary_desc ?? '')
  if (creature.legendaryActions && (introductions.length || legacyBudget)) {
    const budgets = introductions.map((a) => Number(INTRO.exec(a.name!)![1]))
    if (legacyBudget) budgets.push(Number(legacyBudget[1]))
    if (new Set(budgets).size !== 1) throw new Error(`Conflicting legendary budgets: ${record.key}`)
    creature.legendaryActions.perRound = budgets[0]
  }
  for (const original of record.actions ?? []) {
    const mapped = mappedAction(creature, original)
    if (!mapped) continue
    const use = recharge(original.usage_limits)
    if (use) mapped.recharge = use
    if (original.legendary_action_cost != null) mapped.legendaryCost = original.legendary_action_cost
    // Prose is the damage authority: Open5e sometimes puts the primary type in extra_damage_type.
    if (original.attacks?.length === 1) {
      const attack = original.attacks[0]
      if (attack.to_hit_mod != null) mapped.toHit = attack.to_hit_mod
      if (attack.reach != null) mapped.reach = attack.reach
      if (attack.range != null) mapped.range = {
        normal: attack.range, ...(attack.long_range != null ? { long: attack.long_range } : {}),
      }
      if (mapped.toHit != null) mapped.kind = attack.range != null && attack.reach == null ? 'ranged' : 'melee'
    }
  }
  return creature
}

/** Detect lost entries and unsupported mechanics without granting publishing approval. */
export function auditOpen5e(record: Open5eRecord, creature: Creature): string[] {
  const issues: string[] = []
  if (record.document.key === 'a5e-mm' && record.traits?.some((t) => /Elite Recovery/i.test(t.name ?? ''))) {
    issues.push('Elite monster: verify the XP multiplier and CR-dependent mechanics against the publisher.')
  }
  for (const [mode, value] of Object.entries(record.speed ?? {})) {
    if (typeof value === 'number' && creature.speed[mode as keyof Creature['speed']] !== value) {
      issues.push(`Unmapped speed: ${mode}: ${value}`)
    }
  }
  const supported = new Set([...Object.keys(ACTION_FIELDS), 'LEGENDARY_ACTION'])
  for (const action of record.actions ?? []) {
    if (action.action_type === 'LEGENDARY_ACTION' && INTRO.test(action.name ?? '')) continue
    if (!supported.has(action.action_type ?? 'ACTION')) issues.push(`Unsupported action section: ${action.action_type}`)
    const mapped = mappedAction(creature, action)
    if (!mapped) { issues.push(`Missing mapped action: ${action.name}`); continue }
    if (action.usage_limits && !recharge(action.usage_limits)) issues.push(`Unsupported usage: ${action.name}: ${action.usage_limits.type}`)
    if (action.attacks && action.attacks.length > 1) issues.push(`Multiple structured attacks need review: ${action.name}`)
    const rawDice = [...mechanicsText(action.desc ?? '').matchAll(/\b\d+\s*\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)\s+(\w+)\s+damage/gi)]
    for (const match of rawDice) {
      if (!mapped.damage?.some((d) => d.formula === match[1].replace(/\s+/g, '') && d.type === match[2].toLowerCase())) {
        issues.push(`Missing damage roll: ${action.name}: ${match[1]} ${match[2]}`)
      }
    }
    if (mapped.text !== mechanicsText(action.desc ?? '')) issues.push(`Action prose changed or split: ${action.name}`)
  }
  for (const trait of record.traits ?? []) {
    if (!creature.traits?.some((t) => t.name === trait.name?.trim())) issues.push(`Missing mapped trait: ${trait.name}`)
  }
  return issues
}
