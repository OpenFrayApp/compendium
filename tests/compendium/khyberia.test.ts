// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'vitest'
import { fileURLToPath } from 'node:url'
import {
  KHYBERIA_ATTRIBUTION, KHYBERIA_NAMES, mapKhyberiaSnapshot, type KhyberiaSnapshot,
} from '../../src/compendium/khyberia.ts'
import { validateDataset } from '../../src/compendium/validate.ts'

const fixturePath = fileURLToPath(new URL('../fixtures/khyberia/blocks.json', import.meta.url))
const snapshot: KhyberiaSnapshot = JSON.parse(readFileSync(fixturePath, 'utf8'))
const creatures = mapKhyberiaSnapshot(snapshot)
/** Find a mapped creature by its printed source name. */
const creature = (name: string) => creatures.find((entry) => entry.name === name)!

test('maps all 21 October 2023 creatures as 5e, preserving pages and all six scores', () => {
  assert.deepEqual(creatures.map((entry) => entry.name), [...KHYBERIA_NAMES])
  for (const [index, entry] of creatures.entries()) {
    assert.equal(entry.source, 'khyberia-srd')
    assert.equal(entry.edition, '5.0')
    assert.equal(entry.sourcePage, snapshot.blocks[index].sourcePage)
    const scores = [...snapshot.blocks[index].header.join(' ').matchAll(/(\d+)\s*\([+−–-]\d+\)/g)].map((match) => Number(match[1]))
    assert.deepEqual(Object.values(entry.abilities!), scores)
    const hp = /Hit Points (\d+) \(([^)]+)\)/.exec(snapshot.blocks[index].header.join(' '))!
    assert.equal(entry.maxHp, Number(hp[1]))
    assert.equal(entry.hpFormula, hp[2].replace(/\s/g, ''))
    const ac = /Armor Class (\d+)/.exec(snapshot.blocks[index].header.join(' '))!
    assert.equal(entry.ac, Number(ac[1]))
  }
  assert.equal(new Set(creatures.map((entry) => entry.id)).size, 21)
})

test('retains every trait, attack and action rule, including spellcasting limitations', () => {
  for (const [index, entry] of creatures.entries()) {
    const block = snapshot.blocks[index]
    for (const trait of block.traits) assert.ok(entry.traits?.some((mapped) => mapped.name === trait.name && mapped.text === trait.text), `${entry.name}: ${trait.name}`)
    for (const [section, entries] of Object.entries(block.sections)) {
      const mapped = section === 'Actions' ? entry.actions : section === 'Bonus Actions' ? entry.bonusActions : entry.reactions
      for (const action of entries) assert.ok(mapped?.some((mapped) => mapped.text === action.text), `${entry.name}: ${action.name}`)
    }
  }
  assert.ok(creature('Frogoblin Chorister').spellcasting?.groups.length)
  assert.match(creature('Frogoblin Chorister').traits!.find((trait) => trait.name === 'Spellcasting')!.text, /4th-level spellcaster/)
})

test('ordinary hybrid attacks retain both their melee reach and ranged distances', () => {
  const javelin = creature('Frogoblin').actions!.find((action) => action.name === 'Javelin')!
  assert.equal(javelin.toHit, 3)
  assert.equal(javelin.reach, 5)
  assert.deepEqual(javelin.range, { normal: 30, long: 120 })
  assert.deepEqual(javelin.damage, [{ formula: '1d6+1', type: 'piercing' }])
})

test('conditional and alternative damage is not added together or assigned a default element', () => {
  for (const [name, actionName] of [
    ['Frogoblin Chorister', 'Club'], ['Frogoblin Hopper', 'Spear'],
    ['Kyanos B’lot', 'Bite'], ['Kyanos B’lot', 'Claw'], ['Magentos B’lot', 'Claw'],
    ['Xanthos B’lot', 'Bite (B’lot Form Only)'], ['Xanthos B’lot', 'Quarterstaff'],
  ]) {
    const action = creature(name).actions!.find((action) => action.name === actionName)!
    assert.equal(action.damage, undefined, `${name}: ${actionName}`)
    assert.match(action.text!, /\bor\b/)
  }
  assert.deepEqual(creature('War Snail').actions!.find((action) => action.name === 'Armed Tentacle')!.damage, [
    { formula: '1d6+3', type: 'bludgeoning' }, { formula: '1d6+3', type: 'piercing' },
  ])
})

