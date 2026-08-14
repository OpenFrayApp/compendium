// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

// Map SRD 5.2.1 spell blocks (from scripts/extract-srd52-spells-pdf.py) into the
// Spell schema. Display fields come verbatim from the official PDF; the rollable
// mechanics (damage, save, attack, higher-level scaling) are parsed from the prose
// — the same prose-parsing discipline the creature mapper uses, never inferred.

import type { Ability } from '../schema/primitives.ts'
import type { DamageRoll, SaveOutcome } from '../schema/action.ts'
import type {
  DelayedDamage,
  Spell,
  SpellComponents,
  SpellMechanics,
  SpellSave,
  SpellScaling,
} from '../schema/spell.ts'
import { slug } from './srd52.ts'

export interface Srd52SpellBlock {
  name: string
  sourcePage: number | null
  header: string
  castingTime: string
  range: string
  components: string
  duration: string
  text: string
}

const SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
const DAMAGE_TYPES = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']
const ABILITY_BY_NAME: Record<string, Ability> = {
  strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha',
}

// A PDF name-font glyph quirk uppercases some interior letters (e.g. "Acid SplASh").
// For a word showing a lowercase→uppercase flip, keep the initial and lowercase the
// rest; words without the flip (normal Title Case, "of"/"the") are left untouched.
const fixCaps = (name: string): string =>
  name.split(' ').map((w) => (/[a-z][A-Z]/.test(w) ? w[0] + w.slice(1).toLowerCase() : w)).join(' ')

const DTYPE = `(${DAMAGE_TYPES.join('|')})`
const DICE = String.raw`\d+d\d+(?:\s*\+\s*\d+)?`
// "8d6 Fire damage", "5d10 Radiant or Necrotic damage" (first type kept).
const DAMAGE_RE = new RegExp(String.raw`(${DICE})\s+${DTYPE}(?:\s+or\s+\w+)?\s+damage`, 'gi')
// "Force damage equal to 4d12" — the conjured-weapon spells put the type first.
const DAMAGE_EQ_RE = new RegExp(String.raw`${DTYPE}\s+damage equal to\s+(${DICE})`, 'gi')
/** Strip all whitespace ("2d8 + 5" → "2d8+5"). */
const norm = (s: string): string => s.replace(/\s+/g, '')

// "and 2d4 Acid damage at the end of its next turn" — the clause Acid Arrow and
// Vitriolic Sphere use for damage that lands a turn later. Captured on its own so it
// never joins the immediate damage, which would deal it a turn early.
const DELAYED_RE = new RegExp(
  String.raw`(?:and|plus)\s+(?:another\s+)?(${DICE})\s+${DTYPE}\s+damage at the end of its next turn`,
  'i',
)

/** The damage a spell deals later, lifted out of the prose clause that describes it. */
function delayedDamage(text: string): DelayedDamage | undefined {
  const m = DELAYED_RE.exec(text)
  if (!m) return undefined
  return {
    damage: [{ formula: norm(m[1]), type: m[2].toLowerCase() as DamageRoll['type'] }],
    when: 'endOfNextTurn',
  }
}

/** Every distinct "NdM <type> damage" the spell deals at its base level. */
function baseDamage(text: string): DamageRoll[] | undefined {
  const out: DamageRoll[] = []
  const seen = new Set<string>()
  /** Record one formula/type roll, skipping duplicates of the same pair. */
  const add = (formula: string, type: string) => {
    const f = norm(formula)
    const k = `${f}|${type}`
    if (!seen.has(k)) { seen.add(k); out.push({ formula: f, type: type.toLowerCase() as DamageRoll['type'] }) }
  }
  for (const m of text.matchAll(DAMAGE_RE)) add(m[1], m[2])
  for (const m of text.matchAll(DAMAGE_EQ_RE)) add(m[2], m[1])
  return out.length ? out : undefined
}

/** Parse the first "X saving throw" in the prose; on-save is half, none (damage), or negates. */
function spellSave(text: string, hasDamage: boolean): SpellSave | undefined {
  const m = /\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+saving throw/i.exec(text)
  if (!m) return undefined
  const ability = ABILITY_BY_NAME[m[1].toLowerCase()]
  const onSave: SaveOutcome = /half as much|takes half|half the/i.test(text) ? 'half' : hasDamage ? 'none' : 'negates'
  return { ability, onSave }
}

// "Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10),
// 11 (3d10), and 17 (4d10)." → absolute damage at character levels 5/11/17.
function cantripScaling(scaleText: string, type: DamageRoll['type']): SpellScaling[] | undefined {
  const out: SpellScaling[] = []
  for (const m of scaleText.matchAll(/(\d+)\s*\((\d+d\d+)\)/g)) {
    out.push({ level: Number(m[1]), by: 'character', damage: [{ formula: m[2], type }] })
  }
  return out.length ? out : undefined
}

