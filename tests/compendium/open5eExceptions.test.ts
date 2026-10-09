// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import type { Creature } from '../../src/schema/creature.ts'
import { OPEN5E_VALIDATION_EXCEPTIONS } from '../../src/compendium/open5eExceptions.ts'
import { validateDataset, type ValidationException } from '../../src/compendium/validate.ts'

/** Build a creature with exactly the inputs guarded by a reviewed exception. */
function creature(exception: ValidationException): Creature {
  const c: Creature = {
    id: exception.id, source: exception.source, name: 'Reviewed Creature',
    size: 'Medium', type: 'beast', ac: 10, maxHp: 4, speed: { walk: 30 },
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    senses: { passivePerception: 10 },
  }
  if (exception.field === 'save') {
    c.cr = exception.cr
    c.abilities[exception.ability] = exception.score
    c.saves = { [exception.ability]: exception.value }
  } else {
    c.maxHp = exception.maxHp
    c.hpFormula = exception.formula
  }
  return c
}

/** Resolve the validator field associated with an exception. */
function field(exception: ValidationException): string {
  return exception.field === 'save' ? `saves.${exception.ability}` : 'hpFormula'
}

describe('reviewed published exceptions', () => {
  it('keeps default validation strict and exposes each cited exception as a warning', () => {
    for (const exception of OPEN5E_VALIDATION_EXCEPTIONS) {
      const c = creature(exception)
      const strict = validateDataset([c])
      expect(strict.issues.some((issue) => issue.field === field(exception) && issue.severity === 'error'), exception.id).toBe(true)
      const reviewed = validateDataset([c], OPEN5E_VALIDATION_EXCEPTIONS)
      const issue = reviewed.issues.find((issue) => issue.field === field(exception))
      expect(issue?.severity, exception.id).toBe('warn')
      expect(issue?.review?.evidence).toBe(exception.evidence)
      expect(issue?.review?.reason).toBe(exception.reason)
      expect(c).toEqual(creature(exception))
    }
  })

  it('does not waive changed IDs, sources, or any changed arithmetic input', () => {
    for (const exception of OPEN5E_VALIDATION_EXCEPTIONS) {
      const original = creature(exception)
      const changedId = structuredClone(original)
      changedId.id += '-other'
      const changedSource = structuredClone(original)
      changedSource.source = 'another-library'
      const changedValue = structuredClone(original)
      const changedDependency = structuredClone(original)
      const changedCr = structuredClone(original)
      if (exception.field === 'save') {
        changedValue.saves![exception.ability] = exception.value + 100
        changedDependency.abilities[exception.ability] += 2
        changedCr.cr = exception.cr + 4
      } else {
        changedValue.maxHp += 100
        changedDependency.hpFormula = '1d8'
      }
      const mutations = [changedId, changedSource, changedValue, changedDependency]
      if (exception.field === 'save') mutations.push(changedCr)
      for (const c of mutations) {
        const report = validateDataset([c], OPEN5E_VALIDATION_EXCEPTIONS)
        expect(report.issues.some((issue) => issue.review), exception.id).toBe(false)
      }
      expect(validateDataset([changedValue], OPEN5E_VALIDATION_EXCEPTIONS).errors).toBeGreaterThan(0)
    }
  })

  it('never waives duplicate IDs, unrelated ability errors, or uncited exceptions', () => {
    const exception = OPEN5E_VALIDATION_EXCEPTIONS[0]
    const c = creature(exception)
    expect(validateDataset([c, c], OPEN5E_VALIDATION_EXCEPTIONS).issues)
      .toContainEqual(expect.objectContaining({ field: 'id', severity: 'error' }))
    c.abilities.str = 99
    expect(validateDataset([c], OPEN5E_VALIDATION_EXCEPTIONS).issues)
      .toContainEqual(expect.objectContaining({ field: 'abilities.str', severity: 'error' }))
    const report = validateDataset([creature(exception)], [{ ...exception, evidence: '' }])
    expect(report.issues.some((issue) => issue.review)).toBe(false)
    expect(report.errors).toBeGreaterThan(0)
  })
})
