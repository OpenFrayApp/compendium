// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { strongWatersSpells as spells } from '../../src/compendium/strong-waters-spells.ts'

describe('Strong Waters dataset', () => {
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
