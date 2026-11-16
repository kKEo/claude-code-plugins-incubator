import type { CostParts, KindStats, RequestKind, RequestRow, SessionStats } from '../types'
import type { Price } from './pricing'

/** Durations kept for percentiles; older ones drop off. */
export const MAX_DURATIONS = 2000
const FIVE_MIN = 5 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000
/** A request after a long gap that read less than this share of its prompt from the cache counts as a miss. */
const MISS_SHARE = 0.1

function emptyParts(): CostParts {
  return { input: 0, output: 0, read: 0, write5m: 0, write1h: 0, writeUnknown: 0 }
}

function emptyKind(): KindStats {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0, write1h: 0, write5m: 0, writeUnknown: 0, usd: emptyParts() }
}

export function emptyStats(): SessionStats {
  return {
    byKind: { main: emptyKind(), subagent: emptyKind(), compact: emptyKind() },
    premium1hUsd: 0,
    gaps: { under5m: 0, to60m: 0, over60m: 0, kept1h: 0, expired5m: 0, savedUsd: 0, missesSeen: 0 },
    durationsMs: [],
    byModel: {},
    tools: {},
  }
}

/** A row's cache write split three ways; unknown when the row carries no split. */
function writes(row: RequestRow): { w1h: number; w5m: number; unknown: number } {
  if (row.cacheWrite1h === undefined) return { w1h: 0, w5m: 0, unknown: row.cacheWrite }
  const w1h = Math.max(0, Math.min(row.cacheWrite1h, row.cacheWrite))
  return { w1h, w5m: row.cacheWrite - w1h, unknown: 0 }
}

/** Which TTL a row's write used; undefined when it wrote nothing or the split is unknown. */
function ttlOf(row: RequestRow): '1h' | '5m' | undefined {
  if (row.cacheWrite === 0 || row.cacheWrite1h === undefined) return undefined
  return row.cacheWrite1h > 0 ? '1h' : '5m'
}

const M = 1_000_000

/** Adds one recorded request to the profile. `price` is null for a model the table does not know. */
export function addToStats(stats: SessionStats, row: RequestRow, price: Price | null): SessionStats {
  const k = stats.byKind[row.kind] ?? emptyKind()
  const w = writes(row)
  const usd = price
    ? {
        input: k.usd.input + (row.input * price.input) / M,
        output: k.usd.output + (row.output * price.output) / M,
        read: k.usd.read + (row.cacheRead * price.cacheRead) / M,
        write5m: k.usd.write5m + (w.w5m * price.cacheWrite) / M,
        write1h: k.usd.write1h + (w.w1h * price.cacheWrite1h) / M,
        writeUnknown: k.usd.writeUnknown + (w.unknown * price.cacheWrite) / M,
      }
    : k.usd
  const kind: KindStats = {
    input: k.input + row.input,
    output: k.output + row.output,
    cacheRead: k.cacheRead + row.cacheRead,
    cacheWrite: k.cacheWrite + row.cacheWrite,
    requests: k.requests + 1,
    write1h: k.write1h + w.w1h,
    write5m: k.write5m + w.w5m,
    writeUnknown: k.writeUnknown + w.unknown,
    usd,
  }
  const model = stats.byModel[row.model] ?? { requests: 0, usd: 0 }
  const tools = { ...stats.tools }
  for (const t of row.tools ?? []) tools[t] = (tools[t] ?? 0) + 1
  const durations = row.durationMs > 0 ? [...stats.durationsMs, row.durationMs].slice(-MAX_DURATIONS) : stats.durationsMs
  return {
    byKind: { ...stats.byKind, [row.kind]: kind },
    premium1hUsd: stats.premium1hUsd + (price ? (w.w1h * (price.cacheWrite1h - price.cacheWrite)) / M : 0),
    gaps: row.kind === 'main' ? addGap(stats.gaps, row, price) : stats.gaps,
    durationsMs: durations,
    byModel: { ...stats.byModel, [row.model]: { requests: model.requests + 1, usd: model.usd + (row.estUsd ?? 0) } },
    tools,
  }
}

/** A main request's gap since the previous main request's start, judged against the TTL that one wrote with. */
function addGap(g: SessionStats['gaps'], row: RequestRow, price: Price | null): SessionStats['gaps'] {
  const start = row.at - row.durationMs
  const next = { ...g, lastStart: start, lastSeq: row.seq, lastTtl: row.cacheWrite === 0 ? g.lastTtl : ttlOf(row) }
  if (g.lastStart === undefined) return next
  const gap = Math.max(0, start - g.lastStart)
  if (gap < FIVE_MIN) return { ...next, under5m: g.under5m + 1 }
  const bucket = gap < ONE_HOUR ? { to60m: g.to60m + 1 } : { over60m: g.over60m + 1 }
  const prompt = row.input + row.cacheRead + row.cacheWrite
  const ttlMs = g.lastTtl === '1h' ? ONE_HOUR : FIVE_MIN
  const isMiss = gap >= ttlMs && prompt > 0 && row.cacheRead / prompt < MISS_SHARE
  const kept = g.lastTtl === '1h' && gap < ONE_HOUR
  return {
    ...next,
    ...bucket,
    kept1h: g.kept1h + (kept ? 1 : 0),
    expired5m: g.expired5m + (g.lastTtl === '5m' ? 1 : 0),
    savedUsd: g.savedUsd + (kept && price ? (row.cacheRead * (price.cacheWrite - price.cacheRead)) / M : 0),
    missesSeen: g.missesSeen + (isMiss ? 1 : 0),
  }
}

