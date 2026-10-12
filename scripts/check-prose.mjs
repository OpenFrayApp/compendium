// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { globSync, readFileSync } from 'node:fs'

// Source reviews and legal evidence are excluded; current guides are listed explicitly.
const DOCS = ['*.md', 'docs/verification.md']

// Quoted legal text. CREDITS.md carries license wording that has to match its source, and
// the code of conduct is the Contributor Covenant verbatim. Neither is ours to reword.
const LEGAL = new Set(['CREDITS.md', 'CODE_OF_CONDUCT.md', 'CHANGELOG.md'])

// "- **AC** — armor class", and the same led by a link or a code span, or inside a table
// cell. A glossary line is terse by construction. The banned form is the aside that
// interrupts a sentence, so the term has to open the line for the dash to be allowed.
const DEFINITION = /^\s*(?:[-*]|\d+\.|\|)?\s*(?:\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)\s+—/

// Counted, never fatal: each of these matches good sentences too.
const SOFT = {
  'rhetorical contrast': /\b(?:, not |, never |beats\b|rather than|instead of)\b/gi,
  aphorism:
    /\bis a bug\b|\bis the point\b|\bthe whole point\b|\bthe one thing\b|\bthe only thing\b/gi,
  'project narration': /\b(?:was tried|abandoned|retired it|quietly|nobody is watching)\b/gi
}

/** Blank non-prose content while retaining original line numbers. */
function prose(source) {
  const blank = (match) => match.replace(/[^\n]/g, ' ')
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, blank)
    .replace(/^```[\s\S]*?^```/gm, blank)
    .replace(/`[^`\n]+`/g, '`code`')
}

// An aside joins two pieces of text. A table cell holding only "—" means "none", and a
// dash opening a line is a list marker, so both need a word on each side to count.
const ASIDE = /[\w),.\]*"'] — [\w([*"'_]/g

// The same aside, wrapped: a paragraph line that ends on the dash, or resumes on one.
const WRAPPED = /[\w),.\]*"'] —\s*$|^\s*— [\w([*"'_]/

const failures = []
const soft = {}
let files = 0

for (const pattern of DOCS) {
  for (const file of globSync(pattern, { exclude: (p) => p.includes('node_modules') }).sort()) {
    if (LEGAL.has(file)) continue
    files++
    const source = readFileSync(file, 'utf8')
    const body = prose(source)

    body.split('\n').forEach((line, index) => {
      const dashes = (line.match(ASIDE)?.length ?? 0) + (WRAPPED.test(line) ? 1 : 0)
      const allowed = DEFINITION.test(line) ? 1 : 0
      if (dashes > allowed) {
        failures.push(`${file}:${index + 1}\n    ${line.trim()}`)
      }
    })

    for (const [name, pattern] of Object.entries(SOFT)) {
      const hits = body.match(pattern)?.length ?? 0
      if (hits) soft[name] = (soft[name] ?? 0) + hits
    }
  }
}

for (const [name, count] of Object.entries(soft)) {
  console.log(`Prose check: ${count} × ${name} (not fatal, read them when the count grows).`)
}

if (failures.length) {
  console.error(`\nProse check: ${failures.length} em-dash aside(s) in shipped documentation.`)
  console.error('AGENTS.md, "Writing style": use a period, a colon, or parentheses instead.')
  console.error(`A definition list item ("- **AC** — armor class") is the one allowed form.\n`)
  for (const failure of failures) console.error(failure)
  process.exit(1)
}

console.log(`Prose check: ${files} documents clean.`)
