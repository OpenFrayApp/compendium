// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

const root = process.cwd()
const tracked = new Set(
  execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
)
const documents = new Map(
  [...tracked]
    .filter((path) => path.endsWith('.md'))
    .map((path) => [path, readFileSync(path, 'utf8')])
)
/** Derive Markdown heading anchors, retaining GitHub-style duplicate suffixes. */
function anchors(text: string): Set<string> {
  const result = new Set<string>()
  const repeats = new Map<string, number>()
  for (const match of text.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const slug = match[1]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_\- ]/gu, '')
      .replace(/ /g, '-')
    const repeat = repeats.get(slug) ?? 0
    repeats.set(slug, repeat + 1)
    result.add(slug + (repeat ? `-${repeat}` : ''))
  }
  return result
}

const errors: string[] = []
let links = 0
for (const [source, markdown] of documents) {
  const text = markdown.replace(/```[\s\S]*?```/g, '')
  for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const destination = match[1]
    if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(destination)) continue
    const [path, fragment] = destination.split('#')
    const target = path
      ? relative(root, resolve(dirname(source), decodeURIComponent(path)))
      : source
    links++
    if (!tracked.has(target) && ![...tracked].some((file) => file.startsWith(`${target}/`))) {
      errors.push(`${source}: untracked link ${destination}`)
    } else if (
      fragment &&
      documents.has(target) &&
      !anchors(documents.get(target)!).has(decodeURIComponent(fragment))
    ) {
      errors.push(`${source}: missing anchor ${destination}`)
    }
  }
}
const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
}
const documented = new Set<string>()
for (const text of documents.values()) {
  for (const match of text.matchAll(/\bnpm\s+(?:run\s+([\w:-]+)|(test))\b/g))
    documented.add(match[1] ?? match[2])
}
for (const name of documented) {
  if (!Object.hasOwn(scripts, name)) errors.push(`Unknown documented npm command: ${name}`)
}
for (const [name, command] of Object.entries(scripts)) {
  if (!documented.has(name)) errors.push(`Undocumented npm command: ${name}`)
  const runner = /^node\s+(scripts\/\S+)/.exec(command)?.[1]
  if (runner && !tracked.has(runner)) errors.push(`${name}: untracked runner ${runner}`)
}
for (const error of errors) console.error(error)
console.log(
  `Checked ${links} local links in ${documents.size} tracked Markdown files; ${Object.keys(scripts).length} npm commands`
)
if (errors.length) process.exit(1)
