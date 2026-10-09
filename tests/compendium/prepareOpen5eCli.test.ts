// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const script = fileURLToPath(new URL('../../scripts/prepare-open5e.ts', import.meta.url))
const validator = fileURLToPath(new URL('../../scripts/validate-compendium.ts', import.meta.url))

it('does not prepare any withdrawn bestiary through the active all batch', () => {
  const dir = mkdtempSync(join(tmpdir(), 'openfray-empty-batch-'))
  try {
    const result = spawnSync(process.execPath, [script, 'all'], { cwd: dir, encoding: 'utf8' })
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('No active Open5e bestiaries selected')
    expect(existsSync(join(dir, 'output'))).toBe(false)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

it('uses the same cited exceptions in preparation and the validator CLI without clearing publishing blockers', () => {
  const dir = mkdtempSync(join(tmpdir(), 'openfray-reviewed-'))
  try {
    const cache = join(dir, 'cache.json')
    writeFileSync(cache, JSON.stringify({ document: { key: 'a5e-mm' }, fetchedAt: '2026-10-08T00:00:00Z', records: [{
      key: 'a5e-mm_black-dragon-wyrmling', name: 'Black Dragon Wyrmling', document: { key: 'a5e-mm' },
      armor_class: 17, hit_points: 44, hit_dice: '8d8+6', challenge_rating: 2, size: { name: 'Medium' }, type: { name: 'Dragon' },
      ability_scores: { strength: 14, dexterity: 16, constitution: 12, intelligence: 10, wisdom: 10, charisma: 12 },
    }] }))
    const prepared = spawnSync(process.execPath, [script, 'a5e-mm', cache], { cwd: dir, encoding: 'utf8' })
    expect(prepared.status, prepared.stderr).toBe(0)
    const datasetPath = join(dir, 'output/open5e-preparation/a5e-mm/candidate-creatures.json')
    const report = JSON.parse(readFileSync(join(dir, 'output/open5e-preparation/a5e-mm/report.json'), 'utf8'))
    expect(report.validation.errors).toBe(0)
    expect(report.reviewedExceptions).toHaveLength(1)
    expect(report.publishable).toBe(false)
    const checked = spawnSync(process.execPath, [validator, datasetPath], { cwd: dir, encoding: 'utf8' })
    expect(checked.status, checked.stderr).toBe(0)
    expect(checked.stdout).toContain('reviewed published exceptions: 1')
    expect(checked.stdout).toContain('https://a5esrd.com/')
    const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'))
    dataset[0].maxHp = 43
    writeFileSync(datasetPath, JSON.stringify(dataset))
    const drifted = spawnSync(process.execPath, [validator, datasetPath], { cwd: dir, encoding: 'utf8' })
    expect(drifted.status).toBe(1)
    expect(drifted.stdout).toContain('reviewed published exceptions: 0')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

it('replays offline, records missing provenance, and fails the strict publishing gate', () => {
  const dir = mkdtempSync(join(tmpdir(), 'openfray-open5e-'))
  try {
    const cache = join(dir, 'cache.json')
    writeFileSync(cache, JSON.stringify({ document: { key: 'bfrd' }, fetchedAt: '2026-10-08T00:00:00Z', records: [{
      key: 'bfrd_test', name: 'Test Creature', document: { key: 'bfrd' },
      armor_class: 10, hit_points: 4, challenge_rating: 0, size: { name: 'Medium' }, type: { name: 'Beast' },
      ability_scores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    }] }))
    const prepared = spawnSync(process.execPath, [script, 'bfrd', cache], { cwd: dir, encoding: 'utf8' })
    expect(prepared.status, prepared.stderr).toBe(0)
    const report = JSON.parse(readFileSync(join(dir, 'output/open5e-preparation/bfrd/report.json'), 'utf8'))
    expect(report.publishable).toBe(false)
    expect(report.blockers.some((b: string) => b.includes('lacks v1 provenance'))).toBe(true)
    expect(report.rawCount).toBe(1)
    const statistics = JSON.parse(readFileSync(join(dir, 'output/open5e-preparation/bfrd/source-statistics.json'), 'utf8'))
    expect(statistics[0].status).toBe('unverified-open5e')
    expect(statistics[0].stealth).toBeNull()
    expect(statistics[0].perception).toBeNull()
    expect(Object.values(statistics[0].modifiers)).toEqual([null, null, null, null, null, null])
    const strict = spawnSync(process.execPath, [script, 'bfrd', cache, '--strict'], { cwd: dir, encoding: 'utf8' })
    expect(strict.status, strict.stderr).toBe(1)
    const removed = spawnSync(process.execPath, [script, 'tdcs', cache], { cwd: dir, encoding: 'utf8' })
    expect(removed.status).not.toBe(0)
    expect(removed.stderr).toContain('Unknown candidate: tdcs')
    const wrong = spawnSync(process.execPath, [script, 'tob-2023', cache], { cwd: dir, encoding: 'utf8' })
    expect(wrong.status).not.toBe(0)
    expect(wrong.stderr).toContain('Cache document does not match')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
