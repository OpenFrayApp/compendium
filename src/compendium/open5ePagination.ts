// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

export type JsonFetcher = (url: string) => Promise<unknown>
const API = 'https://api.open5e.com/v2/'

/** Read complete API pages while rejecting count drift, foreign URLs, and pagination cycles. */
export async function fetchOpen5ePages<T>(
  initial: string,
  path: string,
  fetchJson: JsonFetcher,
  documentFilter?: { parameter: string; value: string },
  incompletePrefix = 'Incomplete snapshot: got'
): Promise<T[]> {
  let next: string | null = initial
  let count: number | undefined
  const seen = new Set<string>()
  const results: T[] = []
  while (next) {
    const url = new URL(next, API)
    if (
      url.origin !== new URL(API).origin ||
      url.pathname !== path ||
      url.username ||
      url.password ||
      url.hash
    ) {
      throw new Error('Unexpected pagination URL')
    }
    url.searchParams.set('format', 'json')
    if (documentFilter) {
      const filters = url.searchParams.getAll(documentFilter.parameter)
      if (filters.some((filter) => filter !== documentFilter.value))
        throw new Error('Document filter changed during pagination')
      url.searchParams.set(documentFilter.parameter, documentFilter.value)
    }
    if (seen.has(url.href)) throw new Error('Pagination cycle')
    seen.add(url.href)
    const page = (await fetchJson(url.href)) as {
      count: number
      next: string | null
      results: T[]
    }
    if (
      !page ||
      !Number.isInteger(page.count) ||
      page.count < 0 ||
      !Array.isArray(page.results) ||
      !(page.next === null || typeof page.next === 'string')
    )
      throw new Error('Invalid Open5e page')
    if (count !== undefined && count !== page.count)
      throw new Error('Count changed during pagination')
    count = page.count
    results.push(...page.results)
    if (results.length > count || (page.next && !page.results.length))
      throw new Error('Invalid pagination progress')
    next = page.next
  }
  if (results.length !== count) throw new Error(`${incompletePrefix} ${results.length} of ${count}`)
  return results
}
