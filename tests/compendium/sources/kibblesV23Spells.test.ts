// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { prepareKibblesV23Spells } from '../../../src/compendium/sources/kibblesV23Spells.ts'

import { kibblesSnapshot as snapshot } from '../../helpers/directSpellFixtures.ts'

describe('Kibbles v2.3 full collection', () => {
  it('preserves PDF values and does not fold in the ancestry document or infer rollable fields', () => {
    const input = snapshot()
    const original = JSON.stringify(input)
    const { spells, report } = prepareKibblesV23Spells(input)
    expect(spells).toHaveLength(295)
    expect(spells.find((spell) => spell.name === 'Become Stone')?.text).toBe(
      'You gain 15 temporary hit points.'
    )
    expect(spells.find((spell) => spell.name === 'Crashing Wave')?.text).toContain('15-foot cone')
    expect(spells[0].source).toBe('kibblestasty-casting-compendium-v2.3')
    expect(spells[0].sourcePage).toBe(1)
    expect(spells.every((spell) => !spell.mechanics && !spell.edition)).toBe(true)
    expect(report.scope).toBe('all-spells')
    expect(report.publishable).toBe(false)
    expect(report.validation.errors).toBe(0)
    expect(JSON.stringify(input)).toBe(original)
  })

  it('rejects version, scope, count, license, hash, and page drift', () => {
    for (const change of [
      { version: '2.0' },
      { scope: 'eleven-elemental-spells' },
      { blocks: snapshot().blocks.slice(1) },
      { licenseEvidence: 'All rights reserved' },
      { sha256: 'bad' },
      { pdfPages: 0 }
    ]) {
      expect(() => prepareKibblesV23Spells({ ...snapshot(), ...change })).toThrow('snapshot')
    }
    const input = snapshot()
    input.blocks[0].sourcePage = 87
    expect(() => prepareKibblesV23Spells(input)).toThrow('provenance')
  })

  it('reports duplicate IDs and rejects potentially reserved names', () => {
    const duplicate = snapshot()
    duplicate.blocks[1] = { ...duplicate.blocks[0] }
    expect(prepareKibblesV23Spells(duplicate).report.validation.errors).toBe(1)
    const input = snapshot()
    input.blocks[0].text = 'A Beholder appears.'
    expect(prepareKibblesV23Spells(input).report.withheld[0].reason).toContain('reserved')
  })

  it('preserves psionic display fields, compound ritual tags, and missing class assignments', () => {
    const input = snapshot()
    input.blocks[2].header = '1st-level psionic'
    delete input.blocks[2].fields.Classes
    input.blocks[3].header = '1st-level divination (blood magic, ritual)'
    const result = prepareKibblesV23Spells(input)
    const psionic = result.spells.find((spell) => spell.name === 'Fixture Spell 2')!
    expect(psionic.school).toBe('Psionic')
    expect(psionic.classes).toBeUndefined()
    expect(result.report.fidelity.filter((finding) => finding.name === psionic.name)).toHaveLength(
      2
    )
    expect(result.spells.find((spell) => spell.name === 'Fixture Spell 3')?.ritual).toBe(true)
  })

  it('retains separately credited items and withholds unknown credit chains', () => {
    const input = snapshot()
    input.blocks[2].creditedSource = 'So Many Spells'
    input.blocks[2].creditEvidence = 'Drawn from somanyrobots’ So Many Spells.'
    input.blocks[3].creditedSource = 'Unknown source'
    input.blocks[4].extractionIssues = ['Unresolved source boundary']
    const result = prepareKibblesV23Spells(input)
    expect(result.report.separatelyCredited).toHaveLength(2)
    expect(result.report.withheld).toHaveLength(2)
    expect(result.spells).toHaveLength(293)
  })
})
