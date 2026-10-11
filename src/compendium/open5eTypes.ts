// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

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

export interface LegacyRecord {
  name: string
  document__slug: string
  v2_converted_path: string
  page_no?: number | null
  perception?: number | null
  legendary_desc?: string | null
}

export interface Open5eAction {
  name?: string
  desc?: string
  action_type?: string
  order_in_statblock?: number
  legendary_action_cost?: number | null
  usage_limits?: { type: string; param: number } | null
  attacks?: {
    to_hit_mod?: number
    reach?: number | null
    range?: number | null
    long_range?: number | null
  }[]
}

export interface Open5eRecord extends Open5eCreature {
  document: { key: string }
  actions?: Open5eAction[]
  speed_all?: { hover?: boolean }
  initiative_bonus?: number | null
  modifiers?: Record<string, number>
  legacy?: LegacyRecord
}

export interface Open5eSpellDocument {
  key: string
  name: string
  type: string
  publisher: { key: string; name: string }
  gamesystem: { key: string; name: string }
  licenses: { key: string; name: string }[]
  permalink?: string
}

export interface Open5eSpellRecord {
  key: string
  document: { key: string }
  name: string
  level: number
  school: { name: string }
  classes: { name: string }[]
  casting_time: string
  reaction_condition?: string | null
  range_text: string
  duration: string
  concentration: boolean
  ritual: boolean
  verbal: boolean
  somatic: boolean
  material: boolean
  material_specified?: string | null
  desc: string
  higher_level?: string | null
  casting_options?: unknown[]
}

export interface Open5eSpellSnapshot {
  documents: Open5eSpellDocument[]
  records: Open5eSpellRecord[]
  fetchedAt: string
}
