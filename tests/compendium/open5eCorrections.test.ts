// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it } from 'vitest'
import { correctOpen5e } from '../../src/compendium/open5eCorrections.ts'
import { mapOpen5e, type Open5eRecord } from '../../src/compendium/open5e.ts'
import { validateDataset } from '../../src/compendium/validate.ts'

/** Construct the documented Adult Earth Dragon transcription defect. */
function earthDragon(): Open5eRecord {
  return {
    key: 'a5e-mm_adult-earth-dragon', name: 'Adult Earth Dragon', document: { key: 'a5e-mm' },
    ability_scores: { strength: 22, dexterity: 14, constitution: 22, intelligence: 22, wisdom: 14, charisma: 20 },
    saving_throws: { strength: 12, constitution: 12, intelligence: 8, wisdom: 8, charisma: 7 },
  }
}

it('applies primary-source corrections without mutating the raw snapshot or adjusting published saves', () => {
  const raw = earthDragon()
  const result = correctOpen5e(raw)
  expect(result.corrected.ability_scores).toEqual({ strength: 22, dexterity: 14, constitution: 22, intelligence: 14, wisdom: 20, charisma: 12 })
  expect(raw.ability_scores?.intelligence).toBe(22)
  expect(result.corrected.saving_throws?.wisdom).toBe(8)
  expect(result.applied).toHaveLength(3)
  expect(result.applied.every((fix) => fix.evidence.startsWith('https://a5esrd.com/'))).toBe(true)
})

it('corrects Hezrou CR and XP together rather than waiving its saving throws', () => {
  const raw: Open5eRecord = {
    key: 'a5e-mm_hezrou', name: 'Hezrou', document: { key: 'a5e-mm' },
    size: { name: 'Large' }, type: { name: 'Fiend' }, armor_class: 16,
    hit_points: 136, hit_dice: '13d10+65', challenge_rating: 10, experience_points: 5900,
    ability_scores: { strength: 18, dexterity: 16, constitution: 20, intelligence: 8, wisdom: 12, charisma: 12 },
    saving_throws: { strength: 7, constitution: 8, intelligence: 2, wisdom: 4 },
  }
  const { corrected, applied } = correctOpen5e(raw)
  const mapped = mapOpen5e(corrected, 'en-publishing-a5e-mm')
  expect(mapped.cr).toBe(8)
  expect(mapped.xp).toBe(3900)
  expect(mapped.saves).toEqual({ str: 7, con: 8, int: 2, wis: 4 })
  expect(validateDataset([mapped]).errors).toBe(0)
  expect(applied).toHaveLength(2)
  expect(raw.challenge_rating).toBe(10)
  expect(raw.experience_points).toBe(5900)
  expect(correctOpen5e(corrected).applied).toEqual([])
  expect(() => correctOpen5e({ ...raw, challenge_rating: 9 })).toThrow('Correction drift')
})

it('applies the correct 2023 Tome errata without changing other saves or editions', () => {
  const ringmage = correctOpen5e({
    key: 'tob-2023_dwarven-ringmage', name: 'Dwarven Ringmage', document: { key: 'tob-2023' },
    saving_throws: { constitution: 4, intelligence: 7, wisdom: 4 },
  })
  expect(ringmage.corrected.saving_throws).toEqual({ constitution: 5, intelligence: 7, wisdom: 4 })
  const valkyrie = correctOpen5e({
    key: 'tob-2023_valkyrie', name: 'Valkyrie', document: { key: 'tob-2023' },
    saving_throws: { constitution: 11, intelligence: 5, wisdom: 8, charisma: 12 },
  })
  expect(valkyrie.corrected.saving_throws).toEqual({ constitution: 7, intelligence: 5, wisdom: 8, charisma: 8 })
  expect(valkyrie.applied.every((fix) => fix.evidence.includes('Tome of Beasts (2023)'))).toBe(true)
  const original = correctOpen5e({ ...valkyrie.corrected, key: 'tob_valkyrie' })
  expect(original.applied).toEqual([])
})

it('corrects only verified inherited scores and saves for published variants', () => {
  const fallen = correctOpen5e({
    key: 'a5e-mm_fallen-solar', name: 'Fallen Solar', document: { key: 'a5e-mm' },
    ability_scores: { intelligence: 22 }, saving_throws: { wisdom: 0 },
  })
  expect(fallen.corrected.ability_scores?.intelligence).toBe(28)
  expect(fallen.corrected.saving_throws?.wisdom).toBe(17)
  const wyrm = correctOpen5e({
    key: 'a5e-mm_great-wyrm-green-dragon', name: 'Great Wyrm Green Dragon', document: { key: 'a5e-mm' },
    ability_scores: { charisma: 28 },
  })
  expect(wyrm.corrected.ability_scores?.charisma).toBe(18)
})

it('accepts corrected upstream values and rejects unreviewed correction drift', () => {
  const corrected = correctOpen5e(earthDragon()).corrected
  expect(correctOpen5e(corrected).applied).toEqual([])
  const changed = earthDragon()
  changed.ability_scores!.intelligence = 18
  expect(() => correctOpen5e(changed)).toThrow('Correction drift')
})
