// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

// Map Tome of Beasts 3 blocks (from scripts/tob3.py) into the Creature schema.
// ToB 3 uses the 2014 stat-block format — "Melee Weapon Attack: +9 to hit, reach 5
// ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage", a STR/DEX table, "Challenge
// X (Y XP)" — so the prose parsers here differ from srd52.ts (2024). Open Game Content
// only; the PI flavor and the Lord/Archangel entries are already dropped upstream.

import type { Ability, AbilityScores, DamageType, SaveBonuses, Senses, Size, SkillBonuses, Speeds } from '../schema/primitives.ts'
import type { Action, ActionKind, DamageRoll, Range, Recharge, SaveOutcome, SaveRequirement } from '../schema/action.ts'
import type { Creature, LegendaryActions, SpellGroup, SpellLevel, SpellRef, SpellSlots, Spellcasting, SpellUsage, Trait } from '../schema/creature.ts'
import { parseSpellcasting, slug } from './srd52.ts'

export interface Tob3Block {
  name: string
  sourcePage: number | null
  header: string[]
  traits: { name: string; text: string }[]
  sections: Record<string, { name: string; text: string }[]>
}

/** Parse a number ignoring thousands commas ("15,000" → 15000). */
const num = (s: string): number => Number(s.replace(/,/g, ''))
/**
 * Tidy stat-block prose: drop tab artifacts, turn the PDF's "•" into list items, and
 * strip the leading "." that the extractor leaves when it splits a 2014 entry's name
 * off its text ("Frightful Presence" + ". Each creature…" → no double dot in the app).
 */
const prose = (s: string): string =>
  s.replace(/\t/g, ' ').replace(/\s*•\s*/g, '\n- ').replace(/ {2,}/g, ' ').trim().replace(/^\.\s*/, '')
/** Strip whitespace from a dice formula and normalize en/em dashes to "-". */
const normDice = (s: string): string => s.replace(/\s+/g, "").replace(/[–—]/g, "-")
const ABBR: Record<string, Ability> = { str: "str", dex: "dex", con: "con", int: "int", wis: "wis", cha: "cha" }

const DAMAGE = /\d+\s*\(([0-9dD]+(?:\s*[+-]\s*\d+)?)\)\s*([A-Za-z]+)\s+damage/g
/** Collect every "N (dice) type damage" roll in 2014 attack prose. */
function parseDamage(text: string): DamageRoll[] | undefined {
  const out: DamageRoll[] = []
  for (const m of text.matchAll(DAMAGE)) out.push({ formula: normDice(m[1]), type: m[2].toLowerCase() as DamageType })
  return out.length ? out : undefined
}

const ATTACK = /(Melee or Ranged|Melee|Ranged)\s+(?:Weapon|Spell)\s+Attack:\s*\+(\d+)\s*to hit/i
/** Parse a 2014 "Melee Weapon Attack: +9 to hit" clause into kind, toHit, reach, and range. */
function parseAttack(text: string): { kind: ActionKind; toHit: number; reach?: number; range?: Range } | null {
  const m = ATTACK.exec(text)
  if (!m) return null
  const reach = /reach\s+(\d+)\s*ft/i.exec(text)
  const rng = /range\s+(\d+)\/(\d+)\s*ft/i.exec(text) ?? /range\s+(\d+)\s*ft/i.exec(text)
  let range: Range | undefined
  if (rng) range = rng[2] ? { normal: Number(rng[1]), long: Number(rng[2]) } : { normal: Number(rng[1]) }
  return { kind: range && !reach ? "ranged" : "melee", toHit: Number(m[2]), reach: reach ? Number(reach[1]) : undefined, range }
}

