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
function run(dir: string, source: string, args: string[]) {
  return spawnSync(process.execPath, [resolve(`scripts/ingest-${source}.ts`), ...args], {
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
