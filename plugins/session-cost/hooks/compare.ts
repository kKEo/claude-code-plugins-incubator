import type { RollupBucket, SessionRollup, SessionSummary } from '../types'
import { count, duration, percent, shortModel, usd } from './format'
import { cacheHit, tokenSum } from './ledger'
import { emptyBucket } from './rollup'

/** How a metric is written: dollars, a count, a request time, a wall-clock span, or a 0..1 rate. */
export type Unit = 'usd' | 'count' | 'ms' | 'span' | 'rate'

/** One row of the Compare view; a side is null where its session kept no such figure (n/a). */
export type Metric = {
  id: string
  label: string
  a: number | null
  b: number | null
  unit: Unit
  /** Which way is better for B: fewer dollars, tokens and seconds, but a higher cache hit rate. */
  better: 'lower' | 'higher'
}

export type Section = {
  title: string
  metrics: Metric[]
  /** Which side lacks the breakdown, when one does: it was saved before rollups were kept. */
  missing?: 'A' | 'B' | 'A and B'
}

/** B against A: its change written in the metric's unit, the change as a share of A, and whether it is better. */
export type Delta = { text: string; pct: string; tone: 'better' | 'worse' | 'same' | null }

const EPS = 1e-9

/** `10m 00s`, `1h 02m`, `45.0s`: a wall-clock span. */
export function span(ms: number): string {
  if (ms < 60_000) return duration(ms)
  const s = Math.round(ms / 1000)
  const two = (n: number) => String(n).padStart(2, '0')
  if (s < 3600) return `${Math.floor(s / 60)}m ${two(s % 60)}s`
  return `${Math.floor(s / 3600)}h ${two(Math.floor((s % 3600) / 60))}m`
}

export function cell(x: number | null, unit: Unit): string {
  if (x === null) return 'n/a'
  switch (unit) {
    case 'usd':
      return usd(x)
    case 'count':
      return count(x)
    case 'ms':
      return duration(x)
    case 'span':
      return span(x)
    case 'rate':
      return percent(x)
  }
}

export function delta(m: Metric): Delta {
  if (m.a === null || m.b === null) return { text: 'n/a', pct: 'n/a', tone: null }
  const d = m.b - m.a
  if (Math.abs(d) < EPS) return { text: m.unit === 'rate' ? '0pp' : cell(0, m.unit), pct: '0%', tone: 'same' }
  const sign = d > 0 ? '+' : '-'
  const text = m.unit === 'rate' ? `${sign}${Math.round(Math.abs(d) * 100)}pp` : `${sign}${cell(Math.abs(d), m.unit)}`
  const pct = Math.abs(m.a) < EPS ? '—' : `${sign}${Math.round(Math.abs(d / m.a) * 100)}%`
  const isBetter = m.better === 'lower' ? d < 0 : d > 0
  return { text, pct, tone: isBetter ? 'better' : 'worse' }
}

function lower(id: string, label: string, a: number | null, b: number | null, unit: Unit): Metric {
  return { id, label, a, b, unit, better: 'lower' }
}

/** Requests, tokens and cost of one slice on both sides, a side without a rollup n/a. */
function slice(id: string, label: string, a: RollupBucket | null, b: RollupBucket | null): Metric[] {
  return [
    lower(`${id}:requests`, `${label} req`, a && a.requests, b && b.requests, 'count'),
    lower(`${id}:tokens`, `${label} tok`, a && tokenSum(a), b && tokenSum(b), 'count'),
    lower(`${id}:usd`, `${label} $`, a && a.ledgerUsd, b && b.ledgerUsd, 'usd'),
  ]
}

function plus(x: RollupBucket, y: RollupBucket): RollupBucket {
  return {
    input: x.input + y.input,
    output: x.output + y.output,
    cacheRead: x.cacheRead + y.cacheRead,
    cacheWrite: x.cacheWrite + y.cacheWrite,
    requests: x.requests + y.requests,
    estUsd: x.estUsd + y.estUsd,
    ledgerUsd: x.ledgerUsd + y.ledgerUsd,
    durationMs: x.durationMs + y.durationMs,
  }
}

/** A session's subagents summed by type. */
export function byAgentType(r: SessionRollup): Record<string, RollupBucket> {
  const out: Record<string, RollupBucket> = {}
  for (const a of Object.values(r.byAgent)) out[a.type] = plus(out[a.type] ?? emptyBucket(), a)
  return out
}

