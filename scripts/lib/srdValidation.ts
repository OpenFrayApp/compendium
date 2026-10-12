// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { DatasetReport } from '../../src/compendium/validate.ts'

/** Report SRD validation findings with entry identities and any reviewed source evidence. */
export function reportSrdValidation(label: string, report: DatasetReport): void {
  console.log(`${label}: errors: ${report.errors}, warnings: ${report.warns}`)
  for (const issue of report.issues) {
    console.error(
      `  ${issue.severity}: ${issue.name} [${issue.id}] · ${issue.field}: ${issue.message}`
    )
    if (issue.review) {
      console.error(`    ${issue.review.reason}`)
      console.error(`    Source: ${issue.review.evidence}`)
    }
  }
}
