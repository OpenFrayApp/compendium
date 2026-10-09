// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Open5eRecord } from './open5e.ts'

type Correction = {
  from: number
  to: number
  evidence: string
} & (
  | { field: 'ability_scores' | 'saving_throws'; ability: string }
  | { field: 'challenge_rating' | 'experience_points' }
)

const AF = 'https://a5esrd.com/s/a5e_srd_191_monsters_A-F.pdf'
const GZ = 'https://a5esrd.com/s/a5e_srd_192_monsters_G-Z.pdf'

// These replace transcription defects only. Printed arithmetic inconsistencies
// remain in the dataset and validator report until separately reviewed.
export const OPEN5E_CORRECTIONS: Record<string, Correction[]> = {
  'a5e-mm_adult-earth-dragon': [
    { field: 'ability_scores', ability: 'intelligence', from: 22, to: 14, evidence: `${AF}: Adult Earth Dragon ability row` },
    { field: 'ability_scores', ability: 'wisdom', from: 14, to: 20, evidence: `${AF}: Adult Earth Dragon ability row` },
    { field: 'ability_scores', ability: 'charisma', from: 20, to: 12, evidence: `${AF}: Adult Earth Dragon ability row` },
  ],
  'a5e-mm_ancient-green-dragon': [
    { field: 'ability_scores', ability: 'charisma', from: 28, to: 18, evidence: `${AF}: Ancient Green Dragon ability row` },
  ],
  'a5e-mm_divi': [
    { field: 'ability_scores', ability: 'intelligence', from: 5, to: 12, evidence: `${GZ}: Divi ability row` },
    { field: 'ability_scores', ability: 'wisdom', from: 6, to: 14, evidence: `${GZ}: Divi ability row` },
    { field: 'ability_scores', ability: 'charisma', from: 6, to: 14, evidence: `${GZ}: Divi ability row` },
  ],
  'a5e-mm_divi-noble': [
    { field: 'ability_scores', ability: 'intelligence', from: 5, to: 12, evidence: `${GZ}: Divi Noble retains the Divi ability row; its variant changes HP and traits` },
    { field: 'ability_scores', ability: 'wisdom', from: 6, to: 14, evidence: `${GZ}: Divi Noble retains the Divi ability row` },
    { field: 'ability_scores', ability: 'charisma', from: 6, to: 14, evidence: `${GZ}: Divi Noble retains the Divi ability row` },
  ],
  'a5e-mm_khalkos-spawn': [
    { field: 'ability_scores', ability: 'intelligence', from: 18, to: 16, evidence: `${GZ}: Khalkos Spawn ability row` },
  ],
  'a5e-mm_swarm-of-khalkos-spawn': [
    { field: 'ability_scores', ability: 'intelligence', from: 18, to: 16, evidence: `${GZ}: Swarm of Khalkos Spawn ability row` },
  ],
  'a5e-mm_fallen-solar': [
    { field: 'ability_scores', ability: 'intelligence', from: 22, to: 28, evidence: `${AF}: Solar ability row and Fallen Angel variant, which changes only vulnerability and adds an action` },
    { field: 'saving_throws', ability: 'wisdom', from: 0, to: 17, evidence: `${AF}: Solar Saving Throws Wis +17; Fallen Angel retains those saves` },
  ],
  'a5e-mm_great-wyrm-green-dragon': [
    { field: 'ability_scores', ability: 'charisma', from: 28, to: 18, evidence: `${AF}: Ancient Green Dragon ability row and Green Great Wyrm variant, which retains those scores` },
  ],
  'a5e-mm_hezrou': [
    { field: 'challenge_rating', from: 10, to: 8, evidence: `${AF}: Hezrou CHALLENGE 8` },
    { field: 'experience_points', from: 5900, to: 3900, evidence: `${AF}: Hezrou 3,900 XP` },
  ],
  'tob-2023_dwarven-ringmage': [
    { field: 'saving_throws', ability: 'constitution', from: 4, to: 5, evidence: 'https://koboldpress.com/errata/: Tome of Beasts (2023), 05/29/2025, page 409: Int +7, Con +5, Wis +4' },
  ],
  'tob-2023_valkyrie': [
    { field: 'saving_throws', ability: 'constitution', from: 11, to: 7, evidence: 'https://koboldpress.com/errata/: Tome of Beasts (2023), 05/29/2025, page 379: Con +7, Int +5, Wis +8, Cha +8' },
    { field: 'saving_throws', ability: 'charisma', from: 12, to: 8, evidence: 'https://koboldpress.com/errata/: Tome of Beasts (2023), 05/29/2025, page 379: Con +7, Int +5, Wis +8, Cha +8' },
  ],
  'a5e-mm_solar': [
    { field: 'ability_scores', ability: 'intelligence', from: 22, to: 28, evidence: `${AF}: Solar ability row` },
    { field: 'saving_throws', ability: 'wisdom', from: 0, to: 17, evidence: `${AF}: Solar Saving Throws Wis +17` },
  ],
}

/** Apply cited transcription fixes only when the expected defective value is still present. */
export function correctOpen5e(record: Open5eRecord) {
  const corrected: Open5eRecord = {
    ...record, ability_scores: { ...record.ability_scores }, saving_throws: { ...record.saving_throws },
  }
  const applied: Correction[] = []
  for (const correction of OPEN5E_CORRECTIONS[record.key] ?? []) {
    if (correction.field === 'ability_scores' || correction.field === 'saving_throws') {
      const fields = corrected[correction.field]!
      if (fields[correction.ability] === correction.to) continue
      if (fields[correction.ability] !== correction.from) {
        throw new Error(`Correction drift: ${record.key}.${correction.field}.${correction.ability}`)
      }
      fields[correction.ability] = correction.to
    } else {
      if (corrected[correction.field] === correction.to) continue
      if (corrected[correction.field] !== correction.from) throw new Error(`Correction drift: ${record.key}.${correction.field}`)
      corrected[correction.field] = correction.to
    }
    applied.push(correction)
  }
  return { corrected, applied }
}
