import type { Tokens } from '../types'

/** Claude Code's project folder name: every character outside [A-Za-z0-9] becomes `-`. */
export function projectSlug(dir: string): string {
  return dir.replace(/[^A-Za-z0-9]/g, '-')
}

/**
 * Where Claude Code keeps a session's transcript: the main conversation's
 * `<sessionId>.jsonl`, or a subagent's `<sessionId>/subagents/agent-<agentId>.jsonl`.
 */
export function transcriptPath(configDir: string, projectDir: string, sessionId: string, agentId?: string): string {
  const base = `${configDir.replace(/\/+$/, '')}/projects/${projectSlug(projectDir)}`
  return agentId === undefined ? `${base}/${sessionId}.jsonl` : `${base}/${sessionId}/subagents/agent-${agentId}.jsonl`
}

type Usage = {
  input_tokens?: unknown
  output_tokens?: unknown
  cache_read_input_tokens?: unknown
  cache_creation_input_tokens?: unknown
  cache_creation?: { ephemeral_1h_input_tokens?: unknown } | null
}

/**
 * The 1-hour share of a request's cache write, read from its transcript: the newest
 * assistant entry whose usage matches `t` on all four counts. Undefined when none
 * matches or the entry carries no split. Only the usage numbers are looked at.
 */
export function findSplit(text: string, t: Tokens): number | undefined {
  const lines = text.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    // Cheap filter before parsing: only assistant entries with a cache split.
    if (!line || !line.includes('"assistant"') || !line.includes('"cache_creation"')) continue
    let entry: { type?: unknown; message?: { usage?: Usage } }
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    const u = entry.type === 'assistant' ? entry.message?.usage : undefined
    if (!u) continue
    if (
      u.input_tokens !== t.input ||
      u.output_tokens !== t.output ||
      u.cache_read_input_tokens !== t.cacheRead ||
      u.cache_creation_input_tokens !== t.cacheWrite
    ) {
      continue
    }
    const oneHour = u.cache_creation?.ephemeral_1h_input_tokens
    return typeof oneHour === 'number' && oneHour >= 0 && oneHour <= t.cacheWrite ? oneHour : undefined
  }
  return undefined
}
