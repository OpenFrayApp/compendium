// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const directories: string[] = []
afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
)

/** Supply controlled process-boundary executables to observe required check sequencing. */
function checkEnvironment(failure = '') {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-verify-'))
  directories.push(directory)
  const log = join(directory, 'checks.log')
  const executable = `#!${process.execPath}
const fs = require('node:fs')
const check = process.argv[1].endsWith('python') ? 'python' : process.argv.slice(2).join(' ')
fs.appendFileSync(process.env.CHECK_LOG, check + '\\n')
process.exit(check === process.env.FAIL_CHECK ? 7 : 0)
`
  for (const name of ['python', 'npm'])
    writeFileSync(join(directory, name), executable, { mode: 0o755 })
  return {
    log,
    env: {
      ...process.env,
      PYTHON: join(directory, 'python'),
      PATH: `${directory}:${process.env.PATH}`,
      CHECK_LOG: log,
      FAIL_CHECK: failure
    }
  }
}

describe('verification command', () => {
  it('runs every required language check when preceding checks pass', () => {
    const { log, env } = checkEnvironment()
    const result = spawnSync(process.execPath, ['scripts/verify.mjs'], { env })
    expect(result.status).toBe(0)
    expect(readFileSync(log, 'utf8')).toBe('python\ntest\nrun typecheck\n')
  })

  it.each(['python', 'test', 'run typecheck'])('propagates a failing %s check', (failure) => {
    const { env } = checkEnvironment(failure)
    const result = spawnSync(process.execPath, ['scripts/verify.mjs'], { env })
    expect(result.status).toBe(7)
  })

  it('fails explicitly when required Python dependencies are unavailable', () => {
    const result = spawnSync(process.env.PYTHON ?? 'python3', ['-S', 'scripts/test-python.py'], {
      encoding: 'utf8'
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Install requirements.txt')
  })

  it('fails explicitly when the required Python interpreter is unavailable', () => {
    const result = spawnSync(process.execPath, ['scripts/verify.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, PYTHON: '/missing-compendium-python' }
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Cannot run /missing-compendium-python')
  })
})
