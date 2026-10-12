// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { globSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import * as prettier from 'prettier'

const check = process.argv[2] === '--check'
const requested = process.argv.slice(check ? 3 : 2)
if (!check && !requested.length) {
  console.error('Specify files: npm run format -- scripts/example.ts')
  process.exit(1)
}

const patterns = [
  '.prettierrc.json',
  '*.json',
  '*.md',
  'src/**/*.ts',
  'scripts/**/*.ts',
  'scripts/**/*.mjs',
  'tests/**/*.test.ts',
  'tests/fixtures/verification/*.json',
  'docs/verification.md'
]
const eligible = new Set()
for (const file of globSync(patterns)) {
  const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore' })
  if (!info.ignored) eligible.add(file)
}
const files = requested.length
  ? requested.map((file) => relative(process.cwd(), resolve(file)))
  : [...eligible].sort()
for (const file of files) {
  if (!eligible.has(file)) {
    console.error(`Outside formatting scope: ${file}`)
    process.exit(1)
  }
}
for (const file of files) {
  const options = { ...(await prettier.resolveConfig(file)), filepath: file }
  const text = readFileSync(file, 'utf8')
  if (check) {
    if (!(await prettier.check(text, options))) {
      console.error(`Formatting debt: ${file}`)
      process.exitCode = 1
    }
  } else {
    writeFileSync(file, await prettier.format(text, options))
  }
}
