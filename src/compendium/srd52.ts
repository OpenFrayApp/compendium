// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Map a structured SRD 5.2 stat block (extracted from the official CC-BY PDF by
 * scripts/extract-srd52-pdf.py) into our `Creature` schema. The header is parsed
 * field by field; each section entry's prose is parsed into structured mechanics
 * using the 2024 stat-block grammar (the same format the DDB importer handles).
 *
 * Mechanics live in structured fields; the original prose is kept in `Action.text`.
 */

import type { Action, ActionKind, DamageRoll, Range, Recharge, SaveOutcome, SaveRequirement } from '../schema/action.ts'
import type { Creature, LegendaryActions, SpellGroup, SpellRef, Spellcasting, SpellUsage, Trait } from '../schema/creature.ts'
import type { Ability, AbilityScores, SaveBonuses, Senses, Size, Skill, SkillBonuses, Speeds } from '../schema/primitives.ts'

/** One entry under a section (Trait / Action / …), name + prose. */
export interface Srd52Entry {
  name: string
  text: string
}

/** The structured block emitted by the PDF extractor. */
export interface Srd52Block {
  name: string
  sourcePage: number | null
  /** Header lines, from the size/type/alignment line down to (not incl.) the first section. */
  header: string[]
  /** Section name → entries, e.g. `{ Traits: [...], Actions: [...] }`. */
  sections: Record<string, Srd52Entry[]>
  /** Section name → pre-entry text (e.g. the Legendary Actions "Uses: 3" preamble). */
  preamble: Record<string, string>
}

const SKILL_BY_LABEL: Record<string, Skill> = {
  acrobatics: 'acrobatics', 'animal handling': 'animalHandling', arcana: 'arcana',
  athletics: 'athletics', deception: 'deception', history: 'history', insight: 'insight',
  intimidation: 'intimidation', investigation: 'investigation', medicine: 'medicine',
  nature: 'nature', perception: 'perception', performance: 'performance', persuasion: 'persuasion',
  religion: 'religion', 'sleight of hand': 'sleightOfHand', stealth: 'stealth', survival: 'survival',
}

const SIZES: Size[] = ['Gargantuan', 'Huge', 'Large', 'Medium or Small', 'Medium', 'Small', 'Tiny']

/** Corrections for known typos in WotC's official SRD 5.2.1 PDF, applied explicitly
 *  so the shipped data is correct while staying honest that the source is wrong. */
const ERRATA: Record<string, Partial<Creature>> = {
  // PDF prints "XP 8,000" (CR 12 is 8,400) and "Initiative +7". Every other creature in
  // the set takes its initiative bonus from one of three tiers — Dex mod, +PB, or +2 PB
  // (Dex +2, PB +4 here, so +2, +6, or +10). +7 matches none; the Archmage is not
  // legendary, so the intended tier is the middle one.
  'srd-5.2:archmage': { xp: 8400, initiative: 6 },
  // PDF prints the Young White Dragon's Int save as "2" — a dropped minus on a
  // non-proficient save (it should read −2 = its modifier, i.e. no save; +2 is impossible
  // for mod −2 / PB +3). Keep only its two real proficient saves, Dex and Wis.
  'srd-5.2:young-white-dragon': { saves: { dex: 3, wis: 3 } },
}

/** Straighten typographic apostrophes so names match across sources (Will-o'-Wisp). */
const straighten = (s: string): string => s.replace(/[‘’]/g, "'")
/** Lowercase a name into a hyphenated id ("Adult Black Dragon" → "adult-black-dragon"). */
export const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** Parse a number with commas and spaces stripped ("8,400" → 8400); undefined → 0. */
const num = (s: string | undefined): number => Number((s ?? '').replace(/[,\s]/g, ''))

// ── header fields ───────────────────────────────────────────────────────────

/** Split the "Large Dragon (Chromatic), Chaotic Evil" line into size, type, and alignment. */
function parseSizeTypeAlignment(line: string): { size: Size; type: string; alignment?: string } {
  const [left, ...rest] = line.split(',')
  const alignment = rest.join(',').trim().toLowerCase() || undefined
  const size = SIZES.find((s) => new RegExp(`^${s}\\b`, 'i').test(left.trim())) ?? 'Medium'
  // Keep the subtype, e.g. "dragon (chromatic)", "fiend (demon)" — the SRD lists it.
  const type = left.replace(new RegExp(`^${size}`, 'i'), '').trim().toLowerCase()
  return { size, type, alignment }
}

