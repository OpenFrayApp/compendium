// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  REFERENCE_SPELL_APPROVALS,
  type ReferenceSpellApproval
} from '../src/compendium/referenceSpellPublication.ts'
import { sha256 } from './lib/sha256.ts'

interface OfflineBaseline {
  datasets: { command: string; count: number; sources: string[]; sha256: string }[]
  approvalModule: { path: string; sha256: string }
  referenceSpellApprovals: ReferenceSpellApproval[]
}

const baseline: OfflineBaseline = JSON.parse(
  readFileSync(process.argv[2] ?? 'tests/fixtures/verification/offline-baseline.json', 'utf8')
)
const directory = mkdtempSync(join(tmpdir(), 'compendium-offline-'))
try {
  for (const expected of baseline.datasets) {
    const output = join(directory, `${expected.command.replace(':', '-')}.json`)
    const result = spawnSync('npm', ['run', expected.command, '--', output], {
      encoding: 'utf8',
      env: { ...process.env, npm_config_offline: 'true' }
    })
    assert.equal(result.status, 0, `${expected.command} failed: ${result.error ?? result.stderr}`)
    const bytes = readFileSync(output)
    assert.equal(sha256(bytes), expected.sha256, `Output baseline changed: ${expected.command}`)
    const records: { source: string }[] = JSON.parse(bytes.toString('utf8'))
    assert.equal(records.length, expected.count)
    assert.deepEqual([...new Set(records.map((record) => record.source))], expected.sources)
    console.log(`${expected.command}: ${records.length} records match ${expected.sha256}`)
  }
  assert.equal(
    sha256(readFileSync(baseline.approvalModule.path)),
    baseline.approvalModule.sha256,
    'Publication approval module bytes changed'
  )
  assert.deepEqual(
    REFERENCE_SPELL_APPROVALS,
    baseline.referenceSpellApprovals,
    'Publication approval records changed'
  )
  console.log(`${REFERENCE_SPELL_APPROVALS.length} publication approval records match`)
} finally {
  rmSync(directory, { recursive: true, force: true })
}
