// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, expect, it } from 'vitest'

const script = fileURLToPath(new URL('../../scripts/check-docs.ts', import.meta.url))
const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }))
)

/** Create a public-only Git fixture for the contributor-facing documentation check. */
function checkout(markdown: string, scripts = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'compendium-docs-'))
  directories.push(dir)
  writeFileSync(join(dir, 'README.md'), markdown)
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts }))
  expect(spawnSync('git', ['init', '-q', dir]).status).toBe(0)
  expect(spawnSync('git', ['add', '.'], { cwd: dir }).status).toBe(0)
  return dir
}

it('rejects a missing public link without accepting an ignored local artifact', () => {
  const dir = checkout('[missing](./missing.md)\n')
  writeFileSync(join(dir, 'missing.md'), '# Private local artifact\n')
  const result = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' })
  expect(result.status).toBe(1)
  expect(result.stderr).toContain('README.md: untracked link ./missing.md')
})

it('checks decoded heading anchors and duplicate headings while leaving external links offline', () => {
  const dir = checkout(
    '# Data & identity\n# Repeat\n# Repeat\n[valid](#data--identity)\n[duplicate](#repeat-1)\n[external](https://example.invalid/never-fetched)\n[broken](#missing)\n```md\n[example](./not-a-link.md)\n```\n'
  )
  const result = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' })
  expect(result.status).toBe(1)
  expect(result.stderr).toBe('README.md: missing anchor #missing\n')
  writeFileSync(join(dir, 'README.md'), '# Encoded heading\n[valid](#encoded%20heading)\n')
  const encoded = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' })
  expect(encoded.stderr).toContain('missing anchor')
  writeFileSync(join(dir, 'README.md'), '# Encoded heading\n[valid](#encoded%2Dheading)\n')
  expect(spawnSync(process.execPath, [script], { cwd: dir }).status).toBe(0)
})

it('rejects undocumented commands, unknown npm examples, and untracked Node runners', () => {
  const dir = checkout('npm run typo\nnpm run ingest:example\n', {
    'ingest:example': 'node scripts/missing.ts',
    typecheck: 'tsc --noEmit'
  })
  const result = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' })
  expect(result.status).toBe(1)
  expect(result.stderr).toContain('Unknown documented npm command: typo')
  expect(result.stderr).toContain('Undocumented npm command: typecheck')
  expect(result.stderr).toContain('ingest:example: untracked runner scripts/missing.ts')
  writeFileSync(join(dir, 'README.md'), '```sh\nnpm run typecheck\n```\n')
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ scripts: { typecheck: 'tsc --noEmit' } })
  )
  expect(spawnSync(process.execPath, [script], { cwd: dir }).status).toBe(0)
})

it('keeps public repository navigation and all pre-migration npm names usable', () => {
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' })
  expect(result.status, result.stderr).toBe(0)
  const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'))
  for (const name of [
    'ingest:srd-2014',
    'ingest:srd52',
    'ingest:srd52-spells',
    'ingest:brood-and-bloom',
    'ingest:brood-and-bloom-spells',
    'ingest:strong-waters-spells',
    'ingest:waking-garden',
    'ingest:khyberia',
    'prepare:open5e',
    'prepare:open5e-spells',
    'prepare:tome-of-heroes-spells',
    'prepare:deep-magic-2020-spells',
    'review:warlock-grimoire',
    'prepare:warlock-grimoire-spells',
    'prepare:stds-spells',
    'prepare:so-many-spells',
    'prepare:kibbles-v23-spells',
    'export:reference-spells',
    'validate',
    'estimate:cr',
    'typecheck',
    'test'
  ])
    expect(scripts[name], name).toBeTypeOf('string')
})
