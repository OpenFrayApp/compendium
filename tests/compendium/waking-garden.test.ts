// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { wakingGardenCreatures as creatures } from '../../src/compendium/waking-garden.ts'

describe('The Waking Garden dataset', () => {
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
