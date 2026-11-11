import { normalizeModel } from './pricing'

/** 950 → `950`, 1234 → `1.2k`, 3_400_000 → `3.4M`. */
export function count(n: number): string {
  if (n < 1000) return String(Math.round(n))
  if (n < 1_000_000) return `${trim(n / 1000)}k`
  return `${trim(n / 1_000_000)}M`
}

function trim(x: number): string {
  return x >= 100 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, '')
}

/** Dollars with enough digits to tell small requests apart. */
export function usd(x: number | null): string {
  if (x === null) return '?'
  const a = Math.abs(x)
  if (a === 0) return '$0'
  if (a < 0.01) return `$${x.toFixed(4)}`
  if (a < 10) return `$${x.toFixed(3)}`
  return `$${x.toFixed(2)}`
}

/** `claude-opus-5-5-20260101` → `opus-5-5`. */
export function shortModel(model: string): string {
  const id = normalizeModel(model)
  return id.startsWith('claude-') ? id.slice('claude-'.length) : id
}

/** `mcp__github__create_issue` → `create_issue`; a built-in tool's name is kept. */
export function shortTool(name: string): string {
  if (!name.startsWith('mcp__')) return name
  const tool = name.slice(name.lastIndexOf('__') + 2)
  return tool === '' ? name : tool
}

/** The tools one response called, in first-call order, repeats counted: `Bash, Read ×3`. */
export function toolList(names: readonly string[]): string {
  const counts = new Map<string, number>()
  for (const n of names) {
    const short = shortTool(n)
    counts.set(short, (counts.get(short) ?? 0) + 1)
  }
  return [...counts].map(([name, n]) => (n > 1 ? `${name} ×${n}` : name)).join(', ')
}

/** Light to vivid green: how much of a request's prompt was read from the cache. */
export const CACHE_READ_RAMP = ['#9bd3a4', '#6fc27d', '#45ad5a', '#229a3d', '#0a8a2a'] as const
/** Light to vivid red: how much of a request's prompt was written to the cache. */
export const CACHE_WRITE_RAMP = ['#e3a6a6', '#de8080', '#d95b5b', '#d43a3a', '#d01919'] as const

/** How strongly to color `part` of `whole`: 0 for nothing, then 1..5 as its share passes 0, 20, 40, 60 and 80%. */
export function heatLevel(part: number, whole: number): number {
  if (!(part > 0) || !(whole > 0)) return 0
  return Math.min(5, Math.floor((part / whole) * 5) + 1)
}

/** The ramp's color for a level; none for level 0, which stays uncolored. */
export function heatColor(ramp: readonly string[], level: number): string | undefined {
  return level <= 0 ? undefined : ramp[Math.min(ramp.length, Math.round(level)) - 1]
}

export function percent(x: number): string {
  return `${Math.round(x * 100)}%`
}

/** hh:mm:ss in local time. */
export function clockTime(ms: number): string {
  const d = new Date(ms)
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String(v).padStart(2, '0')).join(':')
}

/** Local date and minute: `2026-11-08 09:30`. */
export function stamp(ms: number): string {
  const d = new Date(ms)
  const day = [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(v => String(v).padStart(2, '0')).join('-')
  const time = [d.getHours(), d.getMinutes()].map(v => String(v).padStart(2, '0')).join(':')
  return `${day} ${time}`
}

export function duration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
}

/**
 * A bar of `width` cells for `ms` against the slowest request `maxMs`, with the duration written on it, flush right.
 * `filled` is how many cells, from the left, take the bar's color; the rest are its track. A non-zero duration fills at least one.
 */
export function durationBar(ms: number, maxMs: number, width: number): { label: string; filled: number } {
  const w = Math.max(1, Math.round(width))
  const text = duration(ms)
  const label = text.length >= w ? text.slice(text.length - w) : ' '.repeat(w - text.length) + text
  if (!(ms > 0) || !(maxMs > 0)) return { label, filled: 0 }
  return { label, filled: Math.min(w, Math.max(1, Math.round((ms / maxMs) * w))) }
}

export function padEnd(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

export function padStart(s: string, n: number): string {
  return s.length >= n ? s : ' '.repeat(n - s.length) + s
}
