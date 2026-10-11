// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const directories: string[] = []
const script = resolve('scripts/schema-sync.ts')
const provenance = JSON.parse(readFileSync('schema-provenance.json', 'utf8')) as {
  revision: string
  files: { path: string; sha256: string }[]
}

afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
)

/** Copy only the public vendored files and provenance into a standalone checkout. */
function checkout() {
  const root = mkdtempSync(join(tmpdir(), 'compendium-schema-'))
  directories.push(root)
  for (const path of ['schema-provenance.json', ...provenance.files.map((file) => file.path)]) {
    cpSync(path, join(root, path), { recursive: true })
  }
  return root
}

/** Run the contributor-facing command without network access or a sibling checkout. */
function check(root: string) {
  const offline =
    'data:text/javascript,globalThis.fetch=()=>{throw new Error("Network is disabled")}'
  return spawnSync(process.execPath, ['--import', offline, script, '--check'], {
    cwd: root,
    encoding: 'utf8'
  })
}

/** Substitute public immutable HTTP responses at the process network boundary. */
function sync(root: string, failure = '') {
  for (const file of provenance.files)
    cpSync(file.path, join(root, '.upstream', file.path), { recursive: true })
  if (failure === 'hash')
    writeFileSync(join(root, '.upstream/src/compendium/libraries.ts'), 'wrong upstream bytes\n')
  const preload = join(root, 'fetch.mjs')
  writeFileSync(
    preload,
    `
import { readFileSync } from 'node:fs'
globalThis.fetch = async (url) => {
  const prefix = 'https://raw.githubusercontent.com/OpenFrayApp/console/${provenance.revision}/'
  if (!String(url).startsWith(prefix)) throw new Error('Not the pinned public console URL: ' + url)
  if (String(url).endsWith('/libraries.ts') && '${failure}' === 'http') return new Response('', { status: 503 })
  if (String(url).endsWith('/libraries.ts') && '${failure}' === 'network') throw new Error('Network unavailable')
  return new Response(readFileSync('.upstream/' + String(url).slice(prefix.length)))
}
`
  )
  return spawnSync(process.execPath, ['--import', preload, script, '--sync'], {
    cwd: root,
    encoding: 'utf8'
  })
}

describe('schema sync command', () => {
  it('reports network failures with their file context and leaves local files intact', () => {
    const root = checkout()
    writeFileSync(join(root, 'src/schema/action.ts'), 'retain this local change\n')
    const result = sync(root, 'network')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'Cannot download src/compendium/libraries.ts: Network unavailable'
    )
    expect(readFileSync(join(root, 'src/schema/action.ts'), 'utf8')).toBe(
      'retain this local change\n'
    )
  })

  it('reports HTTP failures without replacing any local files', () => {
    const root = checkout()
    writeFileSync(join(root, 'src/schema/action.ts'), 'retain this local change\n')
    const result = sync(root, 'http')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Cannot download src/compendium/libraries.ts: HTTP 503')
    expect(readFileSync(join(root, 'src/schema/action.ts'), 'utf8')).toBe(
      'retain this local change\n'
    )
  })

  it('rejects unexpected upstream bytes before replacing any local files', () => {
    const root = checkout()
    const action = Buffer.from('retain this local change\n')
    writeFileSync(join(root, 'src/schema/action.ts'), action)
    const result = sync(root, 'hash')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Upstream hash mismatch: src/compendium/libraries.ts')
    expect(readFileSync(join(root, 'src/schema/action.ts'))).toEqual(action)
    expect(readFileSync(join(root, 'src/compendium/libraries.ts'))).toEqual(
      readFileSync('src/compendium/libraries.ts')
    )
  })

  it('restores exact pinned bytes and missing dependencies without changing provenance', () => {
    const root = checkout()
    const manifest = readFileSync(join(root, 'schema-provenance.json'))
    writeFileSync(join(root, 'src/schema/action.ts'), 'controlled drift\n')
    rmSync(join(root, 'src/compendium/libraries.ts'))
    const result = sync(root)
    expect(result.status).toBe(0)
    for (const file of provenance.files)
      expect(readFileSync(join(root, file.path))).toEqual(readFileSync(file.path))
    expect(readFileSync(join(root, 'schema-provenance.json'))).toEqual(manifest)
    expect(check(root).status).toBe(0)
  })
})

describe('schema drift command', () => {
  it('rejects unknown command modes instead of silently performing a check', () => {
    const result = spawnSync(process.execPath, [script, '--unknown'], {
      cwd: checkout(),
      encoding: 'utf8'
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Usage: node scripts/schema-sync.ts --check|--sync')
  })

  it.each([
    { repository: 'https://github.com/example/fork' },
    { files: [] },
    { files: [...provenance.files, provenance.files[0]] },
    { files: provenance.files.filter((file) => file.path !== 'src/schema/spell.ts') },
    { files: provenance.files.filter((file) => file.path !== 'src/schema/license.ts') },
    { files: provenance.files.filter((file) => file.path !== 'src/compendium/libraries.ts') },
    { files: [{ path: '../outside.ts', sha256: 'a'.repeat(64) }] },
    { files: provenance.files.map((file) => ({ ...file, sha256: 'unreviewed' })) }
  ])('rejects invalid provenance before inspecting or writing vendored files: %j', (invalid) => {
    const root = checkout()
    writeFileSync(
      join(root, 'schema-provenance.json'),
      JSON.stringify({ ...provenance, ...invalid })
    )
    const result = check(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Invalid schema provenance:')
  })

  it('rejects mutable revision names instead of treating them as schema authority', () => {
    const root = checkout()
    writeFileSync(
      join(root, 'schema-provenance.json'),
      JSON.stringify({ ...provenance, revision: 'main' })
    )
    const result = check(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Invalid schema provenance: revision must be a full commit SHA')
  })

  it('accepts synchronized bytes offline and reports the pinned revision and file count', () => {
    const result = check(checkout())
    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`Schema matches ${provenance.revision}: 6 files`)
    expect(result.stderr).toBe('')
  })

  it('rejects schema additions outside the reviewed vendored inventory', () => {
    const root = checkout()
    writeFileSync(join(root, 'src/schema/ingest-only.ts'), 'export type Fork = string\n')
    const result = check(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Schema drift: unrecorded src/schema/ingest-only.ts')
  })

  it('reports missing dependencies without stopping other drift findings', () => {
    const root = checkout()
    rmSync(join(root, 'src/schema/license.ts'))
    rmSync(join(root, 'src/compendium/libraries.ts'))
    const result = check(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Schema drift: missing src/schema/license.ts')
    expect(result.stderr).toContain('Schema drift: missing src/compendium/libraries.ts')
  })

  it('rejects changed schema bytes and identifies the file and pinned revision', () => {
    const root = checkout()
    writeFileSync(join(root, 'src/schema/action.ts'), 'controlled drift\n')
    const result = check(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Schema drift: src/schema/action.ts')
    expect(result.stderr).toContain(provenance.revision)
  })
})
