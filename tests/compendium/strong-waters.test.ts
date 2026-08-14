// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { strongWatersSpells as spells } from '../../src/compendium/strong-waters-spells.ts'
import { validateSpellDataset } from '../../src/compendium/validate.ts'

// Same gates as the Brood & Bloom suite: the typed source is where a bad field is
// caught, so the ingest's invariants run on every `npm test`. The book ships spells
// and no creatures — an apothecary's book, not a bestiary.

describe('Strong Waters dataset', () => {
  it('holds eleven spells, each unique by id and name', () => {
    expect(spells).toHaveLength(11)
    expect(new Set(spells.map((s) => s.id)).size).toBe(11)
    expect(new Set(spells.map((s) => s.name)).size).toBe(11)
  })

  it('passes every invariant the ingest would gate on', () => {
    const report = validateSpellDataset(spells)
    expect(report.issues).toEqual([])
  })

  it('is tagged as one 5.5 source throughout — grouping rules depend on it', () => {
    for (const s of spells) {
      expect(s.source).toBe('openfray-strong-waters')
      expect(s.edition).toBe('5.5')
      expect(s.id.startsWith('openfray-strong-waters:')).toBe(true)
    }
  })

  it('carries the two spells the book promises by name', () => {
    // Chapter 2 names them at the bench, and three preparings lean on them: a rename
    // here silently breaks the book's own text.
    const names = spells.map((s) => s.name)
    expect(names).toContain('Steady Fire')
    expect(names).toContain('Hasten the Root')
  })

  it('ships no cantrips — the book says what can be had for nothing is a receipt', () => {
    for (const s of spells) expect(s.level).toBeGreaterThan(0)
  })
})
