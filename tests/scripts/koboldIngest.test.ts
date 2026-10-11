// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const blocks = JSON.parse(readFileSync('tests/fixtures/formats/stat-block-2014.json', 'utf8'))
const baseline = JSON.parse(readFileSync('tests/fixtures/formats/parsing-baseline.json', 'utf8'))
const codexSnapshot = JSON.parse(
  readFileSync('tests/fixtures/kobold/creature-codex-open5e.json', 'utf8')
)
const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }))
)

/** Create an isolated command working directory without generated output. */
function workspace(): string {
  const dir = mkdtempSync(join(tmpdir(), 'compendium-kobold-ingest-'))
  directories.push(dir)
  return dir
}

/** Execute a preserved Node ingest command from an isolated directory. */
function run(
  dir: string,
  source: string,
  args: string[],
  live?: { pages: unknown[]; urls?: string[] }
) {
  const flags: string[] = []
  if (live) {
    const preload = join(dir, 'fetch.mjs')
    writeFileSync(
      preload,
      `
      const pages = ${JSON.stringify(live.pages)};
      const urls = ${JSON.stringify(live.urls)};
      globalThis.fetch = async (url, options) => {
        if (urls && String(url) !== urls.shift()) throw new Error('Unexpected fixture URL: ' + url);
        if (!options.headers['User-Agent'].includes('openfray-compendium')) throw new Error('Missing User-Agent');
        if (!pages.length) throw new Error('Unexpected fixture fetch');
        const page = pages.shift();
        return { ok: true, json: async () => page };
      };
    `
    )
    flags.push(`--import=${preload}`)
  }
  return spawnSync(process.execPath, [...flags, resolve(`scripts/ingest-${source}.ts`), ...args], {
    cwd: dir,
    encoding: 'utf8'
  })
}

/** Save synthetic source evidence without changing repository files. */
function input(dir: string, records: unknown): string {
  const path = join(dir, 'input.json')
  writeFileSync(path, JSON.stringify(records))
  return path
}

describe.each(['cached', 'live'])('Creature Codex %s evidence', (mode) => {
  it('preserves arithmetic findings before replacement and leaves new directories absent', () => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    snapshot.results[1].hit_points = 10
    const destination = join(dir, 'existing.json')
    const sentinel = Buffer.from('existing codex\n\x00do not replace')
    writeFileSync(destination, sentinel)
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('kobold-press-ccdx:ankou-soul-seeker')
    expect(result.stderr).toContain('hpFormula')
    expect(readFileSync(destination)).toEqual(sentinel)
    expect(result.stdout).not.toContain('mapped ')
    const nested = join(dir, 'new', 'nested', 'codex.json')
    const absent =
      mode === 'cached'
        ? run(dir, 'creature-codex', [nested, input(dir, snapshot)])
        : run(dir, 'creature-codex', [nested], { pages: [snapshot] })
    expect(absent.status).toBe(1)
    expect(existsSync(join(dir, 'new'))).toBe(false)
  })

  it('excludes reserved individuals before arithmetic validation without removing the generic Seeker', () => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    snapshot.results[2].hit_points = 99
    const destination = join(dir, 'codex.json')
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status, result.stderr).toBe(0)
    const creatures = JSON.parse(readFileSync(destination, 'utf8'))
    expect(creatures.map((creature: { name: string }) => creature.name)).toEqual([
      'Ankou Soul Seeker',
      'Test Codex Sentinel'
    ])
    expect(createHash('sha256').update(readFileSync(destination)).digest('hex')).toBe(
      'd1c1f919e93c9f897fa7df9701b14065ee8f8a41713cfd5658cd206230381c7e'
    )
  })

  it('accepts zero speed, CR and XP and retains optional omission and warning policies', () => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    snapshot.results[0].speed.walk = 0
    snapshot.results[0].challenge_rating = 0
    snapshot.results[0].experience_points = 0
    delete snapshot.results[1].challenge_rating
    delete snapshot.results[1].experience_points
    snapshot.results[1].passive_perception = 12
    const destination = join(dir, 'codex.json')
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('errors: 0, warnings: 1')
    const creatures = JSON.parse(readFileSync(destination, 'utf8'))
    expect(creatures[1]).toMatchObject({ cr: 0, xp: 0, speed: { walk: 0 } })
    expect(creatures[0].cr).toBeUndefined()
    expect(creatures[0].xp).toBeUndefined()
    expect(creatures[0].senses.passivePerception).toBe(12)
  })

  it('rejects duplicate upstream keys even when mapped names differ', () => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    snapshot.results[1].key = snapshot.results[0].key
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('duplicate key ccdx_synthetic-0')
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
  })
  it.each([
    [
      'malformed saving throws',
      'saving_throws',
      (record: any) => {
        record.saving_throws = { wisdom: '2' }
      }
    ],
    [
      'malformed skill bonuses',
      'skill_bonuses',
      (record: any) => {
        record.skill_bonuses = []
      }
    ],
    [
      'malformed resistance prose',
      'resistances_and_immunities',
      (record: any) => {
        record.resistances_and_immunities = { damage_immunities_display: 1 }
      }
    ],
    [
      'malformed action order',
      'actions',
      (record: any) => {
        record.actions = [{ name: 'Test', desc: 'Test', order_in_statblock: '2' }]
      }
    ],
    [
      'unsupported size',
      'size.name',
      (record: any) => {
        record.size.name = 'Titanic'
      }
    ],
    [
      'unsupported action section',
      'actions',
      (record: any) => {
        record.actions = [{ name: 'Test', desc: 'Test', action_type: 'UNKNOWN' }]
      }
    ],
    [
      'missing armor class',
      'armor_class',
      (record: any) => {
        delete record.armor_class
      }
    ],
    [
      'missing size',
      'size.name',
      (record: any) => {
        delete record.size
      }
    ],
    [
      'missing type',
      'type.name',
      (record: any) => {
        delete record.type
      }
    ],
    [
      'missing speed',
      'speed',
      (record: any) => {
        record.speed = {}
      }
    ],
    [
      'malformed challenge rating',
      'challenge_rating',
      (record: any) => {
        record.challenge_rating = '1'
      }
    ],
    [
      'malformed XP',
      'experience_points',
      (record: any) => {
        record.experience_points = '200'
      }
    ],
    [
      'malformed dice',
      'hit_dice',
      (record: any) => {
        record.hit_dice = 9
      }
    ],
    [
      'malformed languages',
      'languages',
      (record: any) => {
        record.languages = { as_string: 4 }
      }
    ],
    [
      'malformed senses',
      'darkvision_range',
      (record: any) => {
        record.darkvision_range = '60'
      }
    ],
    [
      'missing ability',
      'ability_scores.wisdom',
      (record: any) => {
        delete record.ability_scores.wisdom
      }
    ],
    [
      'missing hit points',
      'hit_points',
      (record: any) => {
        delete record.hit_points
      }
    ],
    [
      'invalid name',
      'name',
      (record: any) => {
        record.name = 7
      }
    ],
    [
      'missing key',
      'key',
      (record: any) => {
        delete record.key
      }
    ],
    [
      'malformed action',
      'actions',
      (record: any) => {
        record.actions = [{ name: 'Broken', desc: 4 }]
      }
    ]
  ])('rejects %s with record context before writing', (_label, field, mutate) => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    mutate(snapshot.results[1])
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Creature Codex record 2')
    expect(result.stderr).toContain(field)
    expect(result.stdout).not.toContain('mapped ')
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
  })
})

