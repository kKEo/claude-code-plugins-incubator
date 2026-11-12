/** `pending`: not checked yet; `ok`: nothing to correct; `fixed`: has a corrected form. */
export type Verdict = 'pending' | 'ok' | 'fixed'

export type Answer = 'known' | 'missed'

/** One collected prompt, as the store and the pane hold it. */
export type Entry = {
  id: string
  at: number
  text: string
  status: Verdict
  corrected?: string
  /** One short line naming the main mistakes. */
  note?: string
  /** Failed checks so far; the check is given up after a few. */
  tries: number
  known: number
  missed: number
  lastAnswer?: Answer
}

export type CoachView = 'prompts' | 'practice'

/** The practice card on show: which entry, and whether its correct form is revealed. */
export type Round = { id: string | null; isRevealed: boolean }

declare module 'claude-code' {
  interface PluginState {
    'prompt-coach': {
      entries: Shaped<Entry[]>
      view: CoachView
      round: Round
    }
  }
}
