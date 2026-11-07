import { expect, test } from 'claude-code/testing'

function near(a: number | null | undefined, b: number, eps = 1e-9): boolean {
  return typeof a === 'number' && Math.abs(a - b) < eps
}

import { estimate, normalizeModel, priceOf } from './pricing'
import { count, shortModel, usd } from './format'

test('model ids are matched after stripping provider prefixes, dates and the context tag', async () => {
  expect(normalizeModel('us.anthropic.claude-opus-5-5-20260101-v1:0')).toBe('claude-opus-5-5')
  expect(normalizeModel('claude-sonnet-5-5[1m]')).toBe('claude-sonnet-5-5')
  expect(normalizeModel('claude-opus-4-5@20251101')).toBe('claude-opus-4-5')
  expect(shortModel('claude-haiku-5-5-20260301')).toBe('haiku-5-5')
})

test('the longest prefix wins and cache prices fall back to the usual ratios', async () => {
  expect(priceOf('claude-opus-5-5')?.input).toBe(4)
  expect(priceOf('claude-opus-5-5')?.cacheRead).toBe(0.2)
  expect(priceOf('claude-opus-5')?.input).toBe(5)
  expect(near(priceOf('claude-opus-5')?.cacheRead, 0.5)).toBe(true)
  expect(near(priceOf('claude-opus-5')?.cacheWrite, 6.25)).toBe(true)
  expect(priceOf('gpt-something')).toBe(null)
})

test('an estimate sums the four buckets at their prices', async () => {
  // Opus 5.5: 1M in = $4, 100k out = $2, 1M cache read = $0.20, 100k cache write = $0.50
  const usdEst = estimate('claude-opus-5-5', { input: 1_000_000, output: 100_000, cacheRead: 1_000_000, cacheWrite: 100_000 })
  expect(near(usdEst, 6.7)).toBe(true)
  expect(estimate('mystery-model', { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 })).toBe(null)
})

test('numbers and dollars are compact', async () => {
  expect(count(950)).toBe('950')
  expect(count(1234)).toBe('1.2k')
  expect(count(3_400_000)).toBe('3.4M')
  expect(usd(0.00312)).toBe('$0.0031')
  expect(usd(1.2345)).toBe('$1.234')
  expect(usd(null)).toBe('?')
})