/** The keys either side has, the larger spend first. */
function keysOf(a: Record<string, RollupBucket> | null, b: Record<string, RollupBucket> | null): string[] {
  const spend = (k: string) => (a?.[k]?.ledgerUsd ?? 0) + (b?.[k]?.ledgerUsd ?? 0) + (a?.[k]?.estUsd ?? 0) + (b?.[k]?.estUsd ?? 0)
  return [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].sort((x, y) => spend(y) - spend(x) || x.localeCompare(y))
}

/** Every metric of the Compare view, A the baseline. */
export function compareSessions(a: SessionSummary, b: SessionSummary): Section[] {
  const ra = a.rollup ?? null
  const rb = b.rollup ?? null
  const missing = ra === null && rb === null ? 'A and B' : ra === null ? 'A' : rb === null ? 'B' : undefined
  const withMissing = (s: Section): Section => (missing === undefined ? s : { ...s, missing })
  const totals: Section = {
    title: 'Totals',
    metrics: [
      lower('cost', '/cost', a.ledgerUsd, b.ledgerUsd, 'usd'),
      lower('est', 'estimate', a.estUsd, b.estUsd, 'usd'),
      lower('requests', 'requests', a.requests, b.requests, 'count'),
      lower('input', 'tokens in', a.input, b.input, 'count'),
      lower('output', 'tokens out', a.output, b.output, 'count'),
      lower('cacheRead', 'cache read', a.cacheRead, b.cacheRead, 'count'),
      lower('cacheWrite', 'cache write', a.cacheWrite, b.cacheWrite, 'count'),
      { id: 'cacheHit', label: 'cache hit rate', a: cacheHit(a), b: cacheHit(b), unit: 'rate', better: 'higher' },
      lower('wall', 'wall clock', ra && ra.lastAt - ra.firstAt, rb && rb.lastAt - rb.firstAt, 'span'),
      lower('reqTime', 'request time', ra && ra.durationMs, rb && rb.durationMs, 'ms'),
    ],
  }
  const kinds = [
    ['main', 'main'],
    ['subagent', 'sub'],
    ['compact', 'compact'],
  ] as const
  const byKind = withMissing({
    title: 'By kind',
    metrics: kinds.flatMap(([k, label]) => slice(`kind:${k}`, label, ra && ra.byKind[k], rb && rb.byKind[k])),
  })
  const ma = ra && ra.byModel
  const mb = rb && rb.byModel
  const byModel = withMissing({
    title: 'By model',
    metrics: keysOf(ma, mb).flatMap(m => slice(`model:${m}`, shortModel(m), ma && (ma[m] ?? emptyBucket()), mb && (mb[m] ?? emptyBucket()))),
  })
  const ta = ra && byAgentType(ra)
  const tb = rb && byAgentType(rb)
  const byAgent = withMissing({
    title: 'By subagent',
    metrics: keysOf(ta, tb).flatMap(t => slice(`agent:${t}`, `sub:${t}`, ta && (ta[t] ?? emptyBucket()), tb && (tb[t] ?? emptyBucket()))),
  })
  return [totals, byKind, byModel, byAgent]
}

/** Splits command arguments on spaces, keeping a "quoted name" whole. */
export function splitArgs(text: string): string[] {
  const out: string[] = []
  for (const m of text.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3] ?? '')
  return out
}

/**
 * Finds the session a word names: its id, a unique id prefix, its name, or a unique
 * part of its name, ignoring case. Answers its id, or why none was found.
 */
export function resolveSession(sessions: ReadonlyArray<{ id: string; name?: string }>, query: string): { id: string } | { error: string } {
  const q = query.trim().toLowerCase()
  if (q === '') return { error: 'an empty session name' }
  const pick = (found: ReadonlyArray<{ id: string }>): { id: string } | { error: string } | undefined => {
    const [first] = found
    if (found.length === 1 && first) return { id: first.id }
    if (found.length > 1) return { error: `"${query}" matches ${found.length} sessions (${found.slice(0, 3).map(s => s.id.slice(0, 8)).join(', ')}${found.length > 3 ? ', …' : ''}); give more of its id` }
    return undefined
  }
  return (
    pick(sessions.filter(s => s.id.toLowerCase() === q)) ??
    pick(sessions.filter(s => s.id.toLowerCase().startsWith(q))) ??
    pick(sessions.filter(s => s.name?.toLowerCase() === q)) ??
    pick(sessions.filter(s => s.name?.toLowerCase().includes(q))) ?? { error: `no saved session matches "${query}"` }
  )
}
