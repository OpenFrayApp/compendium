// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { broodAndBloomCreatures as creatures } from '../../src/originals/brood-and-bloom.ts'
import { broodAndBloomSpells as spells } from '../../src/originals/brood-and-bloom-spells.ts'

describe('Brood & Bloom dataset', () => {
  it('gives every creature its lore layer — the description is part of the library', () => {
    for (const c of creatures) {
      expect(c.description?.trim(), c.name).toBeTruthy()
    }
  })

  it('keeps the Lazaret chassis identical across the three officers', () => {
    const officers = ['Lazaret Registrar', 'Lazaret Lector', 'Lazaret Prosector'].map((name) =>
      creatures.find((c) => c.name === name)
    )
    const eyes = officers.map((c) => c!.traits!.find((t) => t.name === 'The Trained Eye'))
    for (const eye of eyes) expect(eye).toBeTruthy()
    // Same wording apart from the officer's own noun.
    const normalized = new Set(
      eyes.map((t) => t!.text.replace(/registrar|lector|prosector/, '<officer>'))
    )
    expect(normalized.size).toBe(1)
  })
})

describe('Brood & Bloom spells', () => {
  it('resolves every book spell a creature casts', () => {
    const ids = new Set(spells.map((s) => s.id))
    const refs = creatures.flatMap(
      (c) =>
        c.spellcasting?.groups.flatMap((g) => g.spells.map((s) => ({ creature: c.name, ...s }))) ??
        []
    )
    const ours = refs.filter((r) => r.ref?.startsWith('openfray-brood-and-bloom:'))
    // The cult casts from the book, so a typo here would silently show no card.
    expect(ours.length).toBeGreaterThan(0)
    for (const r of ours) expect(ids, `${r.creature} → ${r.ref}`).toContain(r.ref)
  })
})
