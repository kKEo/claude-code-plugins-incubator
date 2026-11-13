import type { UpdateCheck } from '../types'

/** The published manifest: the repository's default branch, where the marketplace installs from. */
export const MANIFEST_URL =
  'https://raw.githubusercontent.com/kKEo/claude-code-plugins-incubator/master/plugins/session-cost/.claude-plugin/plugin.json'

/** A check older than this is run again when the Version view opens. */
export const CHECK_TTL_MS = 24 * 60 * 60 * 1000

export const NO_CHECK: UpdateCheck = { at: 0, latest: null }

/** The `version` a plugin.json states; null when the text is not a manifest or states none. */
export function manifestVersion(text: string): string | null {
  try {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed !== 'object' || parsed === null) return null
    const version = (parsed as { version?: unknown }).version
    return typeof version === 'string' && version.trim() !== '' ? version.trim() : null
  } catch {
    return null
  }
}

/** `1.2.3-beta.1` → [1, 2, 3]; a part that is not a number counts as 0. */
function parts(version: string): number[] {
  const core = version.trim().replace(/^v/i, '').split(/[-+]/)[0] ?? ''
  return core.split('.').map(p => {
    const n = Number.parseInt(p, 10)
    return Number.isFinite(n) ? n : 0
  })
}

/** Negative when `a` is older than `b`, positive when newer, 0 when the same release. */
export function compareVersions(a: string, b: string): number {
  const x = parts(a)
  const y = parts(b)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (x[i] ?? 0) - (y[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export type UpdateStatus = 'unknown' | 'current' | 'available' | 'ahead'

/** How the installed version stands against the published one. */
export function updateStatus(installed: string | null, latest: string | null): UpdateStatus {
  if (installed === null || latest === null) return 'unknown'
  const diff = compareVersions(installed, latest)
  return diff < 0 ? 'available' : diff > 0 ? 'ahead' : 'current'
}

/** True when the last check is missing or older than the TTL. */
export function isStale(check: UpdateCheck | undefined, now: number): boolean {
  return !check || check.at === 0 || now - check.at > CHECK_TTL_MS
}
