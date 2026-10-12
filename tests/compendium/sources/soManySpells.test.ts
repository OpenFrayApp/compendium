// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { prepareSoManySpells } from '../../../src/compendium/sources/soManySpells.ts'
import { prepareStdsSpells } from '../../../src/compendium/sources/spellsThatDontSuck.ts'

import { gmBinderHtml as source } from '../../helpers/directSpellFixtures.ts'

describe('So Many Spells direct source', () => {
  it.each([
    '4th-level necromancy (shadow magic)',
    'abjuration cantrip (ferromancy)',
    '5th-level transmutation (blood magic)'
  ])('preserves custom metadata and prose: %s', (header) => {
    const result = prepareSoManySpells(source(header))
    expect(result.spells).toHaveLength(1)
    expect(result.spells[0].classes).toEqual(['Necromancer', 'Occultist', 'Wizard'])
    expect(result.spells[0].text).toBe('If the target is in shadow, the next attack has advantage.')
    expect(result.spells[0].mechanics).toBeUndefined()
    expect(result.spells[0].edition).toBeUndefined()
    expect(result.report.specializations).toEqual([{ name: 'Test Spell', header }])
    expect(result.report.source).toBe('somanyrobots-so-many-spells')
    expect(result.report.publishable).toBe(false)
    expect(result.report.validation.errors).toBe(0)
  })

  it('keeps same-name spells independent and verifies the document’s distinct creator credits', () => {
    const html = source()
    expect(prepareSoManySpells(html).spells[0].id).not.toBe(prepareStdsSpells(html).spells[0].id)
    expect(() =>
      prepareSoManySpells(html.replace('Wizards of the Coast LLC', 'Other publisher'))
    ).toThrow('licensing')
    expect(prepareSoManySpells(html).report.attribution).toContain('System Reference Document 5.1')
  })

  it('withholds potentially reserved creature names even when a third-party document declares CC-BY', () => {
    const html = source().replace(
      'If the target is in shadow, the next attack has advantage.',
      'The summoned creature can take the Vargouille option.'
    )
    const result = prepareSoManySpells(html)
    expect(result.spells).toEqual([])
    expect(result.report.withheld[0].reason).toContain('Vargouille')
    expect(result.blocks[0].text).toContain('Vargouille')
  })
})