// "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot
// level above 3." → absolute damage for slot levels base+1..9. The increment applies
// to every base component sharing the incremented die (e.g. Flame Strike's two dice).
function slotScaling(scaleText: string, base: DamageRoll[]): SpellScaling[] | undefined {
  const m = /increases? by (\d+)d(\d+)[^.]*?for each spell slot level above (\d+)/i.exec(scaleText)
  if (!m) return undefined
  const incCount = Number(m[1]), die = Number(m[2]), above = Number(m[3])
  /** Add steps × increment to a component's die count; components on another die pass through. */
  const scaleOne = (d: DamageRoll, steps: number): DamageRoll => {
    const bm = /^(\d+)d(\d+)(\+\d+)?$/.exec(d.formula)
    if (!bm || Number(bm[2]) !== die) return d // a component on a different die is unchanged
    return { formula: `${Number(bm[1]) + steps * incCount}d${die}${bm[3] ?? ''}`, type: d.type }
  }
  const out: SpellScaling[] = []
  for (let lvl = above + 1; lvl <= 9; lvl++) {
    const damage = base.map((d) => scaleOne(d, lvl - above))
    if (JSON.stringify(damage) !== JSON.stringify(base)) out.push({ level: lvl, by: 'slot', damage })
  }
  return out.length ? out : undefined
}

const SCALE_HEADING = /(Using a Higher-Level Spell Slot|Cantrip Upgrade)\.\s*/

/** Rollable mechanics parsed from the prose: damage, save, attack flag, and level scaling. */
function mechanics(desc: string, scaleText: string, isCantrip: boolean): SpellMechanics | undefined {
  const delayed = delayedDamage(desc)
  // The delayed clause matches the general damage sweep too; drop it from the
  // immediate set so a spell's later damage is only ever counted once.
  const damage = baseDamage(desc)?.filter(
    (d) => !delayed?.damage.some((x) => x.formula === d.formula && x.type === d.type),
  )
  const save = spellSave(desc, !!damage)
  const attackRoll = /Make a (?:ranged|melee) spell attack/i.test(desc) && damage ? true : undefined
  let scaling: SpellScaling[] | undefined
  if (scaleText && damage?.length) {
    scaling = isCantrip ? cantripScaling(scaleText, damage[0].type) : slotScaling(scaleText, damage)
  }
  if (!damage?.length && !delayed && !save && !attackRoll && !scaling) return undefined
  return {
    ...(damage?.length && { damage }),
    ...(delayed && { delayed }),
    ...(attackRoll && { attackRoll }),
    ...(save && { save }),
    ...(scaling && { scaling }),
  }
}

/** Parse a "V, S, M (…)" components string into flags plus the material description. */
function parseComponents(s: string): SpellComponents {
  const matM = /\bM\s*\(([^)]*)\)/.exec(s)
  return {
    verbal: /\bV\b/.test(s),
    somatic: /\bS\b/.test(s),
    material: /\bM\b/.test(s),
    ...(matM && { materials: matM[1].trim() }),
  }
}

// "Level 3 Evocation (Sorcerer, Wizard)" or "Evocation Cantrip (Bard, Wizard)".
function parseHeader(header: string): { level: number; school: string; classes?: string[] } {
  const classM = /\(([^)]*)\)\s*$/.exec(header)
  const classes = classM ? classM[1].split(',').map((c) => c.trim()).filter(Boolean) : undefined
  const lvlM = /^Level\s+(\d)\s+(\w+)/i.exec(header)
  if (lvlM) return { level: Number(lvlM[1]), school: lvlM[2], classes }
  const cantM = new RegExp(`^(${SCHOOLS.join('|')})\\s+Cantrip`, 'i').exec(header)
  return { level: 0, school: cantM ? cantM[1] : header.split(/\s+/)[0], classes }
}

// Turn the PDF's "•" bullets into markdown list items so they render as a list
// instead of running inline.
const bullets = (s: string): string => s.replace(/\s*•\s*/g, '\n- ')

/** Map an extracted 5.2 spell block into a Spell, splitting scaling prose out of the text. */
export function mapSrd52Spell(block: Srd52SpellBlock): Spell {
  const name = fixCaps(block.name)
  const { level, school, classes } = parseHeader(block.header)
  const ritual = /\bRitual\b/i.test(block.castingTime)
  const concentration = /^Concentration/i.test(block.duration)
  // Concentration is a flag; the SpellCard prepends "Concentration, " itself, so keep
  // the bare duration (matching the 5.1 convention) to avoid doubling it.
  const duration = block.duration.replace(/^Concentration,\s*/i, '')

  // Split the description from the higher-level scaling paragraph.
  const parts = block.text.split(SCALE_HEADING)
  const desc = parts[0].trim()
  const scaleText = parts.length > 2 ? parts[2].trim() : ''
  const text = bullets(scaleText ? `${desc}\n\n**${parts[1]}.** ${scaleText}` : desc)
  const mech = mechanics(desc, scaleText, level === 0)

  return {
    id: `srd-5.2:${slug(name)}`,
    source: 'srd-5.2',
    edition: '5.5',
    ...(block.sourcePage != null && { sourcePage: block.sourcePage }),
    name,
    level,
    school,
    castingTime: block.castingTime,
    range: block.range,
    components: parseComponents(block.components),
    duration,
    concentration,
    ritual,
    ...(classes && { classes }),
    text,
    ...(mech && { mechanics: mech }),
  }
}
