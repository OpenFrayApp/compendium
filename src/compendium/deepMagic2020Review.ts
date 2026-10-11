// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from 'node:crypto'
import type { Spell } from '../schema/spell.ts'
import {
  reconcileDeepMagic2020Classes,
  restoreDeepMagic2020Classes
} from './deepMagic2020Classes.ts'
import {
  DEEP_MAGIC_2020_RITUAL_HOLDS,
  DEEP_MAGIC_2020_HEADER_CORRECTIONS,
  ERRATA,
  BOOK_TEXT_TAILS,
  TRANSCRIPTION_CORRECTIONS,
  MISSPELLED_CLASS_CARDS
} from './deepMagic2020Corrections.ts'
export {
  DEEP_MAGIC_2020_RITUAL_HOLDS,
  DEEP_MAGIC_2020_HEADER_CORRECTIONS
} from './deepMagic2020Corrections.ts'

export const DEEP_MAGIC_2020_PDF_SHA256 =
  '0f2e99f8184d8dbe93b9b1dcf0c90959cf7cd8c537d6ed327f1282e39fa486b8'
export const DEEP_MAGIC_2020_CANDIDATE_SHA256 =
  '29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6'

/** Apply publisher errata dated May 29, 2025 to the six affected non-held candidates. */
export function applyDeepMagic2020Errata(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 errata scope changed')
  const errata = ERRATA[spell.name]
  if (!errata) return spell
  let text = spell.text
  for (const replacement of errata.replacements ?? []) {
    if (text.split(replacement.before).length !== 2)
      throw new Error(`Deep Magic 2020 errata anchor changed for ${spell.name}`)
    text = text.replace(replacement.before, replacement.after)
  }
  if (errata.append) {
    if (text.includes(errata.append))
      throw new Error(`Deep Magic 2020 errata already present for ${spell.name}`)
    text += `\n\n${errata.append}`
  }
  return { ...spell, ...errata.fields, text }
}

/** Apply only visually verified corrections to the pinned, still-unapproved 2020 candidates. */
export function prepareDeepMagic2020Spells(content: string): Spell[] {
  if (createHash('sha256').update(content).digest('hex') !== DEEP_MAGIC_2020_CANDIDATE_SHA256)
    throw new Error('Deep Magic 2020 candidate snapshot changed; renew source review')
  const spells: Spell[] = JSON.parse(content)
  if (
    spells.length !== 515 ||
    new Set(spells.map((spell) => spell.id)).size !== 515 ||
    spells.some((spell) => spell.source !== 'kobold-press-deepm' || spell.mechanics)
  )
    throw new Error('Deep Magic 2020 candidate scope changed')
  const ropes = spells.filter((spell) => spell.name.startsWith('Anchoring Rope'))
  const rope = consolidateAnchoringRope(ropes)
  return spells
    .flatMap((spell) => {
      if (spell.id === 'kobold-press-deepm:anchoring-rope-reaction') return []
      if (spell.id === rope.id) return [rope]
      if ((DEEP_MAGIC_2020_RITUAL_HOLDS as readonly string[]).includes(spell.name)) return []
      let corrected = spell.name === 'Blood Armor' ? correctBloodArmor(spell) : spell
      corrected = applyDeepMagic2020BookHeaders(corrected)
      corrected = correctInstantSnare(corrected)
      corrected = correctDeepMagic2020BookText(corrected)
      corrected = correctDeepMagic2020Transcription(corrected)
      corrected = restoreDeepMagic2020Classes(corrected)
      corrected = correctDeepMagic2020ClassSpelling(corrected)
      corrected = reconcileDeepMagic2020Classes(corrected)
      return [applyDeepMagic2020Errata(corrected)]
    })
    .map(({ edition: _edition, ...reference }) => reference)
}

/** Remove verified API-only or non-mechanical tails while retaining printed spell mechanics. */
export function correctDeepMagic2020BookText(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 text review scope changed')
  if (!Object.hasOwn(BOOK_TEXT_TAILS, spell.name)) return spell
  const correction = BOOK_TEXT_TAILS[spell.name]
  if (
    spell.id !== correction.id ||
    !spell.text.endsWith(correction.suffix) ||
    spell.text.split(correction.suffix).length !== 2
  )
    throw new Error(`Deep Magic 2020 text evidence changed for ${spell.name}`)
  return {
    ...spell,
    sourcePage: correction.page,
    text: spell.text.slice(0, -correction.suffix.length)
  }
}

