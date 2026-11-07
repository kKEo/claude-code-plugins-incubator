import type { Tokens } from '../types'

/** USD per million tokens. */
export type Price = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

/** Input/output list prices; cache prices where they differ from the usual ratios. */
type Seed = { input: number; output: number; cacheRead?: number; cacheWrite?: number }

/**
 * Anthropic first-party list prices (claude-api skill table, cached 2026-10-06).
 * Longest prefix wins, so `claude-opus-5-5` is matched before `claude-opus-5`.
 */
const SEEDS: Record<string, Seed> = {
  'claude-fable-5-1': { input: 10, output: 50, cacheRead: 0.25 },
  'claude-mythos-5-1': { input: 10, output: 50, cacheRead: 0.25 },
  'claude-fable-5': { input: 10, output: 50 },
  'claude-mythos-5': { input: 10, output: 50 },
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-opus-4-6': { input: 5, output: 25 },
  'claude-opus-4-5': { input: 5, output: 25 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'claude-haiku-4-5': { input: 1, output: 5 },
}

const CACHE_READ_RATIO = 0.1
const CACHE_WRITE_RATIO = 1.25

const PREFIXES = Object.keys(SEEDS).sort((a, b) => b.length - a.length)

/** `us.anthropic.claude-opus-5-5-20260101-v1:0[1m]` → `claude-opus-5-5`-ish base for matching. */
export function normalizeModel(model: string): string {
  let id = model.toLowerCase().trim()
  id = id.replace(/\[[^\]]*\]$/, '')
  const at = id.indexOf('claude-')
  if (at > 0) id = id.slice(at)
  id = id.replace(/@.*$/, '').replace(/-v\d+(:\d+)?$/, '').replace(/-\d{8}$/, '')
  return id
}

export function priceOf(model: string): Price | null {
  const id = normalizeModel(model)
  const key = PREFIXES.find(p => id === p || id.startsWith(p + '-'))
  const s = key ? SEEDS[key] : undefined
  if (!s) return null
  return {
    input: s.input,
    output: s.output,
    cacheRead: s.cacheRead ?? s.input * CACHE_READ_RATIO,
    cacheWrite: s.cacheWrite ?? s.input * CACHE_WRITE_RATIO,
  }
}

/** Estimated USD for one request; null when the model has no price. */
export function estimate(model: string, t: Tokens): number | null {
  const p = priceOf(model)
  if (!p) return null
  return (t.input * p.input + t.output * p.output + t.cacheRead * p.cacheRead + t.cacheWrite * p.cacheWrite) / 1_000_000
}
