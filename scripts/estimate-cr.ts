// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/**
 * Compare each creature's listed challenge rating against a DMG-style estimate, so a
 * first-party library can be reviewed before it ships.
 *
 *   node scripts/estimate-cr.ts output/waking-garden-creatures.json [tolerance]
 *
 * Entries more than `tolerance` steps (default 2) from their estimate are flagged. A flag
 * is a prompt to look, not a verdict: the estimate prices damage and durability only, so
 * a creature built around control reads low by design. See src/compendium/crestimate.ts.
 */

import { readFileSync } from 'node:fs'
import { estimateCr } from '../src/compendium/crestimate.ts'
import type { Creature } from '../src/schema/creature.ts'

const [path, rawTolerance] = process.argv.slice(2)
if (!path) {
  console.error('usage: node scripts/estimate-cr.ts <creatures.json> [tolerance]')
  process.exit(2)
}
const tolerance = Number(rawTolerance ?? 2)

const creatures: Creature[] = JSON.parse(readFileSync(path, 'utf8'))
const rows = creatures
  .map((c) => ({ c, e: estimateCr(c), delta: estimateCr(c).estimated - (c.cr ?? 0) }))
  .sort((a, b) => (a.c.cr ?? 0) - (b.c.cr ?? 0))

/** Right-align a value in a w-character column. */
const col = (v: unknown, w: number) => String(v).padStart(w)
console.log(
  'creature'.padEnd(24),
  col('CR', 5), col('est', 6), col('def', 5), col('off', 5),
  col('hp', 5), col('eHP', 5), col('AC', 3), col('DPR', 4), col('atk', 4), col('DC', 3),
)
for (const { c, e, delta } of rows) {
  const flag =
    Math.abs(delta) >= tolerance ? `   <<< ${delta > 0 ? 'under' : 'over'}-rated by ${Math.abs(delta).toFixed(1)}` : ''
  console.log(
    c.name.padEnd(24),
    col(c.cr ?? '—', 5), col(e.estimated.toFixed(1), 6), col(e.defensive, 5), col(e.offensive, 5),
    col(c.maxHp, 5), col(e.effectiveHp, 5), col(c.ac, 3), col(e.damagePerRound, 4),
    col(e.attackBonus || '—', 4), col(e.saveDc || '—', 3), flag,
  )
}

const flagged = rows.filter((r) => Math.abs(r.delta) >= tolerance)
console.log(`\n${rows.length} creatures — ${flagged.length} more than ${tolerance} steps from their estimate`)
