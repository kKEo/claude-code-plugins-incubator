import { expect, test } from 'claude-code/testing'

import type { RequestRow } from '../types'
import { estimate, priceOf } from './pricing'
import { MAX_DURATIONS, addToStats, applySplitToStats, emptyStats, percentile, summarize } from './stats'

const MIN = 60 * 1000
const OPUS = priceOf('claude-opus-5-5')

function near(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps
}

let seq = 0
function row(over: Partial<RequestRow> = {}): RequestRow {
  const r: RequestRow = {
    seq: ++seq,
    at: 1_000_000,
    durationMs: 1000,
    turnId: 't',
    index: 0,
    kind: 'main',
    model: 'claude-opus-5-5',
    input: 1000,
    output: 500,
    cacheRead: 100_000,
    cacheWrite: 10_000,
    estUsd: null,
    ledgerUsd: null,
    isApprox: false,
    stopReason: 'end_turn',
    ...over,
  }
  return { ...r, estUsd: estimate(r.model, r) }
}

test('the cost parts add up to the request estimate, with 1h writes at 2× and their premium kept', async () => {
  const r = row({ cacheWrite1h: 6000 })
  const s = summarize(addToStats(emptyStats(), r, OPUS))
  expect(near(s.totalUsd, r.estUsd ?? -1)).toBe(true)
  expect(near(s.usd.write1h, (6000 * 8) / 1e6)).toBe(true)
  expect(near(s.usd.write5m, (4000 * 5) / 1e6)).toBe(true)
  expect(near(s.premium1hUsd, (6000 * 3) / 1e6)).toBe(true)
  expect([s.write1h, s.write5m, s.writeUnknown]).toEqual([6000, 4000, 0])
})

test('a row without a split counts its writes as unknown until the split arrives', async () => {
  const r = row()
  let st = addToStats(emptyStats(), r, OPUS)
  expect(summarize(st).writeUnknown).toBe(10_000)
  st = applySplitToStats(st, r, 10_000, OPUS)
  const s = summarize(st)
  expect([s.write1h, s.write5m, s.writeUnknown]).toEqual([10_000, 0, 0])
  expect(near(s.usd.writeUnknown, 0)).toBe(true)
  expect(near(s.totalUsd, estimate(r.model, { ...r, cacheWrite1h: 10_000 }) ?? -1)).toBe(true)
  expect(st.gaps.lastTtl).toBe('1h')
})

test('main-thread gaps are bucketed start to start and judged against the previous write’s TTL', async () => {
  let st = emptyStats()
  let at = 1_000_000
  const next = (gapMs: number, over: Partial<RequestRow>) => {
    at += gapMs
    st = addToStats(st, row({ at, durationMs: 0, ...over }), OPUS)
  }
  next(0, { cacheWrite1h: 10_000 })
  next(2 * MIN, { cacheWrite1h: 10_000 }) // under 5m
  next(20 * MIN, { cacheWrite1h: 0 }) // 5–60m after a 1h write: kept, now writes 5m
  next(30 * MIN, { cacheRead: 0, cacheWrite: 50_000, cacheWrite1h: 0 }) // 5–60m after a 5m write: expired, a miss
  next(90 * MIN, {}) // over 60m after a 5m write
  st = addToStats(st, row({ kind: 'subagent', at: at + 3 * MIN }), OPUS) // subagents never count
  const g = st.gaps
  expect([g.under5m, g.to60m, g.over60m]).toEqual([1, 2, 1])
  expect([g.kept1h, g.expired5m, g.missesSeen]).toEqual([1, 2, 1])
  expect(near(g.savedUsd, (100_000 * (5 - 0.2)) / 1e6)).toBe(true)
})

test('durations keep the newest ones and give nearest-rank percentiles', async () => {
  expect(percentile([], 50)).toBe(0)
  expect(percentile([5, 1, 3, 2, 4], 50)).toBe(3)
  expect(percentile([5, 1, 3, 2, 4], 90)).toBe(5)
  let st = emptyStats()
  for (let i = 1; i <= MAX_DURATIONS + 10; i++) st = addToStats(st, row({ durationMs: i, kind: 'subagent' }), OPUS)
  expect(st.durationsMs.length).toBe(MAX_DURATIONS)
  expect(summarize(st).maxMs).toBe(MAX_DURATIONS + 10)
})

test('tools and models are ranked, and an unpriced model adds no cost', async () => {
  let st = emptyStats()
  st = addToStats(st, row({ tools: ['Read', 'Bash', 'Read'] }), OPUS)
  st = addToStats(st, row({ tools: ['Edit'], model: 'mystery' }), priceOf('mystery'))
  const s = summarize(st)
  expect(s.topTools).toEqual([['Read', 2], ['Bash', 1], ['Edit', 1]])
  expect(s.topModels[0]?.[0]).toBe('claude-opus-5-5')
  expect(s.requests).toBe(2)
})
