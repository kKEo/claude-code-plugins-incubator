import { expect, test } from 'claude-code/testing'

function near(a: number | null | undefined, b: number, eps = 1e-9): boolean {
  return typeof a === 'number' && Math.abs(a - b) < eps
}

import type { RequestRow } from '../types'
import { MAX_ROWS, addRow, appendRow, applyLedger, emptyTotals, splitDelta } from './ledger'

function row(seq: number, over: Partial<RequestRow> = {}): RequestRow {
  return {
    seq,
    at: seq,
    durationMs: 1,
    turnId: 't',
    index: seq,
    kind: 'main',
    model: 'claude-opus-5-5',
    input: 100,
    output: 10,
    cacheRead: 0,
    cacheWrite: 0,
    estUsd: 0.001,
    ledgerUsd: null,
    isApprox: false,
    stopReason: 'end_turn',
    ...over,
  }
}

test('one finished request takes the whole ledger delta, exactly', async () => {
  const shares = splitDelta([row(1)], [1], 0.05)
  expect(shares).toEqual([{ seq: 1, usd: 0.05, isApprox: false }])
})

test('overlapping requests share the delta by estimate, marked approximate, summing exactly', async () => {
  const rows = [row(1, { estUsd: 0.003 }), row(2, { estUsd: 0.001 })]
  const shares = splitDelta(rows, [1, 2], 0.08)
  expect(shares.map(s => s.isApprox)).toEqual([true, true])
  expect(near(shares[0]?.usd, 0.06)).toBe(true)
  expect(near(shares[1]?.usd, 0.02)).toBe(true)
  expect(near(shares.reduce((a, s) => a + s.usd, 0), 0.08, 1e-15)).toBe(true)
})

test('without a price for every row the split falls back to tokens', async () => {
  const rows = [row(1, { estUsd: null, input: 300, output: 0 }), row(2, { input: 100, output: 0 })]
  const shares = splitDelta(rows, [1, 2], 0.04)
  expect(near(shares[0]?.usd, 0.03)).toBe(true)
  expect(near(shares[1]?.usd, 0.01)).toBe(true)
})

test('applying a reading updates rows, totals and the ledger; a lower total means a restart', async () => {
  let totals = addRow(emptyTotals(), row(1))
  const first = applyLedger([row(1)], totals, { lastUsd: 0.5, sessionUsd: 0.5, pending: [1] }, 0.52)
  expect(near(first.rows[0]?.ledgerUsd, 0.02)).toBe(true)
  expect(near(first.totals.ledgerUsd, 0.02)).toBe(true)
  expect(near(first.totals.byModel['claude-opus-5-5']?.ledgerUsd, 0.02)).toBe(true)
  expect(first.ledger).toEqual({ lastUsd: 0.52, sessionUsd: 0.52, pending: [] })
  expect(first.shares.map(s => s.seq)).toEqual([1])
  expect(first.unattributedUsd).toBe(0)
  const idle = applyLedger(first.rows, first.totals, first.ledger, 0.53)
  expect(idle.shares).toEqual([])
  expect(near(idle.unattributedUsd, 0.01)).toBe(true)

  totals = addRow(first.totals, row(2))
  const restarted = applyLedger([...first.rows, row(2)], totals, { ...first.ledger, pending: [2] }, 0.01)
  expect(near(restarted.rows[1]?.ledgerUsd, 0.01)).toBe(true)
})

test('totals keep counting past the row cap', async () => {
  let rows: RequestRow[] = []
  let totals = emptyTotals()
  for (let i = 1; i <= MAX_ROWS + 5; i++) {
    rows = appendRow(rows, row(i))
    totals = addRow(totals, row(i))
  }
  expect(rows.length).toBe(MAX_ROWS)
  expect(rows[0]?.seq).toBe(6)
  expect(totals.requests).toBe(MAX_ROWS + 5)
  expect(totals.input).toBe((MAX_ROWS + 5) * 100)
})
