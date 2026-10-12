// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('refuses to rewrite a protected publication approval module', () => {
  const file = 'src/compendium/referenceSpellPublication.ts'
  const before = readFileSync(file)
  const result = spawnSync(process.execPath, ['scripts/format.mjs', file], { encoding: 'utf8' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain(`Outside formatting scope: ${file}`)
  expect(readFileSync(file)).toEqual(before)
})

it('requires explicit paths for formatting writes', () => {
  const result = spawnSync(process.execPath, ['scripts/format.mjs'], { encoding: 'utf8' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Specify files')
})
