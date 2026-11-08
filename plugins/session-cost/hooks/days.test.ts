import { expect, test } from 'claude-code/testing'

import type { RequestRow, SessionSummary } from '../types'
import { addOtherToDays, addRowToDays, addSharesToDays, backfillDays, dayKey, dayKeysBack, dayLabel, dayUsd, daysSince, summaryDays, sumDays } from './days'
import { addRow, appendRow, emptyTotals, MAX_ROWS } from './ledger'

/** Local noon of a day, so no time zone moves it to another date. */
const noon = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

function row(seq: number, at: number, over: Partial<RequestRow> = {}): RequestRow {
  return {
    seq, at, durationMs: 1, turnId: 't', index: seq, kind: 'main', model: 'claude-opus-5-5',
    input: 100, output: 10, cacheRead: 0, cacheWrite: 0, estUsd: 0.001, ledgerUsd: null, isApprox: false, stopReason: 'end_turn',
    ...over,
  }
}

test('day keys are local calendar days and sort as strings', async () => {
  expect(dayKey(noon(2026, 11, 8))).toBe('2026-11-08')
  expect(dayKey(noon(2026, 11, 7, 23))).toBe('2026-11-07')
  expect(dayKey(noon(2026, 11, 8, 0))).toBe('2026-11-08')
  expect(dayLabel('2026-11-08')).toBe('Sun 08 Nov')
  expect(dayKeysBack(noon(2026, 3, 2), 4)).toEqual(['2026-03-02', '2026-03-01', '2026-02-28', '2026-02-27'])
})

test('requests either side of midnight land on their own days, with their ledger shares', async () => {
  const late = row(1, noon(2026, 11, 7, 23))
  const early = row(2, noon(2026, 11, 8, 1))
  let days = addRowToDays(addRowToDays({}, late), early)
  days = addSharesToDays(days, [late, early], [{ seq: 1, usd: 0.03, isApprox: false }, { seq: 2, usd: 0.05, isApprox: false }], 0)
  days = addOtherToDays(days, noon(2026, 11, 8), 0.01)
  expect(days['2026-11-07']?.requests).toBe(1)
  expect(Math.abs(dayUsd(days['2026-11-07']!) - 0.03) < 1e-12).toBe(true)
  expect(Math.abs(dayUsd(days['2026-11-08']!) - 0.06) < 1e-12).toBe(true)
  expect(sumDays(days, ['2026-11-08', '2026-11-07']).requests).toBe(2)
  expect(Object.keys(daysSince(days, '2026-11-08'))).toEqual(['2026-11-08'])
})

test('backfill splits kept rows by day and puts rows past the cap on the earliest day', async () => {
  let rows: RequestRow[] = []
  let totals = emptyTotals()
  for (let i = 1; i <= MAX_ROWS + 10; i++) {
    const r = row(i, i <= 600 ? noon(2026, 11, 6) : noon(2026, 11, 7))
    rows = appendRow(rows, r)
    totals = addRow(totals, r)
  }
  const days = backfillDays(rows, totals, noon(2026, 11, 7))
  expect(days['2026-11-06']?.requests).toBe(600)
  expect(days['2026-11-07']?.requests).toBe(410)
  expect(Object.values(days).reduce((a, d) => a + d.input, 0)).toBe(totals.input)
})

test('a summary saved before days were kept counts whole on its last day', async () => {
  const old: SessionSummary = { startedAt: noon(2026, 11, 5), lastAt: noon(2026, 11, 6), ledgerUsd: 1.5, estUsd: 1.2, requests: 9, input: 1, output: 2, cacheRead: 3, cacheWrite: 4 }
  expect(Object.keys(summaryDays(old))).toEqual(['2026-11-06'])
  expect(summaryDays(old)['2026-11-06']?.ledgerUsd).toBe(1.5)
  const kept = { ...old, days: { '2026-11-05': { ...summaryDays(old)['2026-11-06']!, requests: 4 } } }
  expect(Object.keys(summaryDays(kept))).toEqual(['2026-11-05'])
})