test('keeps the Chaos Swell table and local condition definitions with their creatures', () => {
  const table = creature('Xanthos B’lot').traits!.find((trait) => trait.name === 'Chaos Swell table')!.text
  assert.match(table, /1d12/)
  assert.match(table, /12/)
  assert.match(table, /flesh to stone/)
  assert.match(table, /The target gains the effects of a heal spell/)
  assert.match(creature('Trapezohedrone').actions!.find((action) => action.name === 'Metallic Screech')!.text!, /becomes shaken:/)
  assert.match(creature('Kyanos B’lot').actions!.find((action) => action.name === 'Claw')!.text!, /target is slowed;/)
})

test('preserves rest recovery without converting it into daily use', () => {
  const action = creature('War Snail').actions!.find((action) => action.name.startsWith('Scintillating Colors'))!
  assert.match(action.name, /Short or Long Rest/)
  assert.equal(action.recharge, undefined)
  assert.deepEqual(action.save, { ability: 'wis', dc: 15, onSave: 'negates' })
  assert.deepEqual(creature('Wodyanoi').actions!.find((action) => action.name === 'Gyre')!.recharge, { type: 'dice', value: 5 })
})

test('never makes conditional defenses or advantage unconditional', () => {
  assert.deepEqual(creature('Water Guardian').resistances, ['acid', 'fire', 'bludgeoning, piercing, and slashing from nonmagical attacks'])
  assert.equal(creature('War Snail').ac, 16)
  assert.equal(creature('War Snail').languages, undefined)
  assert.equal(creature('Water Guardian').languages, undefined)
  assert.ok(creature('Frogoblin Hopper').traits?.some((trait) => /advantage/.test(trait.text)))
})

test('preserves published discrepancies and does not invent Wodyanoi’s omitted Gyre DC', () => {
  const report = validateDataset(creatures)
  assert.equal(report.errors, 0)
  assert.equal(report.warns, 1)
  assert.equal(report.issues[0].name, 'Frogoblin Hunter')
  assert.equal(creature('Frogoblin Hunter').senses!.passivePerception, 12)
  const tusk = creature('Wodyanoi').actions!.find((action) => action.name === 'Tusk')!
  assert.match(tusk.text!, /Hit: 7 \(2d6 \+ 4\)/)
  assert.deepEqual(tusk.damage, [{ formula: '2d6+4', type: 'piercing' }])
  assert.equal(creature('Wodyanoi').actions!.find((action) => action.name === 'Gyre')!.save, undefined)
  const darts = creature('Tetrahedrone').actions!.find((action) => action.name === 'Magic Missile')!
  assert.equal(darts.kind, 'utility')
  assert.equal(darts.damage, undefined)
  assert.match(darts.text!, /three glowing darts/)
})

test('rejects other revisions, missing licenses, missing creatures and duplicate blocks', () => {
  assert.throws(() => mapKhyberiaSnapshot({ ...snapshot, sha256: 'other' }), /reviewed/)
  assert.throws(() => mapKhyberiaSnapshot({ ...snapshot, legal: '' }), /attribution/)
  assert.throws(() => mapKhyberiaSnapshot({ ...snapshot, blocks: snapshot.blocks.slice(0, 10) }), /all 21/)
  assert.throws(() => mapKhyberiaSnapshot({ ...snapshot, blocks: snapshot.blocks.map(() => snapshot.blocks[0]) }), /all 21/)
})

test('CLI generates the library with all required attribution and the adaptation notice', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'khyberia-ingest-'))
  try {
    const script = fileURLToPath(new URL('../../scripts/ingest-khyberia.ts', import.meta.url))
    const result = spawnSync(process.execPath, [script, fixturePath], { cwd, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, 'output/khyberia-creatures.json'), 'utf8')), creatures)
    const attribution = readFileSync(join(cwd, 'output/khyberia/ATTRIBUTION.md'), 'utf8')
    for (const notice of KHYBERIA_ATTRIBUTION) assert.ok(attribution.includes(notice))
    assert.match(attribution, /Adapted by OpenFray/)
    assert.match(attribution, /Published statistics were not corrected/)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
