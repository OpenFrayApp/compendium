// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'

const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
)

it('reproduces all original datasets and publication approval bytes in isolated output', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-offline.ts'], { encoding: 'utf8' })
  expect(result.status, result.stderr).toBe(0)
  expect(result.stdout).toContain('ingest:waking-garden: 67 records match')
  expect(result.stdout).toContain('ingest:brood-and-bloom: 67 records match')
  expect(result.stdout).toContain('ingest:brood-and-bloom-spells: 23 records match')
  expect(result.stdout).toContain('ingest:strong-waters-spells: 11 records match')
  expect(result.stdout).toContain('6 publication approval records match')
})

it('rejects changed output bytes without updating the expected baseline', () => {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-baseline-test-'))
  directories.push(directory)
  const baseline = JSON.parse(
    readFileSync('tests/fixtures/verification/offline-baseline.json', 'utf8')
  )
  baseline.datasets[0].sha256 = '0'.repeat(64)
  const file = join(directory, 'baseline.json')
  writeFileSync(file, JSON.stringify(baseline))
  const result = spawnSync(process.execPath, ['scripts/verify-offline.ts', file], {
    encoding: 'utf8'
  })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Output baseline changed: ingest:waking-garden')
})
