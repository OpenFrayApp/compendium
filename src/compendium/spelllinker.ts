// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

/** Escape a string for literal use inside a RegExp. */
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Build a function that wraps cast-spell names in creature prose as
 * `[Name](spell:ref)` links, so the app can hover-preview them. Linking is scoped
 * to a cast clause ("casts X, Y, or Z") so spell-named common words elsewhere (a
 * held "Shield", a dragon's "Fly Speed") are left alone. Source-agnostic text
 * utility — no dependency on any particular data feed.
 */
export function makeSpellLinker(
  spells: { name: string; ref: string }[],
): (text: string) => string {
  const refByLower = new Map(spells.map((s) => [s.name.toLowerCase(), s.ref]))
  // Longest names first so the alternation prefers "Mirror Image" over "Image".
  const names = [...new Set(spells.map((s) => s.name))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
  if (names.length === 0) return (text) => text
  const spellAlt = `(?:${names.join('|')})`
  const det = `(?:the\\s+|an?\\s+)?` // an optional article before a spell ("casts the Mirror Image")
  // A cast verb, the first spell, then any spells chained on with ","/"or"/"and".
  const clauseRe = new RegExp(
    `\\b(?:casts?|casting)\\b\\s+${det}${spellAlt}\\b` +
      `(?:[,\\s]+(?:(?:or|and)\\s+)?${det}${spellAlt}\\b)*`,
    'gi',
  )
  const nameRe = new RegExp(`\\b${spellAlt}\\b`, 'gi')
  /** Wrap one matched name as [Name](spell:ref); names without a known ref pass through. */
  const linkName = (m: string) => {
    const ref = refByLower.get(m.toLowerCase())
    return ref ? `[${m}](spell:${ref})` : m
  }
  return (text) => {
    if (!text || !/\bcast(?:s|ing)?\b/i.test(text)) return text
    // Link spell names only within the cast clause, leaving the rest of the prose
    // (and any spell-named common words it contains) untouched.
    return text.replace(clauseRe, (clause) => clause.replace(nameRe, linkName))
  }
}
