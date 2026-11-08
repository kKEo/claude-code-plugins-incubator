import type { Ledger, RequestRow, Tokens, Totals } from '../types'

/** Rows kept in state; totals keep counting past this. */
export const MAX_ROWS = 1000

export const EMPTY_LEDGER: Ledger = { lastUsd: 0, sessionUsd: 0, pending: [] }

export function emptyTotals(): Totals {
  return {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    requests: 0,
    byKind: { main: 0, subagent: 0, compact: 0 },
    estUsd: 0,
    ledgerUsd: 0,
    hasUnpriced: false,
    byModel: {},
  }
}

export function tokenSum(t: Tokens): number {
  return t.input + t.output + t.cacheRead + t.cacheWrite
}

/** Share of prompt tokens served from the cache, 0..1. */
export function cacheHit(t: Tokens): number {
  const prompt = t.input + t.cacheRead + t.cacheWrite
  return prompt === 0 ? 0 : t.cacheRead / prompt
}

/** Adds a freshly recorded row (no ledger share yet) to the totals. */
export function addRow(totals: Totals, row: RequestRow): Totals {
  const m = totals.byModel[row.model] ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0, estUsd: 0, ledgerUsd: 0 }
  return {
    input: totals.input + row.input,
    output: totals.output + row.output,
    cacheRead: totals.cacheRead + row.cacheRead,
    cacheWrite: totals.cacheWrite + row.cacheWrite,
    requests: totals.requests + 1,
    byKind: { ...totals.byKind, [row.kind]: totals.byKind[row.kind] + 1 },
    estUsd: totals.estUsd + (row.estUsd ?? 0),
    ledgerUsd: totals.ledgerUsd,
    hasUnpriced: totals.hasUnpriced || (row.estUsd === null && tokenSum(row) > 0),
    byModel: {
      ...totals.byModel,
      [row.model]: {
        input: m.input + row.input,
        output: m.output + row.output,
        cacheRead: m.cacheRead + row.cacheRead,
        cacheWrite: m.cacheWrite + row.cacheWrite,
        requests: m.requests + 1,
        estUsd: m.estUsd + (row.estUsd ?? 0),
        ledgerUsd: m.ledgerUsd,
      },
    },
  }
}

/** Appends a row, dropping the oldest past MAX_ROWS. */
export function appendRow(rows: readonly RequestRow[], row: RequestRow): RequestRow[] {
  const next = [...rows, row]
  return next.length > MAX_ROWS ? next.slice(next.length - MAX_ROWS) : next
}

export type Share = { seq: number; usd: number; isApprox: boolean }

/**
 * Splits a ledger delta across the requests that finished since the last read.
 * One request takes it whole; several share it by estimated cost, else by tokens,
 * else evenly, and are marked approximate. The shares always sum to `delta`.
 */
export function splitDelta(rows: readonly RequestRow[], pending: readonly number[], delta: number): Share[] {
  const batch = pending.map(seq => rows.find(r => r.seq === seq)).filter((r): r is RequestRow => r !== undefined)
  if (batch.length === 0) return []
  const [first] = batch
  if (batch.length === 1 && first) return [{ seq: first.seq, usd: delta, isApprox: false }]
  const byEst = batch.every(r => r.estUsd !== null) ? batch.map(r => r.estUsd as number) : null
  const byTokens = batch.map(tokenSum)
  const weights = byEst && sum(byEst) > 0 ? byEst : sum(byTokens) > 0 ? byTokens : batch.map(() => 1)
  const total = sum(weights)
  const shares = batch.map((r, i) => ({ seq: r.seq, usd: (delta * (weights[i] ?? 0)) / total, isApprox: true }))
  // Put the rounding remainder on the last share so the sum is exact.
  const last = shares[shares.length - 1]
  if (last) last.usd += delta - sum(shares.map(s => s.usd))
  return shares
}

/**
 * Applies a ledger reading: the delta since `lastUsd` is split across the pending
 * rows. A total below the last reading means the ledger restarted (a /clear):
 * the whole new total is the delta.
 */
export function applyLedger(
  rows: readonly RequestRow[],
  totals: Totals,
  ledger: Ledger,
  usd: number,
): { rows: RequestRow[]; totals: Totals; ledger: Ledger; shares: Share[]; unattributedUsd: number } {
  const delta = usd >= ledger.lastUsd ? usd - ledger.lastUsd : usd
  const shares = splitDelta(rows, ledger.pending, delta)
  if (shares.length === 0) {
    // Nothing to attribute: spend outside any request we saw stays in the header total.
    return { rows: [...rows], totals, ledger: { lastUsd: usd, sessionUsd: usd, pending: [] }, shares, unattributedUsd: delta }
  }
  const bySeq = new Map(shares.map(s => [s.seq, s]))
  const byModel = { ...totals.byModel }
  const nextRows = rows.map(r => {
    const s = bySeq.get(r.seq)
    if (!s) return r
    const m = byModel[r.model]
    if (m) byModel[r.model] = { ...m, ledgerUsd: m.ledgerUsd + s.usd }
    return { ...r, ledgerUsd: (r.ledgerUsd ?? 0) + s.usd, isApprox: r.isApprox || s.isApprox }
  })
  return {
    rows: nextRows,
    totals: { ...totals, ledgerUsd: totals.ledgerUsd + sum(shares.map(s => s.usd)), byModel },
    ledger: { lastUsd: usd, sessionUsd: usd, pending: [] },
    shares,
    unattributedUsd: 0,
  }
}

function sum(xs: readonly number[]): number {
  return xs.reduce((a, b) => a + b, 0)
}