/** Parse a "Speed 40 ft., Fly 80 ft. (hover)" line into Speeds; an unlabeled number is walk. */
function parseSpeeds(line: string): Speeds {
  const speed: Speeds = {}
  for (const part of line.replace(/^Speed/i, '').split(',')) {
    const value = Number(/(\d+)/.exec(part)?.[1])
    if (!Number.isFinite(value)) continue
    const key = /\b(fly|swim|climb|burrow)\b/i.exec(part)?.[1]?.toLowerCase() as keyof Speeds | undefined
    if (key) {
      ;(speed[key] as number) = value
      if (key === 'fly' && /hover/i.test(part)) speed.hover = true
    } else speed.walk = value
  }
  return speed
}

/** Parse the score/mod/save table; a save that differs from its mod is stored as proficient. */
function parseAbilities(blob: string): { abilities: AbilityScores; saves?: SaveBonuses } {
  const abilities = {} as AbilityScores
  const saves: SaveBonuses = {}
  // The save column occasionally loses its leading "+" in extraction ("Int 6 -2 2"),
  // so tolerate a bare number there; the save=mod+PB invariant catches real errors.
  const re = /\b(Str|Dex|Con|Int|Wis|Cha)\s+(\d+)\s+([+-]\d+)\s+([+-]?\d+)/gi
  for (const m of blob.matchAll(re)) {
    const ab = m[1].toLowerCase() as Ability
    abilities[ab] = Number(m[2])
    const save = Number(m[4])
    if (save !== Number(m[3])) saves[ab] = save // proficient = save ≠ mod
  }
  return { abilities, saves: Object.keys(saves).length ? saves : undefined }
}

/** Strip the label, then read every "Name +N" pair into a lowercased name → bonus map. */
function parseModifierList(line: string, label: RegExp): Record<string, number> {
  const out: Record<string, number> = {}
  for (const m of line.replace(label, '').matchAll(/([A-Za-z][A-Za-z ]+?)\s*([+-]\d+)/g))
    out[m[1].trim().toLowerCase()] = Number(m[2])
  return out
}

/** Parse the Skills line into SkillBonuses, dropping labels that are not known skills. */
function parseSkills(line: string): SkillBonuses | undefined {
  const out: SkillBonuses = {}
  for (const [label, bonus] of Object.entries(parseModifierList(line, /^Skills/i))) {
    const skill = SKILL_BY_LABEL[label]
    if (skill) out[skill] = bonus
  }
  return Object.keys(out).length ? out : undefined
}

/** Split on commas into trimmed, non-empty items. */
const csv = (s: string): string[] => s.split(',').map((x) => x.trim()).filter(Boolean)

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

/** The labels that open a stat-block header line — anything else is a continuation. */
const HEADER_LABEL =
  /^(AC |HP |Speed|Str |Dex |Con |Int |Wis |Cha |MOD|Skills|Resistances|Immunities|Vulnerabilities|Gear|Senses|Languages|CR )/i
/** Find a labeled header field and join its wrapped continuation lines into one string. */
function fieldText(header: string[], label: RegExp): string | undefined {
  const i = header.findIndex((l) => label.test(l))
  if (i < 0) return undefined
  let text = header[i]
  for (let j = i + 1; j < header.length && !HEADER_LABEL.test(header[j]); j++) text += ' ' + header[j].trim()
  return text
}

/** Parse the Senses blob into feet ("1 mile" → 5280); passive Perception defaults to 10. */
function parseSenses(blob: string): Senses {
  const senses: Senses = { passivePerception: 10 }
  const pp = /Passive Perception\s+(\d+)/i.exec(blob)
  if (pp) senses.passivePerception = Number(pp[1])
  // Senses are stored in feet, but a long range can be printed in miles ("Tremorsense 1 mile").
  for (const m of blob.matchAll(/(darkvision|blindsight|tremorsense|truesight)\s+(\d+)\s*(miles?)?/gi))
    senses[m[1].toLowerCase() as 'darkvision'] = Number(m[2]) * (m[3] ? 5280 : 1)
  return senses
}

