// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { DatasetReport } from './validate.ts'
import { map2014StatBlock, type StatBlock2014 } from '../formats/statBlock2014.ts'
import type { Creature } from '../schema/creature.ts'

/** Map every supplied Tome block, identifying failures before emission can begin. */
export function mapTomeBlocks(blocks: StatBlock2014[], source: string): Creature[] {
  if (!Array.isArray(blocks) || !blocks.length)
    throw new Error(`${source}: expected a nonempty stat-block array`)
  return blocks
    .map((block, index) => {
      try {
        return map2014StatBlock(block, source)
      } catch (cause) {
        throw new Error(
          `${source} record ${index + 1} (${block?.name ?? 'unnamed'}): mapping failed`,
          { cause }
        )
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Report source-specific validation findings without changing candidate statistics. */
export function reportKoboldValidation(source: string, report: DatasetReport): void {
  console.log(
    `${source}: ${report.count} creatures — errors: ${report.errors}, warnings: ${report.warns}`
  )
  for (const issue of report.issues) {
    console.error(`  ${issue.severity}: ${issue.id} · ${issue.field}: ${issue.message}`)
    if (issue.review) console.error(`    ${issue.review.reason} Source: ${issue.review.evidence}`)
  }
}
