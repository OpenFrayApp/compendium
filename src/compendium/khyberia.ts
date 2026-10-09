// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Creature } from '../schema/creature.ts'
import { mapTob3, type Tob3Block } from './tob3.ts'

export const KHYBERIA_SOURCE = 'khyberia-srd'
export const KHYBERIA_PDF_SHA256 = '738c28c69c459e2bf1b91e416aa8a7dd2d286ee1da32a2de48c3cb98acbfb0be'
export const KHYBERIA_NAMES = [
  'Frogoblin', 'Frogoblin Chorister', 'Frogoblin Faerie Knight', 'Frogoblin Hopper',
  'Frogoblin Hunter', 'Frogoblin Princess', 'Cudrone', 'Dihedrone', 'Dodecatron',
  'Hemicudrone', 'Icosahedrone', 'Octahedrone', 'Tetrahedrone', 'Trapezohedrone',
  'Kyanos B’lot', 'Magentos B’lot', 'Xanthos B’lot', 'Muck Mephit', 'War Snail',
  'Water Guardian', 'Wodyanoi',
] as const

/** Required notices, transcribed from page 1 of the supplied October 2023 PDF. */
export const KHYBERIA_ATTRIBUTION = [
  'This work includes material taken from the Khyberia SRD by Nick Stefanski, available at www.khyberia.com. The Khyberia SRD is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  'This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  'This work includes material taken from the A5E System Reference Document (A5ESRD) by EN Publishing and available at A5ESRD.com, based on Level Up: Advanced 5th Edition, available at www.levelup5e.com. The A5ESRD is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
] as const

export interface KhyberiaSnapshot {
  source: string
  sha256: string
  pages: number
  legal: string
  blocks: Tob3Block[]
}

/** Convert a conventional 2014 stat block without treating optional damage as additive. */
export function mapKhyberia(block: Tob3Block): Creature {
  const creature = mapTob3(block, KHYBERIA_SOURCE)
  if (block.name === 'Water Guardian') {
    // This qualifier applies to all three physical types, not just slashing.
    creature.resistances = ['acid', 'fire', 'bludgeoning, piercing, and slashing from nonmagical attacks']
  }
  creature.name = block.name // Preserve the author's spelling (including B’lot).
  const languages = creature.languages?.filter((language) => language !== '-')
  if (languages?.length) creature.languages = languages
  else delete creature.languages

  // The shared mapper lifts spell lists into structured fields. Keep the original
  // rule as well: focuses, components and casting restrictions still matter.
  for (const trait of block.traits.filter((entry) => /spellcasting/i.test(entry.name))) {
    if (!creature.traits?.some((entry) => entry.name === trait.name)) {
      (creature.traits ??= []).push({ ...trait })
    }
  }

  for (const action of creature.actions ?? []) {
    // These are choices, not simultaneous damage components. The full printed
    // attack remains available; the GM resolves the choice at the table.
    const damageType = '(?:acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)'
    const damageChoice = new RegExp(`\\bdamage,?\\s+or\\s+\\d|\\b${damageType}(?:\\s+damage)?\\s+or\\s+${damageType}\\b`, 'i')
    if (damageChoice.test(action.text ?? '')) delete action.damage
    // Three independently targeted, automatically hitting darts are not one roll
    // against an attack target. Preserve the complete Magic Missile rule in prose.
    if (action.name === 'Magic Missile') delete action.damage
  }
  return creature
}

/** Fail closed for other revisions, incomplete exports, or the older ten-creature SRD. */
export function mapKhyberiaSnapshot(snapshot: KhyberiaSnapshot): Creature[] {
  if (snapshot.source !== KHYBERIA_SOURCE || snapshot.sha256 !== KHYBERIA_PDF_SHA256 || snapshot.pages !== 14) {
    throw new Error('Expected the reviewed 14-page October 2023 Khyberia SRD PDF')
  }
  if (!snapshot.legal.includes('CC-BY-4.0') || !snapshot.legal.includes('Nick Stefanski') || !snapshot.legal.includes('A5ESRD')) {
    throw new Error('Missing Khyberia license or upstream attribution')
  }
  if (snapshot.blocks.length !== KHYBERIA_NAMES.length || snapshot.blocks.some((block, index) => block.name !== KHYBERIA_NAMES[index])) {
    throw new Error('Expected all 21 reviewed Khyberia creatures in source order')
  }
  return snapshot.blocks.map(mapKhyberia)
}