const SAVE = /DC\s+(\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+saving throw/i
/** Parse a 2014 save rider ("DC 13 Dexterity saving throw") into ability, DC, and outcome. */
function parseSave(text: string): SaveRequirement | null {
  const m = SAVE.exec(text)
  if (!m) return null
  const onSave: SaveOutcome = /half as much|half the|halved/i.test(text) ? "half" : parseDamage(text) ? "none" : "negates"
  return { ability: ABBR[m[2].slice(0, 3).toLowerCase()], dc: Number(m[1]), onSave }
}

const RECHARGE_DICE = /\(Recharge\s+(\d)(?:\s*[–-]\s*\d)?\)/i
const RECHARGE_DAY = /\((\d+)\s*\/\s*Day\)/i
/** Split "(Recharge 5–6)" or "(N/Day)" off a name into a Recharge and the cleaned name. */
function parseRecharge(name: string): { recharge?: Recharge; clean: string } {
  const d = RECHARGE_DICE.exec(name)
  if (d) return { recharge: { type: "dice", value: Number(d[1]) }, clean: name.replace(d[0], "").trim() }
  const p = RECHARGE_DAY.exec(name)
  if (p) return { recharge: { type: "perDay", value: Number(p[1]) }, clean: name.replace(p[0], "").trim() }
  return { clean: name.trim() }
}

const COST = /\(Costs?\s+(\d+)\s+Actions?\)/i
/** Turn a 2014 entry into an Action, classed attack, save, or utility from its prose. */
function toAction(entry: { name: string; text: string }): Action {
  const costM = COST.exec(entry.name)
  const { recharge, clean } = parseRecharge(entry.name.replace(COST, "").trim())
  const text = `${entry.name}. ${entry.text}`
  const action: Action = { id: slug(clean), name: clean, kind: "utility", toHit: null, text: prose(entry.text) }
  if (recharge) action.recharge = recharge
  if (costM) action.legendaryCost = Number(costM[1])
  const atk = parseAttack(text)
  if (atk) {
    action.kind = atk.kind
    action.toHit = atk.toHit
    if (atk.reach != null) action.reach = atk.reach
    if (atk.range) action.range = atk.range
  } else {
    const save = parseSave(text)
    if (save) { action.kind = "save"; action.save = save }
  }
  const dmg = parseDamage(text)
  if (dmg) action.damage = dmg
  return action
}

/**
 * A "choose one of the following" action whose `•` options are themselves real
 * attacks/saves (a dragon's Breath Weapon → Light Beam / Rainbow Blast; the Ahu-Nixta
 * Mechanon's Utility Arm → Grabbing Claw / Sonic Disruptor / …). Split it into a
 * framing parent (the intro line) plus one clickable sub-action per option.
 *
 * Any **recharge/cost goes on the rollable sub-actions, not the framing parent** — the
 * parent isn't usable, so a recharge there would never be spent or auto-rolled. A
 * save-with-recharge sub-action is the same shape as a normal single breath weapon, which
 * the app already tracks. Bails to a single action if the options don't split cleanly.
 */
function expandAction(entry: { name: string; text: string }): Action[] {
  if (!/one of the following/i.test(entry.text) || !entry.text.includes('•')) return [toAction(entry)]
  const firstBullet = entry.text.indexOf('•')
  const chunks = entry.text
    .slice(firstBullet)
    .split('•')
    .map((c) => c.replace(/\t/g, ' ').trim())
    .filter(Boolean)
  const costM = COST.exec(entry.name)
  const { recharge, clean: parentName } = parseRecharge(entry.name.replace(COST, '').trim())
  const subs: Action[] = []
  for (const chunk of chunks) {
    const m = /^([^.]{2,40})\.\s+([\s\S]+)$/.exec(chunk)
    if (!m) return [toAction(entry)] // an option didn't split into "Name. prose" — keep the whole action
    const sub = toAction({ name: m[1].trim(), text: m[2].trim() })
    sub.id = slug(`${parentName}-${m[1].trim()}`)
    if (recharge) sub.recharge = recharge
    if (costM) sub.legendaryCost = Number(costM[1])
    subs.push(sub)
  }
  if (subs.length < 2) return [toAction(entry)]
  // Framing parent: the cleaned name (recharge/cost stripped — those drive the options) + intro text.
  return [toAction({ name: parentName, text: entry.text.slice(0, firstBullet) }), ...subs]
}

const SKILL_KEY: Record<string, keyof SkillBonuses> = {
  acrobatics: "acrobatics", "animal handling": "animalHandling", arcana: "arcana", athletics: "athletics",
  deception: "deception", history: "history", insight: "insight", intimidation: "intimidation",
  investigation: "investigation", medicine: "medicine", nature: "nature", perception: "perception",
  performance: "performance", persuasion: "persuasion", religion: "religion", "sleight of hand": "sleightOfHand",
  stealth: "stealth", survival: "survival",
}

/** Parse a 2014 speed string ("30 ft., fly 60 ft. (hover)") into Speeds. */
function parseSpeed(s: string): Speeds {
  const sp: Speeds = {}
  const walk = /^(\d+)\s*ft/.exec(s)
  if (walk) sp.walk = Number(walk[1])
  for (const k of ["fly", "swim", "climb", "burrow"] as const) {
    const m = new RegExp(`${k}\\s+(\\d+)\\s*ft`, "i").exec(s)
    if (m) sp[k] = Number(m[1])
  }
  if (/fly[^.,]*\(hover\)/i.test(s)) sp.hover = true
  return sp
}

/** Parse the Senses field; passive Perception defaults to 10. */
function parseSenses(s: string): Senses {
  const pp = /passive Perception\s+(\d+)/i.exec(s)
  const out: Senses = { passivePerception: pp ? Number(pp[1]) : 10 }
  for (const k of ["darkvision", "blindsight", "tremorsense", "truesight"] as const) {
    const m = new RegExp(`${k}\\s+(\\d+)`, "i").exec(s)
    if (m) out[k] = Number(m[1])
  }
  return out
}

/** Split a field on commas, semicolons, and "and", dropping blanks, "—", and "None". */
const list = (s: string): string[] =>
  s.split(/[,;]| and /).map((x) => x.trim()).filter((x) => x && x !== "—" && !/^None$/i.test(x))

/** Header lines → a label→value map (continuations joined) plus the ability table. */
function parseHeader(rawHeader: string[]) {
  // The PDF mixes dash glyphs (hyphen, en/em dash, U+2212 minus) in negative
  // modifiers like "9(−1)"; normalize them so the ability/save/skill parsers match.
  const header = rawHeader.map((l) => l.replace(/[−–—]/g, "-"))
  const FIELD = /^(Armor Class|Hit Points|Speed|Saving Throws|Skills|Damage Vulnerabilities|Damage Resistances|Damage Immunities|Condition Immunities|Senses|Languages|Challenge|Proficiency Bonus)\b\s*(.*)$/
  const fields: Record<string, string> = {}
  const abilNames: string[] = [], abilVals: number[] = []
  let cur: string | null = null
  // The ability row may pack several labels/values per line ("STR  DEX", "28 (+9) 10 (+0)").
  const ABIL = /^(STR|DEX|CON|INT|WIS|CHA)(\s+(STR|DEX|CON|INT|WIS|CHA))*$/i
  const VALS = /^(\d+\s*\([+-]?\d+\)\s*)+$/
  for (const raw of header.slice(1)) {
    const line = raw.replace(/\s+/g, " ").trim()
    const f = FIELD.exec(raw)
    if (f) { cur = f[1]; fields[cur] = f[2]; continue }
    if (ABIL.test(line)) { for (const t of line.split(" ")) abilNames.push(t.toLowerCase()); cur = null; continue }
    if (VALS.test(line)) { for (const m of line.matchAll(/(\d+)\s*\([+-]?\d+\)/g)) abilVals.push(Number(m[1])); cur = null; continue }
    if (cur) fields[cur] = `${fields[cur]} ${raw}`.trim()
  }
  const abilities = {} as AbilityScores
  const ORDER: Ability[] = ["str", "dex", "con", "int", "wis", "cha"]
  // The six values are read left-to-right, so they are ALWAYS in canonical STR→CHA
  // column order; the header LABELS can be reordered by a typesetting baseline quirk
  // (ToB 1 sets some creatures' STR header ~1px lower, so it sorts after the others and
  // a name-positional zip shifts every score — e.g. Doppelrat). With the full set,
  // trust the columns; otherwise fall back to the (best-effort) name zip.
  if (abilVals.length === 6) {
    ORDER.forEach((k, i) => { abilities[k] = abilVals[i] })
  } else {
    abilNames.forEach((n, i) => { if (n in ABBR && abilVals[i] != null) abilities[ABBR[n]] = abilVals[i] })
  }
  // Keep the schema valid (and the app safe) when a two-column quirk hides a value.
  for (const k of ORDER) if (abilities[k] == null) abilities[k] = 10
  return { sizeType: header[0] ?? "", fields, abilities }
}

/** Parse "Str +5, Con –2" pairs into an ability → bonus map, tolerating en-dash minuses. */
function bonuses(s: string): Partial<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const m of s.matchAll(/(Str|Dex|Con|Int|Wis|Cha)\s*([+\-–]\d+)/gi)) out[ABBR[m[1].slice(0, 3).toLowerCase()]] = Number(m[2].replace("–", "-"))
  return out
}

