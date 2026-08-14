// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { wakingGardenCreatures as creatures } from '../../src/compendium/waking-garden.ts'
import { validateDataset } from '../../src/compendium/validate.ts'

// The authored source is the only place a bad field can be caught before the JSON
// ships, so the ingest-time gates run here too — at `npm test`, on every change.

describe('The Waking Garden dataset', () => {
  it('holds the published sixty-seven creatures, each unique by id and name', () => {
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
      expect(c.source).toBe('openfray-waking-garden')
      expect(c.edition).toBe('5.5')
      expect(c.id.startsWith('openfray-waking-garden:')).toBe(true)
    }
  })

  it('gives every creature its lore layer — the description is part of the library', () => {
    for (const c of creatures) {
      expect(c.description?.trim(), c.name).toBeTruthy()
    }
  })

  it('links cast spells to the 5.2 library the app resolves against', () => {
    const refs = creatures
      .flatMap((c) => c.spellcasting?.groups ?? [])
      .flatMap((g) => g.spells)
      .filter((s) => s.ref)
    expect(refs.length).toBeGreaterThan(0)
    for (const s of refs) {
      expect(s.ref, s.name).toMatch(/^srd-5\.2:[a-z0-9-]+$/)
    }
  })
})
