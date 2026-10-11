// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const inputs = JSON.parse(readFileSync('tests/fixtures/srd/inputs.json', 'utf8'))
const baseline = JSON.parse(readFileSync('tests/fixtures/srd/baseline.json', 'utf8'))
const directories: string[] = []
afterEach(() => directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })))

/** Copy public SRD command inputs into an isolated checkout with a strict offline fetch substitute. */
function checkout(mutate: (input: typeof inputs) => void = () => {}) {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-srd-ingest-'))
  directories.push(directory)
  for (const path of ['package.json', 'scripts', 'src']) cpSync(path, join(directory, path), { recursive: true })
  const input = structuredClone(inputs)
  mutate(input)
  for (const kind of ['creatures', 'spells']) writeFileSync(join(directory, `${kind}.json`), JSON.stringify(input[kind]))
  writeFileSync(join(directory, 'api.json'), JSON.stringify(input.api))
  writeFileSync(join(directory, 'fetch.mjs'), `
import { readFileSync } from 'node:fs'
const api = JSON.parse(readFileSync(new URL('./api.json', import.meta.url), 'utf8'))
const routes = {}
for (const [endpoint, records] of Object.entries(api)) {
  const base = 'https://www.dnd5eapi.co/api/2014/' + endpoint
  routes[base] = { count: records.length, results: records.map(r => ({ index: r.index, name: r.name, url: '/api/2014/' + endpoint + '/' + r.index })) }
  for (const r of records) routes[base + '/' + r.index] = r
}
globalThis.fetch = async url => {
  if (!Object.hasOwn(routes, url)) throw Error('Unexpected remote URL: ' + url)
  return new Response(JSON.stringify(routes[url]))
}
`)
  return directory
}

/** Run an unchanged npm interface with every remote request confined to the fixture routes. */
function run(directory: string, command: string, args: string[] = []) {
  return spawnSync('npm', ['run', command, '--', ...args], {
    cwd: directory,
    encoding: 'utf8',
    env: { ...process.env, npm_config_offline: 'true', NODE_OPTIONS: `--import=${pathToFileURL(join(directory, 'fetch.mjs')).href}` }
  })
}

/** Assert independently captured successful bytes from the pre-hardening runners. */
function expectBaseline(directory: string, command: string) {
  for (const dataset of baseline.datasets.filter((dataset: { command: string }) => dataset.command === command)) {
    const bytes = readFileSync(join(directory, 'output', dataset.file))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(dataset.sha256)
    expect(JSON.parse(bytes.toString())).toHaveLength(dataset.count)
  }
}

describe('SRD ingest CLI parity', () => {
  it('retains SRD 2014 API order, identities, spell references, and compact serialization', () => {
    const directory = checkout()
    mkdirSync(join(directory, 'output'))
    const result = run(directory, 'ingest:srd-2014')
    expect(result.status, result.stderr).toBe(0)
    expectBaseline(directory, 'ingest:srd-2014')
  })

  it('retains PDF-derived spell sorting, creature order, and positional spell linking', () => {
    const directory = checkout()
    mkdirSync(join(directory, 'output'))
    const spells = run(directory, 'ingest:srd52-spells', ['spells.json'])
    expect(spells.status, spells.stderr).toBe(0)
    const creatures = run(directory, 'ingest:srd52', ['creatures.json', 'output/srd-creatures.json', 'output/srd-spells.json'])
    expect(creatures.status, creatures.stderr).toBe(0)
    expectBaseline(directory, 'ingest:srd52-spells')
    expectBaseline(directory, 'ingest:srd52')
  })
})
