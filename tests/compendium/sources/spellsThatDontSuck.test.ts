// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import {
  extractStdsSpells,
  prepareStdsSpells
} from '../../../src/compendium/sources/spellsThatDontSuck.ts'

import { stdsHtml, spellHeading } from '../../helpers/directSpellFixtures.ts'

describe('Spells That Don’t Suck source policy', () => {
  it.each(['Omega Ankh', 'somanyrobots', 'KibblesTasty'])(
    'requires contributor credit for %s',
    (credit) => {
      const html = stdsHtml(`<section>${spellHeading('Test')}<p>Rules.</p></section>`)
      expect(() => prepareStdsSpells(html.replace(credit, 'Unknown contributor'))).toThrow(
        'contributor credits changed'
      )
    }
  )
  it('extracts spell blocks without design notes, changelog, art, or executable page content', () => {
    const html = stdsHtml(
      `<section>${spellHeading('Test &amp; Spell', undefined, '<li><strong>Replaces:</strong> Old Spell</li>')}<p>You deal <strong>2d6 fire damage</strong>.</p><img src="never-fetch-art.png"></section>`
    )
    const result = prepareStdsSpells(html)
    expect(result.report.rawCount).toBe(1)
    expect(result.spells[0]).toMatchObject({
      name: 'Test & Spell',
      id: 'somanyrobots-spells-that-dont-suck:test-spell',
      level: 2,
      school: 'Evocation',
      concentration: true,
      duration: 'up to 1 minute',
      classes: ['Sorcerer', 'Wizard']
    })
    expect(result.spells[0].components.materials).toBe('a pearl (worth 100 gp)')
    expect(result.spells[0].text).toBe('You deal **2d6 fire damage**.')
    expect(result.spells[0].mechanics).toBeUndefined()
    expect(result.report.replacements).toEqual([{ name: 'Test & Spell', replaces: 'Old Spell' }])
    expect(result.report.publishable).toBe(false)
    expect(result.report.validation.errors).toBe(0)
  })

  it('retains a Replaces label without a colon, as printed for Stream of Flame', () => {
    const result = prepareStdsSpells(
      stdsHtml(
        `<section>${spellHeading('Stream of Flame', undefined, '<li><strong>Replaces</strong> <em>Old Spell</em></li>')}<p>Rules.</p></section>`
      )
    )
    expect(result.report.replacements).toEqual([{ name: 'Stream of Flame', replaces: 'Old Spell' }])
    expect(result.report.withheld).toEqual([])
  })

  it('withholds incomplete display blocks and rejects missing publisher licensing evidence', () => {
    const html = stdsHtml(
      `<section>${spellHeading('Broken').replace('<li><strong>Range:</strong> 60 feet</li>', '')}<p>Rules.</p></section>`
    )
    const result = prepareStdsSpells(html)
    expect(result.report.withheld).toEqual([{ name: 'Broken', reason: 'Missing Range: Broken' }])
    expect(result.spells).toEqual([])
    expect(() =>
      extractStdsSpells(
        html.replace('Creative Commons Attribution 4.0 International', 'All rights reserved')
      )
    ).toThrow('licensing')
    expect(() => extractStdsSpells('<html><body>No spells here.</body></html>')).toThrow('No spell')
  })
})
