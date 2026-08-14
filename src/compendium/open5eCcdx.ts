// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Creature Codex (Kobold Press) via the Open5e v2 API, used under the OGL 1.0a.
 *
 * Unlike the Tomes, this book has no PDF pipeline: no text-layer copy of the 2018
 * edition was available, and the 2024 revision is closed content. Open5e republishes
 * the book's Open Game Content with the publisher and license declared, which is the
 * one license-clean route to it.
 *
 * The mapping is an adapter, not a second parser. Open5e hands back structured fields;
 * this file renders them into the 2014 stat-block lines `mapTob3` already reads, then
 * hands the block over. Every parser the three Tomes use — speeds, senses, skills,
 * attacks, saves, recharge, slot and innate spellcasting — is therefore the same code,
 * and a fix to one book fixes all four.
 */

import type { Creature } from '../schema/creature.ts'
import { mapTob3, type Tob3Block } from './tob3.ts'

/**
 * Named individuals the book reserves as Product Identity, excluded wholesale.
 *
 * Open5e's set already omits most of them — Baba Yaga, the Demon Lords, the Arch-Devils,
 * the Animal Lords — but it kept these three, and its judgment here is not something to
 * inherit unchecked (its ToB 3 set is known to have erred in both directions). Each is a
 * singular being rather than a kind of creature, which is the line ToB 1 drew when it
 * excluded the Bear King, the Avatar of Boreas, and the Emperor of the Ghouls while
 * keeping their generic minions. Maintainer-confirmed, as the earlier two lists were.
 */
export const RESERVED_INDIVIDUALS = ['Monkey King', 'Avatar of Shoth', 'Ankou Soul Herald']

/** Whether a name is one of the reserved individuals — exact, so "Ankou Soul Seeker" stays. */
export function isReservedIndividual(name: string): boolean {
  const n = name.trim().toLowerCase()
  return RESERVED_INDIVIDUALS.some((r) => r.toLowerCase() === n)
}

/** The Open5e v2 fields we read. Everything else on the record is ignored. */
export interface Open5eCreature {
  key: string
  name: string
  size?: { name?: string }
  type?: { name?: string }
  alignment?: string
  armor_class?: number
  hit_points?: number
  hit_dice?: string
  challenge_rating?: number
  experience_points?: number
  passive_perception?: number
  darkvision_range?: number | null
  blindsight_range?: number | null
  tremorsense_range?: number | null
  truesight_range?: number | null
  languages?: { as_string?: string }
  ability_scores?: Record<string, number>
  speed?: Record<string, number | string>
  saving_throws?: Record<string, number>
  skill_bonuses?: Record<string, number>
  resistances_and_immunities?: Record<string, unknown>
  traits?: { name?: string; desc?: string }[]
  actions?: { name?: string; desc?: string; action_type?: string; order_in_statblock?: number }[]
}

const ABILITY_ORDER = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
const SHORT: Record<string, string> = {
  strength: 'Str',
  dexterity: 'Dex',
  constitution: 'Con',
  intelligence: 'Int',
  wisdom: 'Wis',
  charisma: 'Cha',
}

/**
 * Flatten Open5e's markdown into one inline run.
 *
 * The prose parsers were written against PDF text, where a stat block's spellcasting is
 * a single unbroken run. Open5e returns the same sentences as markdown — bold markers,
 * bullets, and real line breaks — and the level-by-level slot patterns span from one
 * heading to the next, so a newline inside them ends the match early and a slot caster
 * parses as nothing. Stripping the markup restores the shape the parsers expect.
 */
