// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { broodAndBloomCreatures } from '../../src/compendium/brood-and-bloom.ts'
import { broodAndBloomSpells } from '../../src/compendium/brood-and-bloom-spells.ts'
import { strongWatersSpells } from '../../src/compendium/strong-waters-spells.ts'
import { wakingGardenCreatures } from '../../src/compendium/waking-garden.ts'

// Captured from the public typed aggregates at 5dc803b before relocation.
// CLI baselines sort entries; these hashes also protect authored aggregate order.
const collections = [
  {
    name: 'Brood & Bloom creatures',
    entries: broodAndBloomCreatures,
    sha256: '787437e1794c22cc626eda7700031e97dd59fd017709fd14fc968f07ea9bdc90'
  },
  {
    name: 'Brood & Bloom spells',
    entries: broodAndBloomSpells,
    sha256: '4b0c890fc6a2e3e138241cf1ebd305f8fa53241ce593244dfe528ea370f4b002'
  },
  {
    name: 'Strong Waters spells',
    entries: strongWatersSpells,
    sha256: 'a31a332725a7100a9460268f8f5731a780491c35def5385096af0c0ee23404a1'
  },
  {
    name: 'Waking Garden creatures',
    entries: wakingGardenCreatures,
    sha256: 'efaef2f39c1f13a877fa3aee26c35082233da3d56b143580e0d459d74ccd24da'
  }
]

describe('Original collection relocation parity', () => {
  it.each(collections)(
    'preserves every field and authored entry order in $name',
    ({ entries, sha256 }) => {
      expect(createHash('sha256').update(JSON.stringify(entries)).digest('hex')).toBe(sha256)
    }
  )
})
