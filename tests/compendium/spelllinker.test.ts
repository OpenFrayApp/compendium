// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { makeSpellLinker } from '../../src/compendium/spelllinker.ts'

describe('makeSpellLinker', () => {
  it('links spell names in cast-prose, leaving non-spell words alone', () => {
    const link = makeSpellLinker([
      { name: 'Command', ref: 'srd-5.2:command' },
      { name: 'Counterspell', ref: 'srd-5.2:counterspell' },
      { name: 'Shield', ref: 'srd-5.2:shield' },
    ])
    expect(link('The dragon uses Spellcasting to cast Command (level 2 version).')).toBe(
      'The dragon uses Spellcasting to cast [Command](spell:srd-5.2:command) (level 2 version).',
    )
    expect(link('The archmage casts Counterspell or Shield.')).toBe(
      'The archmage casts [Counterspell](spell:srd-5.2:counterspell) or [Shield](spell:srd-5.2:shield).',
    )
  })

  it('does not link spell names outside cast-prose (avoids common-word false hits)', () => {
    const link = makeSpellLinker([{ name: 'Shield', ref: 'srd-5.2:shield' }])
    expect(link('The knight raises its Shield as a bonus action.')).toBe(
      'The knight raises its Shield as a bonus action.',
    )
  })

  it('links only the cast target, not spell-named words elsewhere in the same sentence', () => {
    const link = makeSpellLinker([
      { name: 'Invisibility', ref: 'srd-5.2:invisibility' },
      { name: 'Fly', ref: 'srd-5.2:fly' },
      { name: 'Sleep', ref: 'srd-5.2:sleep' },
    ])
    expect(
      link('The dragon uses Spellcasting to cast Invisibility on itself, and it can fly up to half its Fly Speed.'),
    ).toBe(
      'The dragon uses Spellcasting to cast [Invisibility](spell:srd-5.2:invisibility) on itself, and it can fly up to half its Fly Speed.',
    )
    expect(
      link('It can replace one attack with a use of Sleep Breath or Spellcasting to cast Fly.'),
    ).toBe(
      'It can replace one attack with a use of Sleep Breath or Spellcasting to cast [Fly](spell:srd-5.2:fly).',
    )
  })

  it('links a chain of cast spells (commas, oxford comma, "or"/"and", articles)', () => {
    const link = makeSpellLinker([
      { name: 'Bless', ref: 'srd-5.2:bless' },
      { name: 'Lesser Restoration', ref: 'srd-5.2:lesser-restoration' },
      { name: 'Sanctuary', ref: 'srd-5.2:sanctuary' },
      { name: 'Mirror Image', ref: 'srd-5.2:mirror-image' },
    ])
    expect(link('The couatl casts Bless, Lesser Restoration, or Sanctuary, requiring no components.')).toBe(
      'The couatl casts [Bless](spell:srd-5.2:bless), [Lesser Restoration](spell:srd-5.2:lesser-restoration), or [Sanctuary](spell:srd-5.2:sanctuary), requiring no components.',
    )
    expect(link('The cloaker casts the Mirror Image spell.')).toBe(
      'The cloaker casts the [Mirror Image](spell:srd-5.2:mirror-image) spell.',
    )
  })
})