/** Parse the Skills field into SkillBonuses, dropping unknown labels. */
function skills(s: string): SkillBonuses {
  const out: SkillBonuses = {}
  for (const m of s.matchAll(/([A-Za-z][A-Za-z ]*?)\s*([+\-–]\d+)/g)) {
    const key = SKILL_KEY[m[1].trim().toLowerCase()]
    if (key) out[key] = Number(m[2].replace("–", "-"))
  }
  return out
}

// ── 2014 trait-based spellcasting (ToB 2) ─────────────────────────────────────
// ToB 2 carries spellcasting as a *trait* ("Innate Spellcasting" / "Spellcasting"),
// phrased "spellcasting ability is X" (not 2024's "using X as the ability"), in two
// shapes: innate (At will / N per day) and slot-based ("Nth-level spellcaster …
// Cantrips (at will): … 1st level (4 slots): …"). srd52's parseSpellcasting only does
// the 2024 innate form, so this handles the 2014 forms.

const FULL_ABILITY: Record<string, Ability> = {
  strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha',
}

// Book names whose slug wouldn't match the SRD spell id (compactions / 2014 titles).
const SPELL_NAME_FIXES: Record<string, string> = {
  firebolt: 'fire bolt',
  'create water': 'create or destroy water',
}

/** SpellRef for a 2014 spell name: drop "(…)" and "*", fix renames, strip id apostrophes. */
function spellRef2014(raw: string, spellSource: string): SpellRef {
  let name = raw.replace(/\([^)]*\)/g, '').replace(/\*+/g, '').trim() // drop "(self only)", footnote *
  name = SPELL_NAME_FIXES[name.toLowerCase()] ?? name
  // SRD 5.1 ids strip apostrophes ("hunters-mark"); keep the apostrophe in the display name.
  return { name, ref: `${spellSource}:${slug(name.replace(/['’]/g, ''))}` }
}

