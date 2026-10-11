// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { mapDirectSpellBlock, type DirectSpellBlock } from '../../src/formats/directSpells.ts'

/** Supply display metadata without inferred casting consequences. */
function block(header: string): DirectSpellBlock {
  return {
    name: 'Shared Spell',
    header,
    sourcePage: 7,
    fields: {
      Classes: 'Wizard, Occultist',
      'Casting Time': '1 action',
      Range: 'Self',
      Components: 'V, S, M (a pearl (worth 100 gp))',
      Duration: 'Concentration, 1 minute'
    },
    text: 'If the target is in shadow, the next attack has advantage.',
    removedAdvice: []
  }
}

describe('direct spell display mapping', () => {
  it('preserves ritual, concentration, nested materials, and independent source identities', () => {
    const input = block('3rd-level conjuration (ritual)')
    const spell = mapDirectSpellBlock(input, 'first-source')
    expect(spell).toMatchObject({
      id: 'first-source:shared-spell',
      sourcePage: 7,
      level: 3,
      school: 'Conjuration',
      ritual: true,
      castingTime: '1 action or Ritual',
      concentration: true,
      duration: 'up to 1 minute',
      classes: ['Wizard', 'Occultist'],
      components: {
        verbal: true,
        somatic: true,
        material: true,
        materials: 'a pearl (worth 100 gp)'
      },
      text: input.text
    })
    expect(spell.mechanics).toBeUndefined()
    expect(spell.edition).toBeUndefined()
    expect(mapDirectSpellBlock(input, 'second-source').id).toBe('second-source:shared-spell')
  })

  it('maps cantrips and requires classes unless the source explicitly permits their absence', () => {
    const input = block('evocation cantrip')
    delete input.fields.Classes
    expect(() => mapDirectSpellBlock(input, 'source')).toThrow('Missing Classes')
    const spell = mapDirectSpellBlock(input, 'source', { allowMissingClasses: true })
    expect(spell.level).toBe(0)
    expect(spell.school).toBe('Evocation')
    expect(spell.classes).toBeUndefined()
  })
})
