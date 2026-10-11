// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const baseline = JSON.parse(
  readFileSync('tests/fixtures/verification/offline-baseline.json', 'utf8')
)
const commands = [
  {
    command: 'ingest:waking-garden',
    file: 'waking-garden-creatures.json',
    module: 'waking-garden',
    records: 'wakingGardenCreatures',
    kind: 'creature'
  },
  {
    command: 'ingest:brood-and-bloom',
    file: 'brood-and-bloom-creatures.json',
    module: 'brood-and-bloom',
    records: 'broodAndBloomCreatures',
    kind: 'creature'
  },
  {
    command: 'ingest:brood-and-bloom-spells',
    file: 'brood-and-bloom-spells.json',
    module: 'brood-and-bloom-spells',
    records: 'broodAndBloomSpells',
    kind: 'spell'
  },
  {
    command: 'ingest:strong-waters-spells',
    file: 'strong-waters-spells.json',
    module: 'strong-waters-spells',
    records: 'strongWatersSpells',
    kind: 'spell'
  }
]
const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
)

/** Copy public command inputs into a checkout without generated output or dependencies. */
function cleanCheckout(): string {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-original-ingest-'))
  directories.push(directory)
  for (const path of ['package.json', 'scripts', 'src'])
    cpSync(path, join(directory, path), { recursive: true })
  return directory
}

/** Run the preserved npm command offline from the isolated checkout. */
function run(directory: string, command: string, args: string[] = [], preload?: string) {
  return spawnSync('npm', ['run', command, '--', ...args], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_offline: 'true',
      ...(preload ? { NODE_OPTIONS: `--import=${pathToFileURL(preload).href}` } : {})
    }
  })
}

/** Inject an authoring mistake into child-process memory without editing authored files. */
function inject(directory: string, module: string, records: string, mutation: string): string {
  const preload = join(directory, 'inject.mjs')
  writeFileSync(
    preload,
    `import { ${records} as records } from './src/originals/${module}.ts';\n${mutation}\n`
  )
  return preload
}

describe.each(commands)('$command', ({ command, file, module, records, kind }) => {
  it('creates default output in a clean checkout with exact baseline bytes', () => {
    const directory = cleanCheckout()
    expect(existsSync(join(directory, 'output'))).toBe(false)
    const result = run(directory, command)
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('errors: 0, warnings: 0')
    const bytes = readFileSync(join(directory, 'output', file))
    const expected = baseline.datasets.find(
      (dataset: { command: string }) => dataset.command === command
    )
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected.sha256)
  })

  it('preserves the positional output argument and creates nested directories', () => {
    const directory = cleanCheckout()
    const destination = join(directory, 'nested', 'new', 'selected.json')
    const result = run(directory, command, [destination])
    expect(result.status, result.stderr).toBe(0)
    const expected = baseline.datasets.find(
      (dataset: { command: string }) => dataset.command === command
    )
    expect(createHash('sha256').update(readFileSync(destination)).digest('hex')).toBe(
      expected.sha256
    )
    expect(existsSync(join(directory, 'output'))).toBe(false)
  })

  it('reports validation errors and leaves preexisting destination bytes intact', () => {
    const directory = cleanCheckout()
    const destination = join(directory, 'preexisting.json')
    const sentinel = Buffer.from('existing dataset\n\x00do not replace')
    writeFileSync(destination, sentinel)
    const preload = inject(
      directory,
      module,
      records,
      kind === 'creature' ? 'records[0].ac = 0;' : "records[0].text = '';"
    )
    const result = run(directory, command, [destination], preload)
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('errors: 1, warnings: 0')
    expect(result.stdout).not.toContain('mapped ')
    expect(result.stderr).toContain(kind === 'creature' ? 'ac' : 'no description text')
    expect(readFileSync(destination)).toEqual(sentinel)
  })

  it('does not create destination directories for a failing candidate', () => {
    const directory = cleanCheckout()
    const preload = inject(
      directory,
      module,
      records,
      kind === 'creature' ? 'records[0].ac = 0;' : "records[0].text = '';"
    )
    const result = run(directory, command, [], preload)
    expect(result.status).toBe(1)
    expect(existsSync(join(directory, 'output'))).toBe(false)
  })

  it('reports warnings without rejecting or correcting the candidate', () => {
    const directory = cleanCheckout()
    const preload = inject(
      directory,
      module,
      records,
      kind === 'creature'
        ? "records[0].alignment = '';"
        : "records[0].components = { verbal: true, somatic: true, material: false, materials: 'warning fixture' };"
    )
    const result = run(directory, command, [], preload)
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('errors: 0, warnings: 1')
    const output = JSON.parse(readFileSync(join(directory, 'output', file), 'utf8'))
    if (kind === 'spell')
      expect(result.stderr).toContain('material flag and material text disagree')
    expect(
      output.some((record: { alignment?: string; components?: { materials?: string } }) =>
        kind === 'creature'
          ? record.alignment === ''
          : record.components?.materials === 'warning fixture'
      )
    ).toBe(true)
  })
})
