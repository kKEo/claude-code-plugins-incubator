import type { DayMap, DayTotals, RequestRow, SessionSummary, Totals } from '../types'
import type { Share } from './ledger'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function two(n: number): string {
  return String(n).padStart(2, '0')
}

/** The local calendar day of a time: `YYYY-MM-DD`, which sorts as a string. */
export function dayKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`
}

/** The local midnight a day key names. */
function dayStart(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** `2026-11-08` → `Sun 08 Nov`. */
export function dayLabel(key: string): string {
  const d = dayStart(key)
  return `${DAY_NAMES[d.getDay()]} ${two(d.getDate())} ${MONTH_NAMES[d.getMonth()]}`
}

/** Today and the `n - 1` calendar days before it, newest first. */
export function dayKeysBack(now: number, n: number): string[] {
  const keys: string[] = []
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  for (let i = 0; i < Math.max(0, n); i++) {
    keys.push(dayKey(d.getTime()))
    d.setDate(d.getDate() - 1)
  }
  return keys
}

export function emptyDay(): DayTotals {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0, estUsd: 0, ledgerUsd: 0, otherUsd: 0 }
}

/** What a day cost by the ledger: its requests' shares and the spend read that day outside any request. */
export function dayUsd(d: DayTotals): number {
  return d.ledgerUsd + d.otherUsd
}

function plus(a: DayTotals, b: Partial<DayTotals>): DayTotals {
  return {
    input: a.input + (b.input ?? 0),
    output: a.output + (b.output ?? 0),
    cacheRead: a.cacheRead + (b.cacheRead ?? 0),
    cacheWrite: a.cacheWrite + (b.cacheWrite ?? 0),
    requests: a.requests + (b.requests ?? 0),
    estUsd: a.estUsd + (b.estUsd ?? 0),
    ledgerUsd: a.ledgerUsd + (b.ledgerUsd ?? 0),
    otherUsd: a.otherUsd + (b.otherUsd ?? 0),
  }
}

function addTo(days: DayMap, key: string, add: Partial<DayTotals>): DayMap {
  return { ...days, [key]: plus(days[key] ?? emptyDay(), add) }
}

/** Counts a freshly recorded row (no ledger share yet) on the day its response ended. */
export function addRowToDays(days: DayMap, row: RequestRow): DayMap {
  return addTo(days, dayKey(row.at), {
    input: row.input,
    output: row.output,
    cacheRead: row.cacheRead,
    cacheWrite: row.cacheWrite,
    requests: 1,
    estUsd: row.estUsd ?? 0,
  })
}

/** Adds each ledger share to the day of the row that took it. */
export function addSharesToDays(days: DayMap, rows: readonly RequestRow[], shares: readonly Share[], fallbackAt: number): DayMap {
  let next = days
  for (const s of shares) {
    const at = rows.find(r => r.seq === s.seq)?.at ?? fallbackAt
    next = addTo(next, dayKey(at), { ledgerUsd: s.usd })
  }
  return next
}

/** Adds /cost growth no request took to the day it was read. */
export function addOtherToDays(days: DayMap, at: number, usd: number): DayMap {
  return usd === 0 ? days : addTo(days, dayKey(at), { otherUsd: usd })
}

/**
 * Rebuilds the day split of a session recorded before days were kept: the kept
 * rows by day, and what the totals hold beyond them (rows dropped past the cap)
 * on the earliest kept row's day.
 */
export function backfillDays(rows: readonly RequestRow[], totals: Totals, now: number): DayMap {
  let days: DayMap = {}
  for (const r of rows) {
    days = addRowToDays(days, r)
    if (r.ledgerUsd !== null) days = addTo(days, dayKey(r.at), { ledgerUsd: r.ledgerUsd })
  }
  const kept = Object.values(days).reduce(plus, emptyDay())
  const rest: Partial<DayTotals> = {
    input: totals.input - kept.input,
    output: totals.output - kept.output,
    cacheRead: totals.cacheRead - kept.cacheRead,
    cacheWrite: totals.cacheWrite - kept.cacheWrite,
    requests: totals.requests - kept.requests,
    estUsd: totals.estUsd - kept.estUsd,
    ledgerUsd: totals.ledgerUsd - kept.ledgerUsd,
  }
  const hasRest = Object.values(rest).some(v => Math.abs(v ?? 0) > 1e-9)
  if (hasRest) {
    const first = rows.reduce<number | undefined>((min, r) => (min === undefined || r.at < min ? r.at : min), undefined)
    days = addTo(days, dayKey(first ?? now), rest)
  }
  return days
}

/** A stored session's days; a summary saved before days were kept counts whole on its last day. */
export function summaryDays(s: SessionSummary): DayMap {
  if (s.days && Object.keys(s.days).length > 0) return s.days
  if (s.requests === 0) return {}
  return {
    [dayKey(s.lastAt)]: {
      input: s.input,
      output: s.output,
      cacheRead: s.cacheRead,
      cacheWrite: s.cacheWrite,
      requests: s.requests,
      estUsd: s.estUsd,
      ledgerUsd: s.ledgerUsd,
      otherUsd: 0,
    },
  }
}

/** The days of `days` among `keys`, summed. */
export function sumDays(days: DayMap, keys: readonly string[]): DayTotals {
  return keys.reduce((acc, k) => (days[k] ? plus(acc, days[k]) : acc), emptyDay())
}

/** Keeps the days from `oldest` on. */
export function daysSince(days: DayMap, oldest: string): DayMap {
  return Object.fromEntries(Object.entries(days).filter(([k]) => k >= oldest))
}