/**
 * A row's split learned after it was added (`row` as it was then): its write moves from
 * unknown to 1-hour and 5-minute, re-priced; the latest main request's TTL follows.
 */
export function applySplitToStats(stats: SessionStats, row: RequestRow, cacheWrite1h: number, price: Price | null): SessionStats {
  if (row.cacheWrite1h !== undefined) return stats
  const k = stats.byKind[row.kind]
  if (!k) return stats
  const w1h = Math.max(0, Math.min(cacheWrite1h, row.cacheWrite))
  const w5m = row.cacheWrite - w1h
  const usd = price
    ? {
        ...k.usd,
        writeUnknown: k.usd.writeUnknown - (row.cacheWrite * price.cacheWrite) / M,
        write5m: k.usd.write5m + (w5m * price.cacheWrite) / M,
        write1h: k.usd.write1h + (w1h * price.cacheWrite1h) / M,
      }
    : k.usd
  const dUsd = price ? (w1h * (price.cacheWrite1h - price.cacheWrite)) / M : 0
  const model = stats.byModel[row.model]
  const isLatest = row.kind === 'main' && stats.gaps.lastSeq === row.seq && row.cacheWrite > 0
  return {
    ...stats,
    byKind: { ...stats.byKind, [row.kind]: { ...k, write1h: k.write1h + w1h, write5m: k.write5m + w5m, writeUnknown: k.writeUnknown - row.cacheWrite, usd } },
    premium1hUsd: stats.premium1hUsd + dUsd,
    byModel: model ? { ...stats.byModel, [row.model]: { ...model, usd: model.usd + dUsd } } : stats.byModel,
    gaps: isLatest ? { ...stats.gaps, lastTtl: w1h > 0 ? '1h' : '5m' } : stats.gaps,
  }
}

/** Nearest-rank percentile of `xs`, 0 when empty. */
export function percentile(xs: readonly number[], p: number): number {
  if (xs.length === 0) return 0
  const sorted = [...xs].sort((a, b) => a - b)
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[i] ?? 0
}

export type StatsSummary = {
  requests: number
  byKind: Record<RequestKind, number>
  /** Cost parts over every kind, and their sum. */
  usd: CostParts
  totalUsd: number
  write1h: number
  write5m: number
  writeUnknown: number
  /** Cache hit rate, overall and per kind with requests. */
  hit: number
  hitByKind: Partial<Record<RequestKind, number>>
  premium1hUsd: number
  savedUsd: number
  /** What the 1-hour TTL came to: savings minus premium. */
  net1hUsd: number
  gaps: SessionStats['gaps']
  p50Ms: number
  p90Ms: number
  maxMs: number
  avgTokens: number
  topModels: Array<[string, { requests: number; usd: number }]>
  topTools: Array<[string, number]>
}

export function summarize(s: SessionStats, top = 5): StatsSummary {
  const kinds = Object.entries(s.byKind) as Array<[RequestKind, KindStats]>
  const sum = (f: (k: KindStats) => number) => kinds.reduce((a, [, k]) => a + f(k), 0)
  const usd: CostParts = {
    input: sum(k => k.usd.input),
    output: sum(k => k.usd.output),
    read: sum(k => k.usd.read),
    write5m: sum(k => k.usd.write5m),
    write1h: sum(k => k.usd.write1h),
    writeUnknown: sum(k => k.usd.writeUnknown),
  }
  const requests = sum(k => k.requests)
  const hitOf = (k: { input: number; cacheRead: number; cacheWrite: number }) => {
    const prompt = k.input + k.cacheRead + k.cacheWrite
    return prompt === 0 ? 0 : k.cacheRead / prompt
  }
  const all = { input: sum(k => k.input), cacheRead: sum(k => k.cacheRead), cacheWrite: sum(k => k.cacheWrite) }
  const hitByKind: Partial<Record<RequestKind, number>> = {}
  for (const [name, k] of kinds) if (k.requests > 0) hitByKind[name] = hitOf(k)
  const tokens = sum(k => k.input + k.output + k.cacheRead + k.cacheWrite)
  return {
    requests,
    byKind: { main: s.byKind.main.requests, subagent: s.byKind.subagent.requests, compact: s.byKind.compact.requests },
    usd,
    totalUsd: Object.values(usd).reduce((a, b) => a + b, 0),
    write1h: sum(k => k.write1h),
    write5m: sum(k => k.write5m),
    writeUnknown: sum(k => k.writeUnknown),
    hit: hitOf(all),
    hitByKind,
    premium1hUsd: s.premium1hUsd,
    savedUsd: s.gaps.savedUsd,
    net1hUsd: s.gaps.savedUsd - s.premium1hUsd,
    gaps: s.gaps,
    p50Ms: percentile(s.durationsMs, 50),
    p90Ms: percentile(s.durationsMs, 90),
    maxMs: s.durationsMs.reduce((a, b) => Math.max(a, b), 0),
    avgTokens: requests === 0 ? 0 : tokens / requests,
    topModels: Object.entries(s.byModel).sort((a, b) => b[1].usd - a[1].usd).slice(0, top),
    topTools: Object.entries(s.tools).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, top),
  }
}
