// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { DatasetReport } from './validate.ts'

interface ValidatedEmissionOptions<T> {
  validate: (records: T[]) => DatasetReport
  report: (report: DatasetReport) => void
  space?: number | string
}

/** Validate and report a dataset before creating directories or replacing its destination. */
export function emitValidatedDataset<T>(
  records: T[],
  destination: string,
  options: ValidatedEmissionOptions<T>
): DatasetReport {
  const report = options.validate(records)
  options.report(report)
  if (report.errors) return report

  const bytes = JSON.stringify(records, null, options.space ?? 0)
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, bytes)
  return report
}
