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

export function percent(x: number): string {
  return `${Math.round(x * 100)}%`
}

/** hh:mm:ss in local time. */
export function clockTime(ms: number): string {
  const d = new Date(ms)
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String(v).padStart(2, '0')).join(':')
}

export function duration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
}

export function padEnd(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

export function padStart(s: string, n: number): string {
  return s.length >= n ? s : ' '.repeat(n - s.length) + s
}
