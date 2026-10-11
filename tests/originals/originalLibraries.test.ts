// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { wakingGardenCreatures } from '../../src/originals/waking-garden.ts'
import { broodAndBloomCreatures } from '../../src/originals/brood-and-bloom.ts'
import { broodAndBloomSpells } from '../../src/originals/brood-and-bloom-spells.ts'
import { strongWatersSpells } from '../../src/originals/strong-waters-spells.ts'
import { validateDataset, validateSpellDataset } from '../../src/compendium/validate.ts'

const libraries = [
  {
    name: 'Waking Garden creatures',
    records: wakingGardenCreatures,
    count: 67,
    source: 'openfray-waking-garden',
    validate: () => validateDataset(wakingGardenCreatures)
  },
  {
    name: 'Brood & Bloom creatures',
    records: broodAndBloomCreatures,
    count: 67,
    source: 'openfray-brood-and-bloom',
    validate: () => validateDataset(broodAndBloomCreatures)
  },
  {
    name: 'Brood & Bloom spells',
    records: broodAndBloomSpells,
    count: 23,
    source: 'openfray-brood-and-bloom',
    validate: () => validateSpellDataset(broodAndBloomSpells)
  },
  {
    name: 'Strong Waters spells',
    records: strongWatersSpells,
    count: 11,
    source: 'openfray-strong-waters',
    validate: () => validateSpellDataset(strongWatersSpells)
  }
]

describe.each(libraries)('$name original library', ({ records, count, source, validate }) => {
  it('retains the promised count and unique IDs and names', () => {
    expect(records).toHaveLength(count)
    expect(new Set(records.map((record) => record.id)).size).toBe(count)
    expect(new Set(records.map((record) => record.name)).size).toBe(count)
  })

  it('passes the existing validation interface without findings', () => {
    expect(validate().issues).toEqual([])
  })

  it('retains source identity and the 5.5 rules edition throughout', () => {
    for (const record of records) {
      expect(record.source).toBe(source)
      expect(record.edition).toBe('5.5')
      expect(record.id.startsWith(`${source}:`)).toBe(true)
    }
  })
})
