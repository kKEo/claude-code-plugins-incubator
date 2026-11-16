import { expect, test } from 'claude-code/testing'

import { ttlLabel } from './format'
import { findSplit, projectSlug, transcriptPath } from './ttl'

const T = { input: 2, output: 300, cacheRead: 40_000, cacheWrite: 1500 }

function entry(usage: Record<string, unknown>, type = 'assistant'): string {
  return JSON.stringify({ type, message: { role: 'assistant', usage } })
}

function usage(oneHour: number, fiveMin: number, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    input_tokens: T.input,
    output_tokens: T.output,
    cache_read_input_tokens: T.cacheRead,
    cache_creation_input_tokens: T.cacheWrite,
    cache_creation: { ephemeral_1h_input_tokens: oneHour, ephemeral_5m_input_tokens: fiveMin },
    ...over,
  }
}

test('transcript paths follow Claude Code’s project folder layout', async () => {
  expect(projectSlug('/Users/me/Work/my.repo_x')).toBe('-Users-me-Work-my-repo-x')
  expect(transcriptPath('/home/me/.claude/', '/srv/app', 'sess-1')).toBe('/home/me/.claude/projects/-srv-app/sess-1.jsonl')
  expect(transcriptPath('/home/me/.claude', '/srv/app', 'sess-1', 'a1b2')).toBe('/home/me/.claude/projects/-srv-app/sess-1/subagents/agent-a1b2.jsonl')
})

test('the newest assistant entry with matching counts gives the 1-hour share', async () => {
  const text = [
    entry(usage(1500, 0)),
    '{"type":"user","message":{"content":"hi"}}',
    entry(usage(1000, 500)),
    '',
  ].join('\n')
  expect(findSplit(text, T)).toBe(1000)
})

test('entries with other counts, other types, bad lines or no split are skipped', async () => {
  const text = [
    entry(usage(0, 1500)),
    entry(usage(1500, 0, { output_tokens: 999 })),
    entry(usage(1500, 0), 'user'),
    '{"type":"assistant", "cache_creation": broken',
  ].join('\n')
  expect(findSplit(text, T)).toBe(0)
  expect(findSplit(entry(usage(1500, 0, { cache_creation: null })), T)).toBeUndefined()
  expect(findSplit(entry(usage(1500, 0, { input_tokens: 3 })), T)).toBeUndefined()
  expect(findSplit('', T)).toBeUndefined()
})

test('the row label names the TTL, and both parts when a write mixed them', async () => {
  expect(ttlLabel(1500, 1500)).toBe(' 1h')
  expect(ttlLabel(1500, 0)).toBe(' 5m')
  expect(ttlLabel(12_000, 8000)).toMatch(/^ 1h 8(\.0)?k\+5m 4(\.0)?k$/)
})
