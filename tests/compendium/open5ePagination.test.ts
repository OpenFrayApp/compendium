// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it, vi } from 'vitest'
import { fetchOpen5ePages } from '../../src/compendium/open5ePagination.ts'

const initial = 'https://api.open5e.com/v2/spells/?format=json&document__key=test&limit=100'
const path = '/v2/spells/'
const filter = { parameter: 'document__key', value: 'test' }

it('keeps page order and restores JSON and an omitted required document filter', async () => {
  const fetchJson = vi
    .fn()
    .mockResolvedValueOnce({ count: 2, next: '/v2/spells/?page=2', results: ['first'] })
    .mockResolvedValueOnce({ count: 2, next: null, results: ['second'] })
  expect(await fetchOpen5ePages(initial, path, fetchJson, filter)).toEqual(['first', 'second'])
  expect(fetchJson.mock.calls[0][0]).toBe(initial)
  expect(fetchJson.mock.calls[1][0]).toBe(
    'https://api.open5e.com/v2/spells/?page=2&format=json&document__key=test'
  )
})

it('allows unfiltered metadata endpoints and complete empty pages', async () => {
  const fetchJson = vi.fn().mockResolvedValue({ count: 0, next: null, results: [] })
  expect(
    await fetchOpen5ePages('https://api.open5e.com/v2/documents/', '/v2/documents/', fetchJson)
  ).toEqual([])
  expect(fetchJson.mock.calls[0][0]).toBe('https://api.open5e.com/v2/documents/?format=json')
})

it.each([
  'https://example.com/v2/spells/',
  'http://api.open5e.com/v2/spells/',
  'https://api.open5e.com:8443/v2/spells/',
  '/v2/creatures/',
  '/v1/spells/',
  'https://user@api.open5e.com/v2/spells/',
  'https://user:secret@api.open5e.com/v2/spells/',
  '/v2/spells/#fragment'
])('rejects unsafe continuation URL %s before fetching it', async (next) => {
  const fetchJson = vi.fn().mockResolvedValue({ count: 2, next, results: ['first'] })
  await expect(fetchOpen5ePages(initial, path, fetchJson, filter)).rejects.toThrow(
    'Unexpected pagination URL'
  )
  expect(fetchJson).toHaveBeenCalledTimes(1)
})

it('checks the initial URL before calling the injected fetcher', async () => {
  const fetchJson = vi.fn()
  await expect(fetchOpen5ePages('https://example.com/v2/spells/', path, fetchJson)).rejects.toThrow(
    'Unexpected pagination URL'
  )
  expect(fetchJson).not.toHaveBeenCalled()
})

it.each(['document__key', 'document__slug'])(
  'rejects an explicitly changed %s filter',
  async (parameter) => {
    const fetchJson = vi.fn().mockResolvedValue({
      count: 2,
      next: `/v2/spells/?${parameter}=other&page=2`,
      results: ['first']
    })
    await expect(
      fetchOpen5ePages(initial, path, fetchJson, { parameter, value: 'test' })
    ).rejects.toThrow('Document filter changed')
    expect(fetchJson).toHaveBeenCalledTimes(1)
  }
)

it.each([
  'document__key=',
  'document__key=test&document__key=other',
  'document__key=test&document__key='
])('rejects changed explicit filter values in %s before fetching', async (query) => {
  const fetchJson = vi.fn()
  await expect(
    fetchOpen5ePages(`https://api.open5e.com/v2/spells/?${query}`, path, fetchJson, filter)
  ).rejects.toThrow('Document filter changed')
  expect(fetchJson).not.toHaveBeenCalled()
})

it('detects cycles after restoring JSON and source filters', async () => {
  const fetchJson = vi
    .fn()
    .mockResolvedValue({ count: 2, next: '/v2/spells/?limit=100', results: ['first'] })
  const url = 'https://api.open5e.com/v2/spells/?limit=100&format=json&document__key=test'
  await expect(fetchOpen5ePages(url, path, fetchJson, filter)).rejects.toThrow('Pagination cycle')
  expect(fetchJson).toHaveBeenCalledTimes(1)
})

it.each([
  null,
  {},
  { count: -1, next: null, results: [] },
  { count: 1.5, next: null, results: [] },
  { count: '1', next: null, results: [] },
  { count: 1, next: null, results: 'bad' },
  { count: 1, results: ['first'] },
  { count: 1, next: 2, results: ['first'] }
])('rejects invalid response shape %j', async (page) => {
  await expect(fetchOpen5ePages(initial, path, async () => page)).rejects.toThrow(
    'Invalid Open5e page'
  )
})

it.each([
  { count: 0, next: null, results: ['first'] },
  { count: 1, next: '/v2/spells/?page=2', results: [] }
])('rejects excess records or stalled progress %j', async (page) => {
  await expect(fetchOpen5ePages(initial, path, async () => page)).rejects.toThrow(
    'Invalid pagination progress'
  )
})

it.each(['', ' ', '\t\n', '\u00a0'])(
  'rejects blank continuation %j as invalid page shape before another fetch',
  async (next) => {
    const fetchJson = vi.fn().mockResolvedValue({ count: 1, next, results: ['first'] })
    await expect(fetchOpen5ePages(initial, path, fetchJson, filter)).rejects.toThrow(
      'Invalid Open5e page'
    )
    expect(fetchJson).toHaveBeenCalledTimes(1)
  }
)

it('rejects incomplete snapshots', async () => {
  await expect(
    fetchOpen5ePages(initial, path, async () => ({ count: 2, next: null, results: ['first'] }))
  ).rejects.toThrow('Incomplete snapshot: got 1 of 2')
})

it('rejects count drift between pages', async () => {
  const fetchJson = vi
    .fn()
    .mockResolvedValueOnce({ count: 2, next: '/v2/spells/?page=2', results: ['first'] })
    .mockResolvedValueOnce({ count: 3, next: null, results: ['second'] })
  await expect(fetchOpen5ePages(initial, path, fetchJson)).rejects.toThrow('Count changed')
})