/** Parse "CR 1/2 (XP 100)" (either XP order, optional lair XP) into cr, xp, and xpLair. */
function parseCr(blob: string): { cr?: number; xp?: number; xpLair?: number } {
  const N = String.raw`\d{1,3}(?:,\d{3})+|\d+` // comma-grouped number, no trailing comma
  // The SRD PDF is inconsistent about the base XP: 326 blocks print "(XP 450)", but four
  // (e.g. White Dragon Wyrmling) print "(450 XP)". Accept either order — a strict "XP N"
  // match drops CR *and* XP for those four. Lair XP is always the "or N in lair" form.
  const m = new RegExp(
    `CR\\s+([\\d/]+)\\s*\\(\\s*(?:XP\\s+(${N})|(${N})\\s+XP)(?:,\\s*or\\s+(${N})\\s+in\\s+lair)?`,
    'i',
  ).exec(blob)
  if (!m) return {}
  const cr = m[1].includes('/') ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1])
  return { cr, xp: num(m[2] ?? m[3]), xpLair: m[4] ? num(m[4]) : undefined }
}

// ── action prose → mechanics ──────────────────────────────────────────────────

// The dice are parenthesized only when there are dice: the weakest attacks print a flat
// "Hit: 1 Piercing damage" (Bat, Cat, Awakened Shrub, …), which is still a damage roll.
const DAMAGE_RE = /(\d+)\s*(?:\(([0-9dD]+(?:\s*[+-]\s*\d+)?)\))?\s*([A-Za-z]+)\s+damage/g
/** Strip all whitespace ("2d8 + 5" → "2d8+5"). */
const normalize = (s: string): string => s.replace(/\s+/g, '')

/** Collect every "N (dice) Type damage" roll; a flat "1 Piercing damage" keeps the 1. */
function parseDamage(text: string): DamageRoll[] | undefined {
  const out: DamageRoll[] = []
  for (const m of text.matchAll(DAMAGE_RE))
    out.push({ formula: normalize(m[2] ?? m[1]), type: m[3].toLowerCase() as DamageRoll['type'] })
  return out.length ? out : undefined
}

/** Parse a 2024 "Melee/Ranged Attack Roll: +N" clause into kind, toHit, reach, and range. */
function parseAttack(text: string): { kind: ActionKind; toHit: number; reach?: number; range?: Range } | null {
  const m = /(Melee or Ranged|Melee|Ranged)\s+Attack\s+Roll:\s*([+-]?\d+)/i.exec(text)
  if (!m) return null
  const reachM = /reach\s+(\d+)\s*ft/i.exec(text)
  const rangeM = /range\s+(\d+)\s*\/\s*(\d+)\s*ft/i.exec(text) ?? /range\s+(\d+)\s*ft/i.exec(text)
  const reach = reachM ? Number(reachM[1]) : undefined
  let range: Range | undefined
  if (rangeM) {
    range = { normal: Number(rangeM[1]) }
    if (rangeM[2]) range.long = Number(rangeM[2])
  }
  return { kind: range && !reach ? 'ranged' : 'melee', toHit: Number(m[2]), reach, range }
}

