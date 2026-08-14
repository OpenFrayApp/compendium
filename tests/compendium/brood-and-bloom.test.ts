// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { broodAndBloomCreatures as creatures } from '../../src/compendium/brood-and-bloom.ts'
import { broodAndBloomSpells as spells } from '../../src/compendium/brood-and-bloom-spells.ts'
import { validateDataset, validateSpellDataset } from '../../src/compendium/validate.ts'

// Same gates as the Waking Garden suite: the typed source is where a bad field is
// caught, so the ingest's invariants run on every `npm test`.

describe('Brood & Bloom dataset', () => {
  it('holds sixty-seven creatures, each unique by id and name', () => {
    expect(creatures).toHaveLength(67)
    expect(new Set(creatures.map((c) => c.id)).size).toBe(67)
    expect(new Set(creatures.map((c) => c.name)).size).toBe(67)
  })

  it('passes every invariant the ingest would gate on', () => {
    const report = validateDataset(creatures)
    expect(report.issues).toEqual([])
  })

  it('is tagged as one 5.5 source throughout — grouping rules depend on it', () => {
    for (const c of creatures) {
      expect(c.source).toBe('openfray-brood-and-bloom')
      expect(c.edition).toBe('5.5')
      expect(c.id.startsWith('openfray-brood-and-bloom:')).toBe(true)
    }
  })

  it('gives every creature its lore layer — the description is part of the library', () => {
    for (const c of creatures) {
      expect(c.description?.trim(), c.name).toBeTruthy()
    }
  })

  it('keeps the Lazaret chassis identical across the three officers', () => {
    const officers = ['Lazaret Registrar', 'Lazaret Lector', 'Lazaret Prosector'].map((name) =>
      creatures.find((c) => c.name === name),
    )
    const eyes = officers.map((c) => c!.traits!.find((t) => t.name === 'The Trained Eye'))
    for (const eye of eyes) expect(eye).toBeTruthy()
    // Same wording apart from the officer's own noun.
    const normalized = new Set(
      eyes.map((t) => t!.text.replace(/registrar|lector|prosector/, '<officer>')),
    )
    expect(normalized.size).toBe(1)
  })
})

describe('Brood & Bloom spells', () => {
  it('holds twenty-three spells, each unique by id and name', () => {
    expect(spells).toHaveLength(23)
    expect(new Set(spells.map((s) => s.id)).size).toBe(23)
    expect(new Set(spells.map((s) => s.name)).size).toBe(23)
  })

  it('passes every invariant the ingest would gate on', () => {
    const report = validateSpellDataset(spells)
    expect(report.issues).toEqual([])
  })

  it('is tagged as one 5.5 source throughout — grouping rules depend on it', () => {
    for (const s of spells) {
      expect(s.source).toBe('openfray-brood-and-bloom')
      expect(s.edition).toBe('5.5')
      expect(s.id.startsWith('openfray-brood-and-bloom:')).toBe(true)
    }
  })

  it('resolves every book spell a creature casts', () => {
    const ids = new Set(spells.map((s) => s.id))
    const refs = creatures.flatMap(
      (c) =>
        c.spellcasting?.groups.flatMap((g) => g.spells.map((s) => ({ creature: c.name, ...s }))) ??
        [],
    )
    const ours = refs.filter((r) => r.ref?.startsWith('openfray-brood-and-bloom:'))
    // The cult casts from the book, so a typo here would silently show no card.
    expect(ours.length).toBeGreaterThan(0)
    for (const r of ours) expect(ids, `${r.creature} → ${r.ref}`).toContain(r.ref)
  })
})
