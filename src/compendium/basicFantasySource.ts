// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { parse, type DefaultTreeAdapterMap } from 'parse5'

type Node = DefaultTreeAdapterMap['node']
type Element = DefaultTreeAdapterMap['element']

export interface BasicFantasyEntry {
  anchor: string
  heading: string
  names: string[]
  tables: string[][][]
  paragraphs: string[]
}

/** Read an HTML attribute without depending on serialized attribute order. */
function attribute(node: Element, name: string): string | undefined {
  return node.attrs.find((attr) => attr.name === name)?.value
}

/** Collect visible text while excluding scripts, navigation icons, and styles. */
function text(node: Node): string {
  if (node.nodeName === '#text')
    return (node as DefaultTreeAdapterMap['textNode']).value
  if ('tagName' in node && ['script', 'style'].includes(node.tagName)) return ''
  if ('tagName' in node && attribute(node, 'class')?.includes('anchorjs-link'))
    return ''
  return 'childNodes' in node
    ? node.childNodes.map(text).join(' ').replace(/\s+/g, ' ').trim()
    : ''
}

/** Find matching descendants in document order. */
function descendants(
  node: Node,
  predicate: (element: Element) => boolean,
  excludeTaggedChildren = false,
): Element[] {
  const result: Element[] = []
  if ('tagName' in node && predicate(node)) result.push(node)
  if ('childNodes' in node)
    for (const child of node.childNodes) {
      if (
        excludeTaggedChildren &&
        'tagName' in child &&
        attribute(child, 'data-tag') !== undefined
      )
        continue
      result.push(...descendants(child, predicate, excludeTaggedChildren))
    }
  return result
}

/** Extract each tagged creature section, retaining every variant column and source value. */
export function extractBasicFantasy(html: string): BasicFantasyEntry[] {
  const document = parse(html)
  return descendants(
    document,
    (element) => attribute(element, 'data-tag') !== undefined,
  ).map((element) => {
    const heading = descendants(
      element,
      (node) => /^h[23]$/.test(node.tagName),
      true,
    )[0]
    if (!heading)
      throw new Error(`Missing heading for ${attribute(element, 'id')}`)
    const names = element.attrs
      .filter((attr) => /^data-tag\d*$/.test(attr.name))
      .map((attr) => attr.value.replace(/\*/g, '').trim())
    return {
      anchor:
        attribute(heading, 'data-anchor-id') ?? attribute(element, 'id') ?? '',
      heading: text(heading).replace(/\*/g, '').trim(),
      names,
      tables: descendants(
        element,
        (node) => node.tagName === 'table',
        true,
      ).map((table) =>
        descendants(table, (node) => node.tagName === 'tr').map((row) =>
          descendants(row, (node) => ['th', 'td'].includes(node.tagName)).map(
            text,
          ),
        ),
      ),
      paragraphs: descendants(
        element,
        (node) => node.tagName === 'p',
        true,
      ).map(text),
    }
  })
}

export interface BasicFantasyVariant {
  key: string
  anchor: string
  name: string
  stats: Record<string, string>
}

/** Enumerate stat-block columns using table headers over incomplete or incorrect filter tags. */
export function basicFantasyVariants(
  entries: BasicFantasyEntry[],
): BasicFantasyVariant[] {
  return entries.flatMap((entry) => {
    const table = entry.tables.find((rows) =>
      rows.some((row) => row[0]?.startsWith('Armor Class:')),
    )
    if (!table)
      return [
        {
          key: `${entry.anchor}:overview`,
          anchor: entry.anchor,
          name: entry.heading,
          stats: {},
        },
      ]
    const headers = table[0][0] === '' ? table[0].slice(1) : []
    const columns = Math.max(...table.map((row) => row.length)) - 1
    return Array.from({ length: columns }, (_, index) => {
      let name = (
        headers[index] || entry.names[Math.min(index, entry.names.length - 1)]
      )
        .replace(/\*/g, '')
        .trim()
      if (entry.anchor === 'elemental-cold')
        name = name.replace('Earth', 'Cold')
      if (entry.anchor === 'elemental-wood')
        name = name.replace('Earth', 'Wood').replace('Water', 'Wood')
      if (entry.heading === 'Owlbear') name = 'Owlbear'
      return {
        key: `${entry.heading === 'Owlbear' ? 'owlbear' : entry.anchor}:${index + 1}`,
        anchor: entry.anchor,
        name,
        stats: Object.fromEntries(
          table
            .filter((row) => row[0])
            .map((row) => [row[0], row[index + 1] ?? '']),
        ),
      }
    })
  })
}

/** Normalize headings for candidate lookup without erasing meaningful variant names. */
export function normalizeCreatureName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\*/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
