// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { mapTob3, type Tob3Block } from '../../src/compendium/tob3.ts'
import { mapSrd52 } from '../../src/compendium/srd52.ts'

const fixture = fileURLToPath(new URL('../fixtures/formats/stat-block-2014.json', import.meta.url))
const blocks: Tob3Block[] = JSON.parse(readFileSync(fixture, 'utf8'))
const baseline = JSON.parse(
  readFileSync(new URL('../fixtures/formats/parsing-baseline.json', import.meta.url), 'utf8')
) as Record<string, string>

/** Hash exact command output bytes captured before parser relocation. */
function hash(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

describe('offline parsing command byte parity', () => {
  it.each(['tob1', 'tob2', 'tob3', 'khyberia'])(
    'preserves %s output bytes and ordering',
    (source) => {
      const dir = mkdtempSync(join(tmpdir(), 'compendium-parsing-parity-'))
      try {
        const script = fileURLToPath(new URL(`../../scripts/ingest-${source}.ts`, import.meta.url))
        const input =
          source === 'khyberia'
            ? fileURLToPath(new URL('../fixtures/khyberia/blocks.json', import.meta.url))
            : fixture
        const output = join(
          dir,
          source === 'khyberia' ? 'output/khyberia-creatures.json' : 'creatures.json'
        )
        const result = spawnSync(process.execPath, [script, input, output], {
          cwd: dir,
          encoding: 'utf8'
        })
        expect(result.status, result.stderr).toBe(0)
        expect(hash(readFileSync(output))).toBe(baseline[source])
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    }
  )
})

describe('retained parsing interpretations', () => {
  it('distinguishes daily pools, slots, apostrophe identities, and preserved conditional prose', () => {
    const innate = mapTob3(blocks[0], 'test')
    expect(innate.id).toBe('test:test-warden-s-watch')
    expect(innate.edition).toBe('5.0')
    expect(innate.spellcasting?.groups).toEqual([
      {
        usage: { type: 'atWill' },
        spells: [
          { name: 'hunter’s mark', ref: 'srd-5.1:hunters-mark' },
          { name: 'fire bolt', ref: 'srd-5.1:fire-bolt' }
        ]
      },
      {
        usage: { type: 'perDay', per: 3 },
        spells: [
          { name: 'light', ref: 'srd-5.1:light' },
          { name: 'shield', ref: 'srd-5.1:shield' }
        ]
      },
      {
        usage: { type: 'perDay', per: 1, shared: true },
        spells: [
          { name: 'create or destroy water', ref: 'srd-5.1:create-or-destroy-water' },
          { name: 'misty step', ref: 'srd-5.1:misty-step' }
        ]
      }
    ])
    expect(innate.traits).toEqual([blocks[0].traits[1]])
    expect(innate.legendaryActions?.actions[0]).toMatchObject({
      id: 'flash',
      legendaryCost: 2,
      recharge: { type: 'perDay', value: 1 },
      save: { ability: 'dex', dc: 12, onSave: 'half' }
    })
    expect(mapTob3(blocks[1], 'test').spellcasting?.slots).toEqual({ '1': 4, '2': 2 })
  })

  it('retains action-style daily groups independently of 2014 trait pools', () => {
    const creature = mapTob3(blocks[2], 'test')
    expect(creature.spellcasting?.groups[1].usage).toEqual({ type: 'perDay', per: 1 })
    expect(creature.spellcasting?.groups[0].spells[0].ref).toBe('srd-5.1:hunters-mark')
    expect(creature.actions?.map((action) => action.id)).toEqual([
      'beam',
      'beam-fire',
      'beam-frost'
    ])
    expect(creature.actions?.[0].recharge).toBeUndefined()
    expect(creature.actions?.[1].recharge).toEqual({ type: 'dice', value: 5 })
  })

  it('keeps 2024 attack/save grammar and spell identity distinct', () => {
    const creature = mapSrd52({
      name: 'Test',
      sourcePage: null,
      header: [],
      preamble: {},
      sections: {
        Actions: [
          { name: 'Bolt', text: 'Ranged Attack Roll: +5, range 60 ft. Hit: 1 Fire damage.' },
          {
            name: 'Flash',
            text: 'Dexterity Saving Throw: DC 12. Failure: 7 (2d6) Radiant damage. Success: Half damage.'
          },
          {
            name: 'Spellcasting',
            text: 'It casts using Intelligence as the spellcasting ability (spell save DC 13): At Will: Hunter’s Mark 1/Day: Shield, Misty Step'
          }
        ]
      }
    })
    expect(creature.edition).toBe('5.5')
    expect(creature.actions?.[0]).toMatchObject({
      kind: 'ranged',
      toHit: 5,
      damage: [{ formula: '1', type: 'fire' }]
    })
    expect(creature.actions?.[1].save).toEqual({ ability: 'dex', dc: 12, onSave: 'half' })
    expect(creature.spellcasting?.groups[0].spells[0].ref).toBe('srd-5.2:hunter-s-mark')
    expect(creature.spellcasting?.groups[1].usage).toEqual({ type: 'perDay', per: 1 })
  })
})
