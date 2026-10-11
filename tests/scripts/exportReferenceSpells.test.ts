// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { WARLOCK_GRIMOIRE_SPELLS } from '../../src/compendium/warlockGrimoireSpells.ts'

const exporter = resolve('scripts/export-reference-spells.ts')
const directories: string[] = []
// Destination names are independent of the production approval table.
const files = [
  'warlock-grimoire-spells.json',
  'deep-magic-2020-spells.json',
  'kibbles-casting-v23-spells.json',
  'spells-that-dont-suck-spells.json',
  'so-many-spells-spells.json',
  'tome-of-heroes-spells.json'
]

/** Create isolated candidate input and preexisting destination bytes for the export command. */
function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'compendium-reference-export-'))
  directories.push(root)
  const destination = join(root, 'destination')
  mkdirSync(destination)
  for (const file of files)
    writeFileSync(join(destination, file), Buffer.from(`existing ${file}\n\0`))
  writeFileSync(join(destination, 'unrelated.json'), 'unrelated content\n')
  const candidateDirectory = join(root, 'output', 'warlock-grimoire-preparation')
  mkdirSync(candidateDirectory, { recursive: true })
  const candidate = join(candidateDirectory, 'candidate-spells.json')
  writeFileSync(candidate, JSON.stringify(WARLOCK_GRIMOIRE_SPELLS))
  return { root, destination, candidate }
}

/** Run the existing export CLI against isolated input and destination paths. */
function run(root: string, destination: string, ...args: string[]) {
  return spawnSync(process.execPath, [exporter, destination, ...args], {
    cwd: root,
    encoding: 'utf8'
  })
}

/** Assert every preexisting dataset and unrelated file survives a rejected selection byte-for-byte. */
function expectPreserved(destination: string) {
  expect(readdirSync(destination).sort()).toEqual([...files, 'unrelated.json'].sort())
  for (const file of files) {
    expect(readFileSync(join(destination, file))).toEqual(Buffer.from(`existing ${file}\n\0`))
  }
  expect(readFileSync(join(destination, 'unrelated.json'), 'utf8')).toBe('unrelated content\n')
}

afterEach(() =>
  directories.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }))
)

it('exports the pinned Warlock selection with unchanged successful bytes and leaves other datasets alone', () => {
  const { root, destination } = workspace()
  const result = run(root, destination, '--source', 'kobold-press-wz')
  expect(result.status, result.stderr).toBe(0)
  expect(result.stdout).toBe('Exported 35 reference-only spells: warlock-grimoire-spells.json\n')
  const content = readFileSync(join(destination, files[0]))
  // Captured from the unchanged exporter at 5dc803b, independently of approval-derived expectations.
  expect(createHash('sha256').update(content).digest('hex')).toBe(
    'ff4a7b2c6b367e5452d582c979fc12bbdff052fe19fc57f030416e651ac55b17'
  )
  expect(
    JSON.parse(content.toString()).every(
      (spell: { edition: string; mechanics?: unknown }) =>
        spell.edition === '5.0' && spell.mechanics === undefined
    )
  ).toBe(true)
  for (const file of files.slice(1)) {
    expect(readFileSync(join(destination, file))).toEqual(Buffer.from(`existing ${file}\n\0`))
  }
  expect(readFileSync(join(destination, 'unrelated.json'), 'utf8')).toBe('unrelated content\n')
})

it.each(['missing', 'changed'] as const)(
  'checks a later %s candidate before replacing the already-approved first destination',
  (failure) => {
    const { root, destination } = workspace()
    if (failure === 'changed') {
      const later = join(root, 'output', 'deep-magic-2020-preparation')
      mkdirSync(later, { recursive: true })
      writeFileSync(join(later, 'candidate-spells.json'), '[]')
    }
    const result = run(root, destination)
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain(
      failure === 'missing' ? 'ENOENT' : 'Snapshot changed for kobold-press-deepm'
    )
    expect(result.stdout).toBe('')
    expectPreserved(destination)
  }
)

it('rejects changed bytes in a single-source snapshot without replacing any destination', () => {
  const { root, destination, candidate } = workspace()
  writeFileSync(candidate, readFileSync(candidate, 'utf8') + ' ')
  const result = run(root, destination, '--source', 'kobold-press-wz')
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Snapshot changed for kobold-press-wz')
  expect(result.stdout).toBe('')
  expectPreserved(destination)
})

it('rejects an unknown selection before touching the destination', () => {
  const { root, destination } = workspace()
  const result = run(root, destination, '--source', 'unreviewed')
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('No reference spell approval for unreviewed')
  expect(result.stdout).toBe('')
  expectPreserved(destination)
})

it('does not create a destination when the all-source selection is rejected', () => {
  const { root } = workspace()
  const destination = join(root, 'new', 'destination')
  const result = run(root, destination)
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('ENOENT')
  expect(existsSync(join(root, 'new'))).toBe(false)
})
