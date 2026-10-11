// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, globSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

interface SchemaProvenance {
  repository: string
  revision: string
  files: { path: string; sha256: string }[]
}

/** Hash vendored files without normalizing their console-owned bytes. */
function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/** Require an immutable console revision and a complete, safe file inventory. */
function readProvenance(): SchemaProvenance {
  try {
    const provenance: SchemaProvenance = JSON.parse(readFileSync('schema-provenance.json', 'utf8'))
    assert.equal(
      provenance.repository,
      'https://github.com/OpenFrayApp/console',
      'repository must be the public console'
    )
    assert.match(provenance.revision, /^[a-f0-9]{40}$/, 'revision must be a full commit SHA')
    assert.ok(
      Array.isArray(provenance.files) && provenance.files.length > 0,
      'files must be a nonempty inventory'
    )
    const paths = new Set<string>()
    for (const file of provenance.files) {
      assert.match(
        file.path,
        /^src\/(schema\/[a-zA-Z0-9-]+\.ts|compendium\/libraries\.ts)$/,
        'unexpected vendored path'
      )
      assert.match(file.sha256, /^[a-f0-9]{64}$/, 'each file must have a SHA-256')
      assert.ok(!paths.has(file.path), `duplicate path: ${file.path}`)
      paths.add(file.path)
    }
    for (const name of ['action', 'creature', 'primitives', 'spell', 'license']) {
      assert.ok(paths.has(`src/schema/${name}.ts`), `missing schema file: ${name}`)
    }
    assert.ok(
      paths.has('src/compendium/libraries.ts'),
      'missing license dependency: src/compendium/libraries.ts'
    )
    return provenance
  } catch (error) {
    console.error(`Invalid schema provenance: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

const mode = process.argv[2] ?? '--check'
if (!['--check', '--sync'].includes(mode) || process.argv.length > 3) {
  console.error('Usage: node scripts/schema-sync.ts --check|--sync')
  process.exit(1)
}
const provenance = readProvenance()
if (mode === '--sync') {
  const downloaded = []
  for (const file of provenance.files) {
    const url = `https://raw.githubusercontent.com/OpenFrayApp/console/${provenance.revision}/${file.path}`
    let bytes: Buffer
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      bytes = Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error(
        `Cannot download ${file.path}: ${error instanceof Error ? error.message : error}`
      )
      process.exit(1)
    }
    if (sha256(bytes) !== file.sha256) {
      console.error(`Upstream hash mismatch: ${file.path} at ${provenance.revision}`)
      process.exit(1)
    }
    downloaded.push({ path: file.path, bytes })
  }
  for (const file of downloaded) {
    mkdirSync(dirname(file.path), { recursive: true })
    writeFileSync(file.path, file.bytes)
  }
}
for (const file of provenance.files) {
  if (!existsSync(file.path)) {
    console.error(`Schema drift: missing ${file.path} at ${provenance.revision}`)
    process.exitCode = 1
    continue
  }
  const actual = sha256(readFileSync(file.path))
  if (actual !== file.sha256) {
    console.error(
      `Schema drift: ${file.path} at ${provenance.revision}: expected ${file.sha256}, found ${actual}`
    )
    process.exitCode = 1
  }
}
const recordedPaths = new Set(provenance.files.map((file) => file.path))
for (const path of globSync('src/schema/**/*')) {
  if (statSync(path).isFile() && !recordedPaths.has(path)) {
    console.error(`Schema drift: unrecorded ${path} at ${provenance.revision}`)
    process.exitCode = 1
  }
}
if (!process.exitCode)
  console.log(`Schema matches ${provenance.revision}: ${provenance.files.length} files`)
