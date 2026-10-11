// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { gmBinderHtml, kibblesSnapshot } from '../helpers/directSpellFixtures.ts'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const scripts = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).scripts
const baseline = JSON.parse(
  readFileSync(join(repo, 'tests/fixtures/verification/direct-spells-baseline.json'), 'utf8')
).artifacts
const libraries = [
  {
    command: 'prepare:stds-spells',
    root: 'spells-that-dont-suck-preparation',
    source: 'somanyrobots-spells-that-dont-suck',
    input: 'source.html',
    count: 1
  },
  {
    command: 'prepare:so-many-spells',
    root: 'so-many-spells-preparation',
    source: 'somanyrobots-so-many-spells',
    input: 'source.html',
    count: 1
  },
  {
    command: 'prepare:kibbles-v23-spells',
    root: 'kibbles-casting-v23-preparation',
    source: 'kibblestasty-casting-compendium-v2.3',
    input: 'snapshot.json',
    count: 295
  }
]

/** Hash the exact artifact bytes used for offline replay. */
function sha256(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/** Run the repository's npm command in its own temporary output workspace. */
function replay(
  library: (typeof libraries)[number],
  contents: string,
  check: (workspace: string, run: (strict?: boolean) => ReturnType<typeof spawnSync>) => void
): void {
  const workspace = mkdtempSync(join(tmpdir(), 'openfray-direct-spells-'))
  try {
    const input = join(workspace, library.input)
    writeFileSync(input, contents)
    // npm executes scripts from the package directory; only the script path changes for isolation.
    const script = scripts[library.command].replace('node scripts/', `node "${repo}scripts/`) + '"'
    writeFileSync(
      join(workspace, 'package.json'),
      JSON.stringify({ private: true, scripts: { [library.command]: script } })
    )
    check(workspace, (strict = false) =>
      spawnSync('npm', ['run', library.command, '--', input, ...(strict ? ['--strict'] : [])], {
        cwd: workspace,
        encoding: 'utf8'
      })
    )
  } finally {
    rmSync(workspace, { recursive: true, force: true })
  }
}

/** Read a retained preparation report from the isolated workspace. */
function reportAt(workspace: string, root: string) {
  return JSON.parse(readFileSync(join(workspace, 'output', root, 'report.json'), 'utf8'))
}

/** Supply the source's synthetic replay input without private content. */
function inputFor(library: (typeof libraries)[number]): string {
  return library.input === 'source.html' ? gmBinderHtml() : JSON.stringify(kibblesSnapshot())
}

describe.each(libraries)('$command offline contract', (library) => {
  it('retains candidate bytes, attribution, source evidence hashes, and closed publication gates', () => {
    replay(library, inputFor(library), (workspace, run) => {
      const result = run()
      expect(result.status, String(result.stderr)).toBe(0)
      const report = reportAt(workspace, library.root)
      expect(report).toMatchObject({
        source: library.source,
        keptCount: library.count,
        publishable: false,
        license: 'CC-BY-4.0'
      })
      expect(report.attribution).toContain('https://creativecommons.org/licenses/by/4.0/legalcode')
      expect(report.blockers.length).toBeGreaterThan(0)
      if (library.input === 'source.html') {
        expect(readFileSync(join(workspace, 'output', library.root, 'source.html'), 'utf8')).toBe(
          gmBinderHtml()
        )
        expect(report.input).toBe('offline')
        expect(report.sha256).toBe(sha256(gmBinderHtml()))
      } else {
        expect(report.pdfSha256).toBe('a'.repeat(64))
        expect(report).toMatchObject({ version: '2.3', scope: 'all-spells' })
      }
      for (const [file, hash] of Object.entries(baseline[library.command])) {
        const bytes =
          file === 'report.json (without preparedAt)'
            ? JSON.stringify(
                Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'preparedAt')),
                null,
                2
              )
            : readFileSync(join(workspace, 'output', library.root, file))
        expect(sha256(bytes), file).toBe(hash)
      }
    })
  })

  it('fails strict replay while retaining candidates and review findings', () => {
    replay(library, inputFor(library), (workspace, run) => {
      const result = run(true)
      expect(result.status, String(result.stderr)).toBe(1)
      expect(reportAt(workspace, library.root).publishable).toBe(false)
      const candidates = JSON.parse(
        readFileSync(join(workspace, 'output', library.root, 'candidate-spells.json'), 'utf8')
      )
      expect(candidates).toHaveLength(library.count)
      expect(
        candidates.every(
          (spell: { mechanics?: unknown; edition?: unknown }) => !spell.mechanics && !spell.edition
        )
      ).toBe(true)
    })
  })

  it('retains withheld source findings during strict replay', () => {
    let input: string
    if (library.input === 'source.html') {
      input = gmBinderHtml().replace('<li><strong>Range:</strong> 60 feet</li>', '')
    } else {
      const snapshot = kibblesSnapshot()
      snapshot.blocks[0].extractionIssues = ['Unresolved source boundary']
      snapshot.unattachedStatBlocks = ['Unattached Spirit']
      input = JSON.stringify(snapshot)
    }
    replay(library, input, (workspace, run) => {
      const result = run(true)
      expect(result.status, String(result.stderr)).toBe(1)
      const report = reportAt(workspace, library.root)
      expect(report.withheld).toEqual([
        {
          name: library.input === 'source.html' ? 'Test Spell' : 'Become Stone',
          reason:
            library.input === 'source.html'
              ? 'Missing Range: Test Spell'
              : 'Unresolved source boundary'
        }
      ])
      if (library.input !== 'source.html')
        expect(report.unattachedStatBlocks).toEqual(['Unattached Spirit'])
    })
  })
})