describe('Creature Codex command', () => {
  it.each([
    ['malformed page', [null], 'Invalid Open5e page'],
    ['incomplete page', [{ ...codexSnapshot, count: 6 }], 'Incomplete snapshot'],
    [
      'foreign endpoint',
      [{ ...codexSnapshot, count: 6, next: '/v2/spells/?page=2' }],
      'Unexpected pagination URL'
    ],
    [
      'changed filter',
      [{ ...codexSnapshot, count: 6, next: '/v2/creatures/?document__key=other' }],
      'Document filter changed'
    ],
    [
      'empty explicit filter',
      [{ ...codexSnapshot, count: 6, next: '/v2/creatures/?document__key=' }],
      'Document filter changed'
    ],
    [
      'conflicting duplicate filter',
      [
        {
          ...codexSnapshot,
          count: 6,
          next: '/v2/creatures/?document__key=ccdx&document__key=other'
        }
      ],
      'Document filter changed'
    ],
    [
      'stalled progress',
      [{ count: 5, next: '/v2/creatures/?page=2', results: [] }],
      'Invalid pagination progress'
    ],
    [
      'count drift',
      [
        { count: 5, next: '/v2/creatures/?page=2', results: codexSnapshot.results.slice(0, 2) },
        { count: 6, next: null, results: codexSnapshot.results.slice(2) }
      ],
      'Count changed'
    ]
  ])('rejects live %s without replacing existing bytes', (_label, pages, message) => {
    const dir = workspace()
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result = run(dir, 'creature-codex', [destination], { pages })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(message)
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
    expect(result.stdout).not.toContain('mapped ')
  })

  it('reports malformed cached JSON before replacement', () => {
    const dir = workspace()
    const cache = join(dir, 'malformed.json')
    writeFileSync(cache, '{broken')
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result = run(dir, 'creature-codex', [destination, cache])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('SyntaxError')
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
  })
  it('follows live pages with restored filters and preserves default output bytes', () => {
    const dir = workspace()
    const result = run(dir, 'creature-codex', [], {
      pages: [
        { count: 5, next: '/v2/creatures/?page=2', results: codexSnapshot.results.slice(0, 2) },
        { count: 5, next: null, results: codexSnapshot.results.slice(2) }
      ],
      urls: [
        'https://api.open5e.com/v2/creatures/?document__key=ccdx&limit=500&format=json',
        'https://api.open5e.com/v2/creatures/?page=2&format=json&document__key=ccdx'
      ]
    })
    expect(result.status, result.stderr).toBe(0)
    expect(
      createHash('sha256')
        .update(readFileSync(join(dir, 'output', 'creature-codex-creatures.json')))
        .digest('hex')
    ).toBe('d1c1f919e93c9f897fa7df9701b14065ee8f8a41713cfd5658cd206230381c7e')
  })

  it.each(['cached', 'live'])('rejects exclusion drift in %s input before replacement', (mode) => {
    const dir = workspace()
    const snapshot = structuredClone(codexSnapshot)
    snapshot.results[2].name = 'Changed Monkey King'
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result =
      mode === 'cached'
        ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
        : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Creature Codex exclusion drift')
    expect(result.stderr).toContain('Monkey King: expected 1, found 0')
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
    expect(result.stdout).not.toContain('mapped ')
  })

  it.each(['cached', 'live'])(
    'rejects mixed source identities in %s input before replacement',
    (mode) => {
      const dir = workspace()
      const snapshot = structuredClone(codexSnapshot)
      snapshot.results[1].document.key = 'tob-2023'
      const destination = join(dir, 'existing.json')
      writeFileSync(destination, 'sentinel')
      const result =
        mode === 'cached'
          ? run(dir, 'creature-codex', [destination, input(dir, snapshot)])
          : run(dir, 'creature-codex', [destination], { pages: [snapshot] })
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('Creature Codex record 2 (Ankou Soul Seeker)')
      expect(result.stderr).toContain('document.key')
      expect(readFileSync(destination, 'utf8')).toBe('sentinel')
      expect(result.stdout).not.toContain('mapped ')
    }
  )
  it.each([
    ['missing count', { results: codexSnapshot.results, next: null }, 'Invalid Open5e page'],
    ['fractional count', { ...codexSnapshot, count: 5.5 }, 'Invalid Open5e page'],
    ['incomplete cache', { ...codexSnapshot, count: 6 }, 'Incomplete snapshot'],
    [
      'unfinished cache',
      { ...codexSnapshot, count: 6, next: '/v2/creatures/?page=2' },
      'Incomplete cached Creature Codex'
    ],
    ['invalid results', { ...codexSnapshot, results: {} }, 'Invalid Open5e page']
  ])('rejects %s before replacing an existing dataset', (_label, snapshot, message) => {
    const dir = workspace()
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result = run(dir, 'creature-codex', [destination, input(dir, snapshot)])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(message)
    expect(result.stdout).not.toContain('mapped ')
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
  })
  it('validates complete cached evidence and creates nested output with unchanged bytes', () => {
    const dir = workspace()
    const destination = join(dir, 'new', 'nested', 'codex.json')
    const result = run(dir, 'creature-codex', [destination, input(dir, codexSnapshot)])
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('errors: 0')
    expect(createHash('sha256').update(readFileSync(destination)).digest('hex')).toBe(
      'd1c1f919e93c9f897fa7df9701b14065ee8f8a41713cfd5658cd206230381c7e'
    )
    expect(result.stdout).toContain('excluded 3 Product Identity individuals')
  })
})

