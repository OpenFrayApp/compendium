// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import type { Spell } from '../../src/schema/spell.ts'
import { emitValidatedDataset } from '../../src/compendium/datasetEmission.ts'
import { validateSpellDataset } from '../../src/compendium/validate.ts'

it('allows a source runner to retain input order, indentation, and its validation report', () => {
  const directory = mkdtempSync(join(tmpdir(), 'compendium-emission-'))
  try {
    const spell: Spell = {
      id: 'srd-5.2:b',
      source: 'srd-5.2',
      edition: '5.5',
      name: 'B',
      level: 1,
      school: 'Abjuration',
      castingTime: '1 action',
      range: 'Touch',
      components: { verbal: true, somatic: false, material: false },
      duration: 'Instantaneous',
      concentration: false,
      ritual: false,
      text: 'Synthetic rules fixture.'
    }
    const records = [spell, { ...spell, id: 'srd-5.2:a', name: 'A' }]
    const destination = join(directory, 'nested', 'spells.json')
    const reports: unknown[] = []
    const report = emitValidatedDataset(records, destination, {
      validate: validateSpellDataset,
      report: (report) => reports.push(report),
      space: 2
    })
    expect(reports).toEqual([{ count: 2, errors: 0, warns: 0, issues: [], errorsByField: {} }])
    expect(report).toBe(reports[0])
    const bytes = readFileSync(destination, 'utf8')
    expect(bytes.startsWith('[\n  {\n    "id": "srd-5.2:b",')).toBe(true)
    expect(bytes.endsWith('\n]')).toBe(true)
    expect(JSON.parse(bytes).map((record: { name: string }) => record.name)).toEqual(['B', 'A'])
    expect(records.map((record) => record.name)).toEqual(['B', 'A'])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
