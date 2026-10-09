// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Creature } from '../schema/creature.ts'
import { OPEN5E_ABILITIES, type Open5eRecord } from './open5e.ts'
import { validateDataset, type ValidationException } from './validate.ts'

const REASON = 'Retain the Open5e value provisionally at the maintainer’s request; no primary-source confirmation is available.'
const API = 'https://api.open5e.com/v2/creatures/'

const RETAINED: ValidationException[] = [
  { id: 'en-publishing-a5e-mm:miremuck-goblin-king', source: 'en-publishing-a5e-mm', field: 'hpFormula', maxHp: 62, formula: '8d8+16', reason: REASON, evidence: `${API}a5e-mm_miremuck-goblin-king/` },
  { id: 'en-publishing-a5e-mm:yobbo', source: 'en-publishing-a5e-mm', field: 'hpFormula', maxHp: 11, formula: '3d6', reason: REASON, evidence: `${API}a5e-mm_yobbo/` },
  { id: 'kobold-press-tob-2023:soul-eater', source: 'kobold-press-tob-2023', field: 'save', ability: 'con', score: 17, cr: 7, value: 5, reason: REASON, evidence: `${API}tob-2023_soul-eater/` },
  ...([
    ['stoneguard', 'str', 18, 7, 8], ['stoneguard', 'con', 20, 7, 9], ['stoneguard', 'wis', 14, 7, 6],
    ['waverider', 'con', 12, 4, 4], ['waverider', 'wis', 16, 4, 6],
  ] as const).map(([name, ability, score, cr, value]): ValidationException => ({
    id: `green-ronin-tdcs:${name}`, source: 'green-ronin-tdcs', field: 'save', ability, score, cr, value,
    reason: REASON, evidence: `${API}tdcs_${name}/`,
  })),
]

/** Label exact retained API findings without downgrading the strict validation report. */
export function provisionalFindings(creatures: Creature[]) {
  return validateDataset(creatures, RETAINED).issues.filter((issue) => issue.review)
    .map(({ review, ...issue }) => ({
      ...issue, severity: 'error' as const, status: 'unverified-open5e' as const,
      reason: review!.reason, evidence: review!.evidence,
    }))
}

const RULES = 'https://bfrd.net/rules/monsters#ability-modifiers'
const CHECKED = {
  bfrd_aboleth: { modifiers: [5, -1, 6, 8, 6, 4], perception: 20, stealth: 9, url: 'https://bfrd.net/creatures/aboleth' },
  'bfrd_ancient-red-dragon': { modifiers: [10, 7, 16, 4, 9, 13], perception: 26, stealth: 17, url: 'https://bfrd.net/creatures/ancient-red-dragon' },
} as const

/** Preserve Black Flag check/save modifiers outside the score-based Creature schema. */
export function blackFlagStatistics(record: Open5eRecord, creature: Creature) {
  const modifiers = Object.fromEntries(Object.entries(OPEN5E_ABILITIES)
    .map(([full, short]) => [short, record.modifiers?.[full] ?? null]))
  const checked = CHECKED[record.key as keyof typeof CHECKED]
  const perception = record.legacy?.perception ?? null
  const matches = checked && perception === checked.perception
    && Object.values(modifiers).every((value, index) => value === checked.modifiers[index])
  const findings: string[] = []
  if (Object.values(modifiers).some((value) => value === null)) findings.push('Missing Open5e ability modifiers; do not infer them from synthesized scores.')
  if (perception === null) findings.push('Missing v1 Perception value; do not infer it from the proficiency-inclusive WIS modifier.')
  if (checked && !matches) findings.push('Publisher-checked statistics differ from this snapshot; reverify before applying the source evidence.')
  if (!matches) findings.push('Stealth value is unavailable or unverified; do not infer it from the proficiency-inclusive DEX modifier.')
  return {
    id: creature.id, key: record.key, name: record.name,
    representation: 'black-flag-check-save-modifiers' as const,
    rulesEvidence: RULES,
    modifiers,
    perception,
    stealth: matches ? checked.stealth : null,
    evidence: matches ? checked.url : `${API}${record.key}/`,
    status: matches ? 'publisher-checked-statistics' as const : 'unverified-open5e' as const,
    synthesizedScores: { ...creature.abilities },
    findings,
  }
}
