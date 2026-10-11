// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, expect, it } from 'vitest'

const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
)

it('checks current documentation while preserving legal and historical transcripts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-prose-'))
  directories.push(directory)
  mkdirSync(join(directory, 'docs'))
  for (const file of ['CHANGELOG.md', 'CREDITS.md', 'docs/warlock-section-15.md']) {
    writeFileSync(join(directory, file), 'Published text — preserved verbatim.\n')
  }
  writeFileSync(join(directory, 'docs/verification.md'), 'Install dependencies — run checks.\n')
  const result = spawnSync(process.execPath, [resolve('scripts/check-prose.mjs')], {
    cwd: directory,
    encoding: 'utf8'
  })
  expect(result.status).toBe(1)
  expect(result.stderr).toContain('docs/verification.md:1')
  expect(result.stderr).not.toContain('warlock-section-15')
  expect(result.stderr).not.toContain('CHANGELOG.md')
  expect(result.stderr).not.toContain('CREDITS.md')
})
