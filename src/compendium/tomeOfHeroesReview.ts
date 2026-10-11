// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from 'node:crypto'
import type { Spell } from '../schema/spell.ts'
import { tomeOfHeroesClasses } from './tomeOfHeroesClasses.ts'
import {
  TOME_OF_HEROES_SOURCE_PAGES,
  TOME_OF_HEROES_MATERIALS,
  HEADER_CORRECTIONS,
  ERRATA
} from './tomeOfHeroesCorrections.ts'
export { TOME_OF_HEROES_SOURCE_PAGES, TOME_OF_HEROES_MATERIALS } from './tomeOfHeroesCorrections.ts'

export const TOME_OF_HEROES_PDF_SHA256 =
  'de2d8b5bbe6f92cb2ee31df68192c042883bfe965aa52ab6d91be374d882c38c'
export const TOME_OF_HEROES_CANDIDATE_SHA256 =
  '275e34dc40b6543539d1f28da6bec116fbf0aaca5967d9e5ed2ddaa027a4b08a'
/** Apply book-specific header evidence and publisher errata without adding automation. */
export function reviewTomeOfHeroesSpell(spell: Spell): Spell | undefined {
  const sourcePage = TOME_OF_HEROES_SOURCE_PAGES[spell.name]
  if (spell.source !== 'kobold-press-toh' || !sourcePage || spell.mechanics) {
    throw new Error('Unreviewed Tome of Heroes spell scope')
  }
  if (spell.name === 'Deadly Salvo') return undefined
  const classes = tomeOfHeroesClasses(spell.name)
  if (!classes.length) throw new Error(`Missing publisher class list for ${spell.name}`)
  const materials = TOME_OF_HEROES_MATERIALS[spell.name]
  if (materials && !spell.components.material) {
    throw new Error(`Material flag changed for ${spell.name}`)
  }
  let text = spell.text
  const errata = ERRATA[spell.name]
  if (errata) {
    if (text.split(errata.before).length !== 2) {
      throw new Error(`Publisher errata anchor changed for ${spell.name}`)
    }
    text = text.replace(errata.before, errata.after)
  }
  const { edition: _edition, ...reference } = spell
  return {
    ...reference,
    ...HEADER_CORRECTIONS[spell.name],
    sourcePage,
    components: { ...spell.components, ...(materials && { materials }) },
    classes,
    text
  }
}

/** Reject changed API candidates before applying the reviewed source-specific corrections. */
export function prepareTomeOfHeroesSpells(content: string): Spell[] {
  if (createHash('sha256').update(content).digest('hex') !== TOME_OF_HEROES_CANDIDATE_SHA256) {
    throw new Error('Tome of Heroes input snapshot changed; renew its source review')
  }
  const candidates: Spell[] = JSON.parse(content)
  if (candidates.length !== 91 || new Set(candidates.map((spell) => spell.id)).size !== 91) {
    throw new Error('Tome of Heroes candidate scope changed')
  }
  return candidates.flatMap((spell) => {
    const reviewed = reviewTomeOfHeroesSpell(spell)
    return reviewed ? [reviewed] : []
  })
}