describe.each(['tob1', 'tob2', 'tob3'])('%s command', (source) => {
  it('reports validation failures without replacing bytes or creating directories', () => {
    const dir = workspace()
    const bad = structuredClone(blocks)
    bad[0].header = bad[0].header.map((line: string) => line.replace('27 (6d8)', '28 (6d8)'))
    const path = input(dir, bad)
    const destination = join(dir, 'existing.json')
    const sentinel = Buffer.from('existing dataset\n\x00do not replace')
    writeFileSync(destination, sentinel)
    const result = run(dir, source, [path, destination])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('hpFormula')
    expect(result.stderr).toContain('test-warden-s-watch')
    expect(result.stdout).not.toContain('mapped ')
    expect(readFileSync(destination)).toEqual(sentinel)
    expect(run(dir, source, [path]).status).toBe(1)
    expect(existsSync(join(dir, 'output'))).toBe(false)
  })
  it('identifies a malformed later block and preserves the entire destination', () => {
    const dir = workspace()
    const bad = structuredClone(blocks)
    bad[1].traits = [{ name: 'Broken', text: 4 }]
    const destination = join(dir, 'existing.json')
    writeFileSync(destination, 'sentinel')
    const result = run(dir, source, [input(dir, bad), destination])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      `${source === 'tob1' ? 'kobold-press-tob' : `kobold-press-${source}`} record 2 (TEST SAVANT)`
    )
    expect(readFileSync(destination, 'utf8')).toBe('sentinel')
    expect(result.stdout).not.toContain('mapped ')
  })

  it('creates missing default directories and preserves successful bytes', () => {
    const dir = workspace()
    const result = run(dir, source, [input(dir, blocks)])
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('errors: 0')
    const bytes = readFileSync(join(dir, 'output', `${source}-creatures.json`))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(baseline[source])
  })
})
