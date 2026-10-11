// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Ability } from '../schema/primitives.ts'
import type { SpellGroup, SpellRef, Spellcasting, SpellUsage } from '../schema/creature.ts'
import { slug } from './identity.ts'

/**
 * Split on top-level commas only, ignoring commas inside parentheses — so a spell
 * list keeps an entry whose clarification has commas intact, e.g. "Shapechange
 * (Beast or Humanoid form only, no Temporary Hit Points…)" stays one entry.
 */
function splitTopLevel(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((x) => x.trim()).filter(Boolean)
}

const TIER_MARKER = /(At Will|\d+\s*\/\s*Day)(?:\s+Each)?\s*:/gi

/** SpellRef for a listed spell name, dropping "(…)" tags; 5.1 refs also drop apostrophes. */
function spellRef(raw: string, spellSource: string): SpellRef {
  const name = raw.replace(/\([^)]*\)/g, '').trim() // drop "(level 2 version)"
  // SRD 5.1 (dnd5eapi) ids strip apostrophes ("hunters-mark"); our 5.2 ids keep our slug.
  const refName = spellSource === 'srd-5.1' ? name.replace(/['’]/g, '') : name
  return { name, ref: `${spellSource}:${slug(refName)}` }
}

/** Parse action-style innate casting with edition-specific spell references. */
export function parseSpellcasting(entry: { name: string; text: string }, spellSource = 'srd-5.2'): Spellcasting | null {
  const blob = `${entry.name}. ${entry.text}`
  const ability = /using (\w+) as the spellcasting ability/i.exec(blob)?.[1]?.slice(0, 3).toLowerCase() as Ability | undefined
  const saveDc = Number(/spell save DC (\d+)/i.exec(blob)?.[1]) || undefined
  const toHit = Number(/([+-]?\d+) to hit with spell/i.exec(blob)?.[1]) || undefined

  const groups: SpellGroup[] = []
  const markers = [...blob.matchAll(TIER_MARKER)]
  for (let i = 0; i < markers.length; i++) {
    const header = markers[i][1].toLowerCase()
    const start = markers[i].index! + markers[i][0].length
    const end = i + 1 < markers.length ? markers[i + 1].index! : blob.length
    const spells = splitTopLevel(blob.slice(start, end)).map((s) => spellRef(s, spellSource))
    if (!spells.length) continue
    const usage: SpellUsage = /at will/.test(header)
      ? { type: 'atWill' }
      : { type: 'perDay', per: Number(/(\d+)/.exec(header)?.[1]) || 1 }
    groups.push({ usage, spells })
  }
  if (!groups.length && !ability) return null
  const sc: Spellcasting = { groups }
  if (ability) sc.ability = ability
  if (saveDc != null) sc.saveDc = saveDc
  if (toHit != null) sc.toHit = toHit
  return sc
}