/** Split a spell list on top-level commas (commas inside "(…)" stay put). A "*" starts a
 *  footnote ("*if using the Midgard Heroes Handbook, replace …") — drop from there on. */
function splitSpells(s: string, spellSource: string): SpellRef[] {
  s = s.split('*')[0]
  const parts: string[] = []
  let depth = 0, cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  if (cur) parts.push(cur)
  return parts.map((x) => x.trim()).filter(Boolean).map((x) => spellRef2014(x, spellSource))
}

// The trailing "Each" is captured, not discarded: a 2014 book wrote both "3/Day Each:"
// (N uses of every spell listed) and "1/Day:" (one casting from the whole list), and the
// two are different creatures to fight.
const TIER = /(At Will|\d+\s*\/\s*Day)(\s+Each)?\s*:/gi

/** Parse a 2014 spellcasting trait or action — innate, slot-based, or usage-in-name forms. */
function parse2014Spellcasting(entry: { name: string; text: string }, spellSource: string): Spellcasting | null {
  const blob = `${entry.name}. ${entry.text}`
  const abilWord = (/spellcasting ability(?: score)? is (\w+)/i.exec(blob) ?? /using (\w+) as the spellcasting ability/i.exec(blob))?.[1]?.toLowerCase()
  const ability = abilWord ? (FULL_ABILITY[abilWord] ?? (abilWord.slice(0, 3) as Ability)) : undefined
  const saveDc = Number(/save DC (\d+)/i.exec(blob)?.[1]) || undefined
  const toHit = Number(/([+-]?\d+) to hit with spell/i.exec(blob)?.[1]) || undefined

  const groups: SpellGroup[] = []
  const slots: SpellSlots = {}

  if (/-level spellcaster|\(\d+\s*slots?\)/i.test(blob)) {
    // Slot-based: cantrips (at will) + per-level slot pools.
    const cant = /Cantrips?\s*\(at will\)\s*:\s*([\s\S]*?)(?=\d(?:st|nd|rd|th)\s+level|$)/i.exec(blob)
    if (cant) { const sp = splitSpells(cant[1], spellSource); if (sp.length) groups.push({ usage: { type: 'atWill' }, spells: sp }) }
    for (const m of blob.matchAll(/(\d)(?:st|nd|rd|th)\s+level\s*\((\d+)\s*slots?\)\s*:\s*([\s\S]*?)(?=\d(?:st|nd|rd|th)\s+level|$)/gi)) {
      const level = Number(m[1]), count = Number(m[2]), sp = splitSpells(m[3], spellSource)
      if (!sp.length) continue
      groups.push({ usage: { type: 'slots', level }, spells: sp })
      if (count > 0) slots[String(level) as SpellLevel] = count
    }
  } else {
    // Innate: "At will: …", "N/day each: …", "N/day: …"
    const markers = [...blob.matchAll(TIER)]
    for (let i = 0; i < markers.length; i++) {
      const header = markers[i][1].toLowerCase()
      const each = Boolean(markers[i][2])
      const start = markers[i].index! + markers[i][0].length
      const end = i + 1 < markers.length ? markers[i + 1].index! : blob.length
      const sp = splitSpells(blob.slice(start, end), spellSource)
      if (!sp.length) continue
      const perDay: SpellUsage = { type: 'perDay', per: Number(/(\d+)/.exec(header)?.[1]) || 1 }
      // A lone spell reads "1/Day:" with no "Each" and means the same either way, so the
      // flag is only set where the group really is a pool between two or more spells.
      if (!each && sp.length > 1) (perDay as { shared?: boolean }).shared = true
      groups.push({ usage: /at will/.test(header) ? { type: 'atWill' } : perDay, spells: sp })
    }
    if (!groups.length) {
      // Usage-in-name: "Innate Spellcasting (1/Day). The X can innately cast Y …"
      const cast = /innately cast(?:s)? ([^.]+?)(?:,?\s*(?:requiring|while|and it|\.))/i.exec(blob)
      if (cast) {
        const sp = splitSpells(cast[1], spellSource)
        const perDay = /\((\d+)\s*\/\s*Day\)/i.exec(entry.name)
        if (sp.length) groups.push({ usage: perDay ? { type: 'perDay', per: Number(perDay[1]) } : { type: 'atWill' }, spells: sp })
      }
    }
  }

  if (!groups.length) return null
  const sc: Spellcasting = { groups }
  if (ability) sc.ability = ability
  if (saveDc != null) sc.saveDc = saveDc
  if (toHit != null) sc.toHit = toHit
  if (Object.keys(slots).length) sc.slots = slots
  return sc
}

