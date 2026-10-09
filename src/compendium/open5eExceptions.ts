// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Ability } from '../schema/primitives.ts'
import type { ValidationException } from './validate.ts'

const SOURCE = 'en-publishing-a5e-mm'
const AF = 'https://a5esrd.com/s/a5e_srd_191_monsters_A-F.pdf'
const GZ = 'https://a5esrd.com/s/a5e_srd_192_monsters_G-Z.pdf'
const PUBLISHED = 'Preserve the publisher’s printed saving throw; it differs from the standard CR-derived arithmetic.'
const INHERITED = 'The publisher’s variant changes CR and other listed features while retaining these base-creature saving throws.'

/** Record exact source, CR, score, and save guards for a verified published deviation. */
function saves(slug: string, cr: number, rows: [Ability, number, number][], evidence: string, reason = PUBLISHED): ValidationException[] {
  return rows.map(([ability, score, value]) => ({
    id: `${SOURCE}:${slug}`, source: SOURCE, field: 'save', ability, score, cr, value, reason, evidence,
  }))
}

/** Record both published HP fields without changing either to force agreement. */
function hp(slug: string, maxHp: number, formula: string, evidence: string): ValidationException {
  return {
    id: `${SOURCE}:${slug}`, source: SOURCE, field: 'hpFormula', maxHp, formula, evidence,
    reason: 'The publisher prints this HP total and dice formula together; preserve both despite their arithmetic disagreement.',
  }
}

export const OPEN5E_VALIDATION_EXCEPTIONS: readonly ValidationException[] = [
  ...saves('adult-earth-dragon', 18, [['wis', 20, 8]], `${AF}: Adult Earth Dragon ability row and Saving Throws`),
  ...saves('adult-river-dragon', 17, [['dex', 20, 9], ['con', 18, 8], ['int', 14, 6], ['wis', 20, 9], ['cha', 16, 7]], `${AF}: Adult River Dragon ability row and Saving Throws`),
  ...saves('adult-sapphire-dragon', 19, [['cha', 16, 10]], `${AF}: Adult Sapphire Dragon prints CHA 16 (+4) and Cha +10`),
  ...saves('ancient-sapphire-dragon', 25, [['con', 22, 13], ['int', 26, 15], ['wis', 24, 14], ['cha', 20, 12]], `${AF}: Ancient Sapphire Dragon prints Proficiency +7 and these saves at CR 25`),
  ...saves('balor-general', 24, [['str', 26, 14], ['dex', 18, 10], ['con', 20, 11], ['wis', 20, 11], ['cha', 22, 12]], `${AF}: Balor Saving Throws and Balor General variant`, INHERITED),
  ...saves('bone-devil', 9, [['int', 16, 6], ['wis', 14, 7]], `${AF}: Bone Devil ability row and Saving Throws`),
  ...saves('coven-green-hag', 5, [['con', 14, 4], ['wis', 14, 4]], `${GZ}: Green Hag Saving Throws and Coven Green Hag variant`, INHERITED),
  ...saves('coven-winter-hag', 9, [['con', 16, 6], ['wis', 16, 6]], `${GZ}: Winter Hag Saving Throws and Coven Winter Hag variant`, INHERITED),
  ...saves('dread-knight-champion', 23, [['dex', 16, 9], ['con', 22, 12], ['int', 14, 8], ['wis', 18, 10], ['cha', 20, 11]], `${AF}: Dread Knight Saving Throws and Dread Knight Champion variant`, INHERITED),
  ...saves('greater-sphinx', 17, [['dex', 14, 6], ['con', 18, 8], ['int', 18, 8], ['wis', 22, 10]], `${GZ}: Sphinx Saving Throws and Greater Sphinx variant`, INHERITED),
  ...saves('ur-otyugh', 10, [['str', 16, 6], ['con', 16, 6]], `${GZ}: Otyugh Saving Throws and Ur-Otyugh variant`, INHERITED),
  ...saves('ancient-silver-dragon', 25, [['dex', 14, 9], ['con', 28, 16], ['wis', 14, 9], ['cha', 22, 13]], `${AF}: Ancient Silver Dragon prints Proficiency +7 and these saves at CR 25`),
  ...saves('young-bronze-dragon', 10, [['cha', 18, 7]], `${AF}: Young Bronze Dragon prints CHA 18 (+3) and Cha +7`),
  ...saves('vampire-mage', 13, [['dex', 18, 8], ['wis', 16, 7], ['cha', 18, 8]], `${GZ}: Vampire Saving Throws and Vampire Mage variant`, INHERITED),
  hp('ogre-zombie', 59, '7d10+28', `${GZ}: Ogre Zombie HP 59 (7d10 + 28)`),
  hp('ogre-flesh-heap', 59, '7d10+28', `${GZ}: Ogre Flesh Heap variant retains Ogre Zombie HP and adds reactions`),
  hp('black-dragon-wyrmling', 44, '8d8+6', `${AF}: Black Dragon Wyrmling HP 44 (8d8 + 6)`),
  hp('grick', 33, '6d8+12', `${GZ}: Grick HP 33 (6d8 + 12)`),
  hp('wallflower', 33, '6d8+12', `${GZ}: Wallflower variant retains Grick HP and changes type, speed, and Camouflage`),
  hp('djinni-noble', 344, '30d10+180', `${GZ}: Djinni Noble HP 344 (30d10 + 180)`),
  hp('efreeti-noble', 344, '30d10+180', `${GZ}: Efreeti Noble HP 344 (30d10 + 180)`),
  hp('marid-noble', 344, '30d10+180', `${GZ}: Marid Noble HP 344 (30d10 + 180)`),
]
