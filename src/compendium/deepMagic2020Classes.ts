// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Spell } from '../schema/spell.ts'

import {
  DEEP_MAGIC_2020_MISSING_CLASSES,
  DEEP_MAGIC_2020_PALADIN_CORRECTIONS,
  DEEP_MAGIC_2020_WARLOCK_CORRECTIONS,
  DEEP_MAGIC_2020_SORCERER_CORRECTIONS,
  DEEP_MAGIC_2020_CLERIC_CORRECTIONS,
  DEEP_MAGIC_2020_DRUID_CORRECTIONS,
  DEEP_MAGIC_2020_WIZARD_CORRECTIONS
} from './deepMagic2020Corrections.ts'

/** Reconcile one visually checked class membership while preserving all other assignments. */
function reconcileClassMembership(
  spell: Spell,
  className: string,
  corrections: Readonly<Record<string, boolean>>
): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error(`Deep Magic 2020 ${className} review scope changed`)
  if (!Object.hasOwn(corrections, spell.name)) return spell
  const included = corrections[spell.name]
  if (!spell.classes?.length || spell.classes.includes(className) === included)
    throw new Error(`Deep Magic 2020 ${className} evidence changed for ${spell.name}`)
  const classes = included
    ? [...spell.classes, className]
    : spell.classes.filter((name) => name !== className)
  return { ...spell, classes: classes.sort() }
}

/** Reconcile the six reviewed class lists in preparation order, preserving unrelated assignments. */
export function reconcileDeepMagic2020Classes(spell: Spell): Spell {
  let corrected = spell
  for (const [className, corrections] of [
    ['Paladin', DEEP_MAGIC_2020_PALADIN_CORRECTIONS],
    ['Warlock', DEEP_MAGIC_2020_WARLOCK_CORRECTIONS],
    ['Sorcerer', DEEP_MAGIC_2020_SORCERER_CORRECTIONS],
    ['Cleric', DEEP_MAGIC_2020_CLERIC_CORRECTIONS],
    ['Druid', DEEP_MAGIC_2020_DRUID_CORRECTIONS],
    ['Wizard', DEEP_MAGIC_2020_WIZARD_CORRECTIONS]
  ] as const) {
    corrected = reconcileClassMembership(corrected, className, corrections)
  }
  return corrected
}

/** Restore the 75 absent API class lists from visually checked 2020 book entries. */
export function restoreDeepMagic2020Classes(spell: Spell): Spell {
  if (spell.source !== 'kobold-press-deepm' || spell.mechanics)
    throw new Error('Deep Magic 2020 class review scope changed')
  if (!Object.hasOwn(DEEP_MAGIC_2020_MISSING_CLASSES, spell.name)) return spell
  if (spell.classes?.length)
    throw new Error(`Deep Magic 2020 class assumptions changed for ${spell.name}`)
  return {
    ...spell,
    classes: [...DEEP_MAGIC_2020_MISSING_CLASSES[spell.name]]
  }
}