/** Parse a 2024 "X Saving Throw: DC N" clause; on-save is half, none (damage), or negates. */
function parseSave(text: string): SaveRequirement | null {
  const m = /([A-Za-z]+)\s+Saving\s+Throw:\s*DC\s+(\d+)/i.exec(text)
  const ability = m && (m[1].slice(0, 3).toLowerCase() as Ability)
  if (!m || !['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability as string)) return null
  const onSave: SaveOutcome = /success:\s*half|half as much/i.test(text) ? 'half' : parseDamage(text) ? 'none' : 'negates'
  return { ability: ability as Ability, dc: Number(m[2]), onSave }
}

/** Split "(Recharge 5–6)" or "(N/Day)" off the name into a Recharge plus the cleaned name. */
function parseRecharge(name: string): { recharge?: Recharge; clean: string } {
  const dice = /\(Recharge\s+(\d)(?:[–-]\d)?\)/i.exec(name)
  if (dice) return { recharge: { type: 'dice', value: Number(dice[1]) }, clean: name.replace(dice[0], '').trim() }
  const perDay = /\((\d+)\s*\/\s*Day\)/i.exec(name)
  if (perDay) return { recharge: { type: 'perDay', value: Number(perDay[1]) }, clean: name.replace(perDay[0], '').trim() }
  return { clean: name.trim() }
}

const LEG_COST_RE = /\(Costs?\s+(\d+)\s+Actions?\)\.?/i

/** Turn a block entry into an Action: strip cost/recharge, then class it from its prose. */
function toAction(entry: Srd52Entry): Action {
  const costM = LEG_COST_RE.exec(entry.name)
  const rawName = entry.name.replace(LEG_COST_RE, '').trim()
  const { recharge, clean } = parseRecharge(rawName)
  const text = `${entry.name}. ${entry.text}`.trim()
  const action: Action = { id: slug(clean), name: clean, kind: 'utility', toHit: null }
  if (recharge) action.recharge = recharge
  if (costM) action.legendaryCost = Number(costM[1])
  if (entry.text) action.text = entry.text.trim()

  const attack = parseAttack(text)
  if (attack) {
    action.kind = attack.kind
    action.toHit = attack.toHit
    if (attack.reach != null) action.reach = attack.reach
    if (attack.range) action.range = attack.range
    const dmg = parseDamage(text)
    if (dmg) action.damage = dmg
    return action
  }
  const save = parseSave(text)
  if (save) {
    action.kind = 'save'
    action.save = save
    const dmg = parseDamage(text)
    if (dmg) action.damage = dmg
    return action
  }
  const dmg = parseDamage(text)
  if (dmg) action.damage = dmg
  return action
}

// ── spellcasting (innate, 2024 "At Will / N/Day" form) ────────────────────────

const TIER_MARKER = /(At Will|\d+\s*\/\s*Day)(?:\s+Each)?\s*:/gi

/** SpellRef for a listed spell name, dropping "(…)" tags; 5.1 refs also drop apostrophes. */
function spellRef(raw: string, spellSource: string): SpellRef {
  const name = raw.replace(/\([^)]*\)/g, '').trim() // drop "(level 2 version)"
  // SRD 5.1 (dnd5eapi) ids strip apostrophes ("hunters-mark"); our 5.2 ids keep our slug.
  const refName = spellSource === 'srd-5.1' ? name.replace(/['’]/g, '') : name
  return { name, ref: `${spellSource}:${slug(refName)}` }
}

// `spellSource` is the library the cast spells resolve against — `srd-5.2` for 2024
// content, `srd-5.1` for the 2014 books (ToB 2/3), whose creatures cast 2014 spells.
export function parseSpellcasting(entry: Srd52Entry, spellSource = 'srd-5.2'): Spellcasting | null {
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

// ── assembly ──────────────────────────────────────────────────────────────────

/** Map a section's entries to Actions; a missing section yields an empty list. */
const namedActions = (entries: Srd52Entry[] | undefined): Action[] => (entries ?? []).map(toAction)

/** Build LegendaryActions; uses per round (and in-lair uses) come from the "Uses:" preamble. */
function buildLegendary(entries: Srd52Entry[] | undefined, preamble: string): LegendaryActions | undefined {
  const actions = namedActions(entries)
  if (!actions.length) return undefined
  const perRound = Number(/Legendary Action Uses:\s*(\d+)/i.exec(preamble)?.[1]) || 3
  const perRoundLair = Number(/Legendary Action Uses:\s*\d+\s*\((\d+)\s+in\s+Lair/i.exec(preamble)?.[1]) || undefined
  return perRoundLair ? { perRound, perRoundLair, actions } : { perRound, actions }
}

/** Map an extracted 5.2 block into a Creature: header fields, sections, spell links, errata. */
export function mapSrd52(
  block: Srd52Block,
  opts: { linkSpells?: (text: string) => string; source?: string } = {},
): Creature {
  const header = block.header
  const blob = header.join('\n')

  const { size, type, alignment } = parseSizeTypeAlignment(header[0] ?? '')
  const ac = num(/AC\s+(\d+)/i.exec(blob)?.[1])
  const init = /Initiative\s+([+-]\d+)/i.exec(blob)
  const hp = /HP\s+(\d+)\s*\(([^)]+)\)/i.exec(blob)
  const { abilities, saves } = parseAbilities(blob)
  const { cr, xp, xpLair } = parseCr(blob)

  // The 2024 stat-block grammar isn't SRD-specific, so first-party books in the same
  // format reuse this mapper with their own library id.
  const source = opts.source ?? 'srd-5.2'
  const creature: Creature = {
    id: `${source}:${slug(block.name)}`,
    source,
    edition: '5.5',
    name: straighten(block.name),
    size,
    type,
    ac,
    maxHp: hp ? Number(hp[1]) : 0,
    speed: parseSpeeds(header.find((l) => /^Speed/i.test(l)) ?? ''),
    abilities,
    senses: parseSenses(blob),
  }
  if (block.sourcePage != null) creature.sourcePage = block.sourcePage
  if (alignment) creature.alignment = alignment
  if (hp) creature.hpFormula = normalize(hp[2])
  if (init) creature.initiative = Number(init[1])
  if (saves) creature.saves = saves
  const skills = parseSkills(fieldText(header, /^Skills/i) ?? '')
  if (skills) creature.skills = skills

  const res = fieldText(header, /^Resistances/i)
  if (res) creature.resistances = csv(res.replace(/^Resistances/i, ''))
  const imm = fieldText(header, /^Immunities/i)
  if (imm) {
    const [dmg, cond] = imm.replace(/^Immunities/i, '').split(';')
    creature.immunities = csv(dmg)
    if (cond) creature.conditionImmunities = csv(cond)
  }
  const vuln = fieldText(header, /^Vulnerabilities/i)
  if (vuln) creature.vulnerabilities = csv(vuln.replace(/^Vulnerabilities/i, ''))
  const gear = fieldText(header, /^Gear/i)
  if (gear) creature.gear = csv(gear.replace(/^Gear/i, ''))
  const lang = fieldText(header, /^Languages/i)
  if (lang) {
    const langs = lang.replace(/^Languages/i, '').split(/[,;]/).map((x) => x.trim()).filter((x) => x && x !== '—' && !/^None$/i.test(x))
    if (langs.length) creature.languages = langs
  }
  if (cr != null) creature.cr = cr
  if (xp != null) creature.xp = xp
  if (xpLair != null) creature.xpLair = xpLair

  // Sections.
  const traitEntries = block.sections['Traits'] ?? []
  const traits: Trait[] = traitEntries.map((t) => ({ name: t.name, text: t.text }))
  if (traits.length) creature.traits = traits

  // Legendary Resistance (with optional in-lair count) rides a trait.
  const lr = traitEntries.find((t) => /^Legendary Resistance/i.test(t.name))
  if (lr) {
    const base = Number(/\((\d+)\s*\/\s*day/i.exec(lr.name)?.[1])
    if (Number.isFinite(base)) creature.legendaryResistance = base
    const lair = Number(/(\d+)\s*\/\s*day\s+in\s+lair/i.exec(lr.name)?.[1])
    if (Number.isFinite(lair)) creature.legendaryResistanceLair = lair
  }

  // Spellcasting is an Action entry; lift it out into the structured block.
  const actionEntries = (block.sections['Actions'] ?? []).filter((e) => {
    if (!/^Spellcasting$/i.test(e.name)) return true
    const sc = parseSpellcasting(e)
    if (sc) creature.spellcasting = sc
    return false
  })
  const actions = namedActions(actionEntries)
  if (actions.length) creature.actions = actions
  const bonus = namedActions(block.sections['Bonus Actions'])
  if (bonus.length) creature.bonusActions = bonus
  const reactions = namedActions(block.sections['Reactions'])
  if (reactions.length) creature.reactions = reactions
  const legendary = buildLegendary(block.sections['Legendary Actions'], block.preamble?.['Legendary Actions'] ?? '')
  if (legendary) creature.legendaryActions = legendary

  // Wrap cast spell names in the prose as [Name](spell:ref) so the UI can hover-preview
  // them in action and trait text.
  if (opts.linkSpells) {
    const link = opts.linkSpells
    /** Copy an action with its prose spell-linked; actions without text pass through. */
    const relink = (a: Action): Action => (a.text ? { ...a, text: link(a.text) } : a)
    if (creature.actions) creature.actions = creature.actions.map(relink)
    if (creature.bonusActions) creature.bonusActions = creature.bonusActions.map(relink)
    if (creature.reactions) creature.reactions = creature.reactions.map(relink)
    if (creature.legendaryActions)
      creature.legendaryActions = { ...creature.legendaryActions, actions: creature.legendaryActions.actions.map(relink) }
    if (creature.traits) creature.traits = creature.traits.map((t) => ({ ...t, text: link(t.text) }))
  }

  return Object.assign(creature, ERRATA[creature.id])
}
