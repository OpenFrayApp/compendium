// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/** Map the reviewed PDF extraction, validate it, and write a credited creature library. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import {
  KHYBERIA_ATTRIBUTION, mapKhyberiaSnapshot, type KhyberiaSnapshot,
} from '../src/compendium/khyberia.ts'
import { validateDataset } from '../src/compendium/validate.ts'

const snapshotPath = process.argv[2] ?? 'output/khyberia/blocks.json'
const snapshot: KhyberiaSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'))
const creatures = mapKhyberiaSnapshot(snapshot)
const report = validateDataset(creatures)
mkdirSync('output/khyberia', { recursive: true })
writeFileSync('output/khyberia/validation.json', JSON.stringify(report, null, 2) + '\n')
if (report.errors) throw new Error(`Khyberia validation failed with ${report.errors} errors`)
writeFileSync('output/khyberia-creatures.json', JSON.stringify(creatures, null, 2) + '\n')
writeFileSync('output/khyberia/ATTRIBUTION.md', [
  '# Khyberia SRD attribution',
  ...KHYBERIA_ATTRIBUTION,
  'Adapted by OpenFray from the October 2023 PDF into structured creature data. Layout and line wrapping were normalized. Optional damage, rest-based recovery, shape changes, and other conditional effects remain in prose where the schema cannot represent them faithfully. Published statistics were not corrected.',
  `Source PDF SHA-256: \`${snapshot.sha256}\`.`,
  'See `docs/khyberia-review.md` for compatibility, fidelity limits, and published inconsistencies.',
].join('\n\n') + '\n')
console.log(`Khyberia: ${creatures.length} creatures, ${report.errors} errors, ${report.warns} warnings`)
for (const issue of report.issues) console.log(`  ${issue.name} · ${issue.field}: ${issue.message}`)
console.log('Wrote output/khyberia-creatures.json and output/khyberia/ATTRIBUTION.md')