// `source` lets the 2014-format Kobold books (ToB 2 / ToB 3) share this mapper — the
// block shape is identical, so only the source id (and thus the entry ids) differ.
export function mapTob3(block: Tob3Block, source = 'kobold-press-tob3'): Creature {
  const { sizeType, fields, abilities } = parseHeader(block.header)
  const stM = /^(Tiny|Small|Medium|Large|Huge|Gargantuan)(?:\s+or\s+Small)?\s+(.+?),\s*(.+)$/i.exec(sizeType)
  const size = (stM ? stM[1] : "Medium") as Size
  const type = stM ? stM[2].toLowerCase().replace(/\s*\(.*\)\s*/, " ").trim() : "creature"
  const alignment = stM ? stM[3].trim().toLowerCase() : undefined

  const hpM = /(\d+)\s*\(([^)]+)\)/.exec(fields["Hit Points"] ?? "")
  // CR is the leading number/fraction; XP is parsed separately and leniently — ToB 1
  // has malformed Challenge lines ("16 (15, 000 XP)" with a stray space, "10 (5,900)"
  // with no "XP") that one strict `N (N XP)` regex would drop, losing the CR entirely.
  let chal = fields["Challenge"] ?? ""
  if (!/^[\d/]+/.test(chal)) {
    // The Challenge line was displaced out of the header — a variant stat block
    // interleaves in the same column (e.g. Alseid + its grovekeeper, Spectral Guardian
    // + its arcane variant), so a trait stops the header before the host's own
    // right-column Challenge. Recover the first field-style "Challenge N (…)" from
    // anywhere in the block (the variant's prose "challenge rating of N" won't match).
    const all = [
      ...block.header,
      ...block.traits.flatMap((t) => [t.name, t.text]),
      ...Object.values(block.sections).flatMap((es) => es.flatMap((e) => [e.name, e.text])),
    ].join(" ")
    const m = /\bChallenge\s+([\d/]+\s*\([\d,\s]*?(?:XP)?\))/.exec(all)
    if (m) chal = m[1]
  }
  const crM = /^([\d/]+)/.exec(chal)
  const cr = crM ? (crM[1].includes("/") ? Number(crM[1].split("/")[0]) / Number(crM[1].split("/")[1]) : Number(crM[1])) : undefined
  const xpM = /\(([\d,\s]+?)(?:\s*XP)?\)/.exec(chal)
  const dexMod = abilities.dex != null ? Math.floor((abilities.dex - 10) / 2) : 0

  const creature: Creature = {
    id: `${source}:${slug(block.name)}`,
    source,
    edition: "5.0",
    name: titleCase(block.name),
    size,
    type,
    ac: Number((fields["Armor Class"] ?? "0").match(/\d+/)?.[0] ?? 0),
    maxHp: hpM ? Number(hpM[1]) : 0,
    initiative: dexMod,
    speed: parseSpeed(fields["Speed"] ?? ""),
    abilities,
    senses: parseSenses(fields["Senses"] ?? ""),
  }
  if (block.sourcePage) creature.sourcePage = block.sourcePage
  if (alignment) creature.alignment = alignment
  if (hpM) creature.hpFormula = normDice(hpM[2])
  if (cr != null) creature.cr = cr
  if (xpM) creature.xp = num(xpM[1].replace(/\s/g, ""))
  const sv = bonuses(fields["Saving Throws"] ?? "") as SaveBonuses
  if (Object.keys(sv).length) creature.saves = sv
  const sk = skills(fields["Skills"] ?? "")
  if (Object.keys(sk).length) creature.skills = sk
  if (fields["Damage Resistances"]) creature.resistances = list(fields["Damage Resistances"])
  if (fields["Damage Immunities"]) creature.immunities = list(fields["Damage Immunities"])
  if (fields["Damage Vulnerabilities"]) creature.vulnerabilities = list(fields["Damage Vulnerabilities"])
  if (fields["Condition Immunities"]) creature.conditionImmunities = list(fields["Condition Immunities"])
  if (fields["Languages"]) { const l = list(fields["Languages"]); if (l.length) creature.languages = l }

  // ToB 2/3 are 2014 (edition 5.0): cast spells link to the 5.1 library, not 5.2.
  const spellSource = 'srd-5.1'
  const traits: Trait[] = []
  for (const t of block.traits) {
    // ToB 2 carries spellcasting as a trait — lift it into the structured block.
    if (!creature.spellcasting && /spellcasting/i.test(t.name)) {
      const sc = parse2014Spellcasting(t, spellSource)
      if (sc) { creature.spellcasting = sc; continue }
    }
    const lr = /Legendary Resistance\s*\((\d+)\/Day\)/i.exec(t.name)
    if (lr) creature.legendaryResistance = Number(lr[1])
    traits.push({ name: t.name, text: prose(t.text) })
  }
  if (traits.length) creature.traits = traits

  // Spellcasting is an Action entry in the 2014 format (same "At Will / N/Day" prose as
  // 2024) — lift it into the structured block instead of leaving it a plain action.
  const actionEntries = (block.sections["Actions"] ?? []).filter((e) => {
    if (!/^Spellcasting$/i.test(e.name)) return true
    const sc: Spellcasting | null = parseSpellcasting(e, spellSource)
    if (sc) creature.spellcasting = sc
    return false
  })
  const actions = actionEntries.flatMap(expandAction)
  if (actions.length) creature.actions = actions
  const bonus = (block.sections["Bonus Actions"] ?? []).flatMap(expandAction)
  if (bonus.length) creature.bonusActions = bonus
  const reactions = (block.sections["Reactions"] ?? []).flatMap(expandAction)
  if (reactions.length) creature.reactions = reactions
  const legendary = (block.sections["Legendary Actions"] ?? []).flatMap(expandAction)
  if (legendary.length) {
    const la: LegendaryActions = { perRound: 3, actions: legendary }
    creature.legendaryActions = la
  }
  // ToB 2 has lair actions (ToB 3 has none); map them when present.
  const lair = (block.sections["Lair Actions"] ?? []).flatMap(expandAction)
  if (lair.length) creature.lairActions = lair
  return creature
}

/** Title-case a name from the PDF's all-caps, keeping a possessive "'s" lowercase. */
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/'([A-Z])/g, (m, c) => "'" + c.toLowerCase())
}