/** Restore visually checked source wording and rule subheads on pinned API cards. */
export function correctDeepMagic2020Transcription(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 transcription scope changed')
  if (!Object.hasOwn(TRANSCRIPTION_CORRECTIONS, spell.name)) return spell
  const correction = TRANSCRIPTION_CORRECTIONS[spell.name]
  if (spell.id !== correction.id || spell.text.split(correction.before).length !== 2)
    throw new Error(`Deep Magic 2020 transcription evidence changed for ${spell.name}`)
  return {
    ...spell,
    sourcePage: correction.page,
    text: spell.text.replace(correction.before, correction.after)
  }
}

/** Restore the printed Sorcerer class spelling for nine pinned API assignments. */
export function correctDeepMagic2020ClassSpelling(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 class-spelling scope changed')
  if (!(MISSPELLED_CLASS_CARDS as readonly string[]).includes(spell.name)) return spell
  if (!spell.classes?.includes('Sorceror') || spell.classes.includes('Sorcerer'))
    throw new Error(`Deep Magic 2020 class spelling changed for ${spell.name}`)
  return {
    ...spell,
    classes: spell.classes.map((name) => (name === 'Sorceror' ? 'Sorcerer' : name))
  }
}

/** Restore Instant Snare's printed scaling from physical page 87. */
export function correctInstantSnare(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 scaling review scope changed')
  if (spell.name !== 'Instant Snare') return spell
  const before = 'for each slot level above 3rd.'
  if (
    spell.id !== 'kobold-press-deepm:instant-snare' ||
    spell.level !== 2 ||
    spell.text.split(before).length !== 2
  )
    throw new Error('Instant Snare source evidence changed')
  return {
    ...spell,
    sourcePage: 86,
    text: spell.text.replace(before, 'for each slot level above 2nd.')
  }
}

/** Restore visually verified printed headers without inferring replacement mechanics. */
export function applyDeepMagic2020BookHeaders(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 book-header scope changed')
  if (!Object.hasOwn(DEEP_MAGIC_2020_HEADER_CORRECTIONS, spell.name)) return spell
  const correction = DEEP_MAGIC_2020_HEADER_CORRECTIONS[spell.name]
  if (
    spell.id !== correction.id ||
    Object.entries(correction.before).some(
      ([key, value]) => spell[key as keyof typeof correction.before] !== value
    )
  )
    throw new Error(`${spell.name} source evidence changed`)
  return { ...spell, ...correction.after, sourcePage: correction.page }
}

/** Restore the printed dual casting time and omit the API's duplicate reaction-only card. */
export function consolidateAnchoringRope(spells: Spell[]): Spell {
  const action = spells.find((spell) => spell.id === 'kobold-press-deepm:anchoring-rope')
  const reaction = spells.find((spell) => spell.id === 'kobold-press-deepm:anchoring-rope-reaction')
  if (
    spells.length !== 2 ||
    !action ||
    !reaction ||
    action.name !== 'Anchoring Rope' ||
    reaction.name !== 'Anchoring Rope (Reaction)' ||
    action.source !== 'kobold-press-deepm' ||
    action.mechanics ||
    reaction.mechanics ||
    action.castingTime !== 'action' ||
    reaction.castingTime !== 'reaction (that you take while falling)' ||
    JSON.stringify(action) !==
      JSON.stringify({
        ...reaction,
        id: action.id,
        name: action.name,
        castingTime: action.castingTime
      })
  )
    throw new Error('Anchoring Rope source evidence changed')
  return {
    ...action,
    sourcePage: 37,
    castingTime: '1 action, or 1 reaction that you take while falling'
  }
}

/** Preserve Blood Armor's printed casting prerequisite without presenting it as a material. */
export function correctBloodArmor(spell: Spell): Spell {
  const prerequisite = 'you must have just struck a foe with a melee weapon'
  if (
    spell.id !== 'kobold-press-deepm:blood-armor' ||
    spell.source !== 'kobold-press-deepm' ||
    spell.name !== 'Blood Armor' ||
    spell.mechanics ||
    spell.components.material ||
    !spell.components.verbal ||
    !spell.components.somatic ||
    spell.components.materials !== prerequisite ||
    spell.castingTime !== 'bonus-action'
  )
    throw new Error('Blood Armor source evidence changed')
  const { materials: _materials, ...components } = spell.components
  return {
    ...spell,
    sourcePage: 319,
    components,
    castingTime: `1 bonus action (${prerequisite})`
  }
}
