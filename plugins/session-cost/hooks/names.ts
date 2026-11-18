import type { SessionNames } from '../types'

/**
 * The titles a stretch of transcript sets: its last `/rename` (`custom-title`) and its last
 * generated title (`ai-title`). Every other line is skipped unread, and a line cut at either
 * end of the stretch does not parse and is skipped too.
 */
export function titlesIn(text: string): Pick<SessionNames, 'custom' | 'ai'> {
  const found: Pick<SessionNames, 'custom' | 'ai'> = {}
  for (const line of text.split('\n')) {
    if (!line.includes('"custom-title"') && !line.includes('"ai-title"')) continue
    try {
      const row = JSON.parse(line) as { type?: unknown; customTitle?: unknown; aiTitle?: unknown }
      if (row.type === 'custom-title' && typeof row.customTitle === 'string') found.custom = row.customTitle
      if (row.type === 'ai-title' && typeof row.aiTitle === 'string') found.ai = row.aiTitle
    } catch {
      // A cut or foreign line.
    }
  }
  return found
}

/** What Recent sessions calls the session: its custom title, else its generated one, else its first prompt. */
export function sessionName(n: SessionNames): string | undefined {
  return [n.custom, n.ai, n.prompt].find(x => x !== undefined && x.trim() !== '')
}