export function flattenMarkdown(text: string): string {
  return text
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Render a speed map as the stat line, e.g. `"30 ft., fly 60 ft."`. */
function speedLine(speed: Record<string, number | string> = {}): string {
  const walk = typeof speed.walk === 'number' ? `${speed.walk} ft.` : ''
  const rest = Object.entries(speed)
    .filter(([k, v]) => k !== 'walk' && k !== 'unit' && typeof v === 'number')
    .map(([k, v]) => `${k} ${v} ft.`)
  return [walk, ...rest].filter(Boolean).join(', ')
}

/** Render the senses stat line; passive Perception always closes it, as in print. */
function sensesLine(r: Open5eCreature): string {
  const parts: string[] = []
  const add = (label: string, range?: number | null) => {
    if (range) parts.push(`${label} ${range} ft.`)
  }
  add('darkvision', r.darkvision_range)
  add('blindsight', r.blindsight_range)
  add('tremorsense', r.tremorsense_range)
  add('truesight', r.truesight_range)
  if (r.passive_perception != null) parts.push(`passive Perception ${r.passive_perception}`)
  return parts.join(', ')
}

/** Format a challenge rating the way the stat line prints it (`1/4`, not `0.25`). */
function crText(cr?: number): string {
  if (cr == null) return ''
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return String(cr)
}

/** A `Label +N, Label +N` list from a bonus map, dropping zero-length maps. */
function bonusList(map: Record<string, number> = {}, label: (k: string) => string): string {
  return Object.entries(map)
    .map(([k, v]) => `${label(k)} ${v >= 0 ? '+' : ''}${v}`)
    .join(', ')
}

/** Title-case a skill key for the stat line (`animal_handling` → `Animal Handling`). */
const skillLabel = (k: string): string =>
  k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Render the 2014 header lines `parseHeader` reads. Armor detail is deliberately not
 * included: Open5e's `armor_detail` reports "natural armor" for every creature, so it
 * carries no information (the same field the SRD pipeline dropped for the same reason).
 */
function header(r: Open5eCreature): string[] {
  const ri = (r.resistances_and_immunities ?? {}) as Record<string, string>
  const scores = r.ability_scores ?? {}
  const lines = [
    `${r.size?.name ?? 'Medium'} ${(r.type?.name ?? 'creature').toLowerCase()}, ${r.alignment || 'unaligned'}`,
    `Armor Class ${r.armor_class ?? 10}`,
    `Hit Points ${r.hit_points ?? 1}${r.hit_dice ? ` (${r.hit_dice})` : ''}`,
    `Speed ${speedLine(r.speed)}`,
    'STR DEX CON INT WIS CHA',
    // parseHeader reads the six values left to right in canonical order and derives the
    // modifier itself, so the printed modifier here only has to be well-formed.
    ABILITY_ORDER.map((k) => {
      const v = scores[k] ?? 10
      const mod = Math.floor((v - 10) / 2)
      return `${v} (${mod >= 0 ? '+' : ''}${mod})`
    }).join(' '),
  ]
  const saves = bonusList(r.saving_throws, (k) => SHORT[k] ?? k)
  if (saves) lines.push(`Saving Throws ${saves}`)
  const skills = bonusList(r.skill_bonuses, skillLabel)
  if (skills) lines.push(`Skills ${skills}`)
  if (ri.damage_vulnerabilities_display) {
    lines.push(`Damage Vulnerabilities ${ri.damage_vulnerabilities_display}`)
  }
  if (ri.damage_resistances_display) {
    lines.push(`Damage Resistances ${ri.damage_resistances_display}`)
  }
  if (ri.damage_immunities_display) lines.push(`Damage Immunities ${ri.damage_immunities_display}`)
  if (ri.condition_immunities_display) {
    lines.push(`Condition Immunities ${ri.condition_immunities_display}`)
  }
  const senses = sensesLine(r)
  if (senses) lines.push(`Senses ${senses}`)
  if (r.languages?.as_string) lines.push(`Languages ${r.languages.as_string}`)
  const xp = r.experience_points != null ? ` (${r.experience_points.toLocaleString('en-US')} XP)` : ''
  lines.push(`Challenge ${crText(r.challenge_rating)}${xp}`)
  return lines
}

/** The stat-block section an Open5e action belongs to, keyed as the ToB blocks key them. */
const SECTION: Record<string, string> = {
  ACTION: 'Actions',
  BONUS_ACTION: 'Bonus Actions',
  REACTION: 'Reactions',
  LEGENDARY_ACTION: 'Legendary Actions',
  LAIR_ACTION: 'Lair Actions',
  MYTHIC_ACTION: 'Mythic Actions',
}

/** One entry, with its prose flattened out of markdown. */
const entry = (e: { name?: string; desc?: string }) => ({
  name: (e.name ?? '').trim(),
  text: flattenMarkdown(e.desc ?? ''),
})

/** Assemble the block `mapTob3` consumes from one Open5e record. */
export function toBlock(r: Open5eCreature): Tob3Block {
  const sections: Record<string, { name: string; text: string }[]> = {}
  // Open5e's own stat-block ordering, so Multiattack leads its section as it does in print.
  const actions = [...(r.actions ?? [])].sort(
    (a, b) => (a.order_in_statblock ?? 0) - (b.order_in_statblock ?? 0),
  )
  for (const a of actions) {
    const key = SECTION[a.action_type ?? 'ACTION'] ?? 'Actions'
    ;(sections[key] ??= []).push(entry(a))
  }
  return {
    name: r.name,
    // Open5e carries no page numbers, and a zero would print as "pg. 0".
    sourcePage: null,
    header: header(r),
    traits: (r.traits ?? []).map(entry),
    sections,
  } as Tob3Block
}

/** Map one Open5e Creature Codex record into our schema, through the shared 2014 mapper. */
export function mapOpen5eCcdx(r: Open5eCreature, source = 'kobold-press-ccdx'): Creature {
  return mapTob3(toBlock(r), source)
}
