export type RequestKind = 'main' | 'subagent' | 'compact'

/** Token counts in the API's four buckets. */
export type Tokens = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

/** One model request the session sent, as recorded when its response ended. */
export type RequestRow = Tokens & {
  /** Position in the session, from 1; survives the list cap. */
  seq: number
  /** When the response ended, in `$.clock.now()` milliseconds. */
  at: number
  durationMs: number
  turnId: string
  /** The step's position in its turn. */
  index: number
  agentId?: string
  kind: RequestKind
  /** The model that answered (or the one requested when nothing came back). */
  model: string
  /**
   * The effort the request asked for (a level or a number), as `turn.step` carried it;
   * absent for a model without effort, a compaction, and rows recorded before it was kept.
   */
  effort?: string | number
  /** Price-table estimate in USD; null for a model the table does not know. */
  estUsd: number | null
  /** Share of the engine's /cost ledger in USD; null until the ledger is read. */
  ledgerUsd: number | null
  /** True when the ledger delta was split across overlapping requests. */
  isApprox: boolean
  stopReason: string | null
  /**
   * Names of the tools the response called, in order (the engine's, then the ones the API ran itself);
   * absent when it called none, and on rows recorded before they were kept.
   */
  tools?: string[]
}

export type ModelTotals = Tokens & {
  requests: number
  estUsd: number
  ledgerUsd: number
}

/** Running sums over every request of the session, kept past the list cap. */
export type Totals = Tokens & {
  requests: number
  byKind: Record<RequestKind, number>
  estUsd: number
  /** Sum of attributed ledger shares (rows). */
  ledgerUsd: number
  /** True when some request's model had no price. */
  hasUnpriced: boolean
  byModel: Record<string, ModelTotals>
}

export type Ledger = {
  /** The /cost total at the last read, USD. */
  lastUsd: number
  /** The /cost total as last read, for the header. */
  sessionUsd: number
  /** Seqs of rows waiting for their ledger share. */
  pending: number[]
  /** The /cost total when `/session-cost reset` last ran; spend up to it is not this session's history. */
  resetUsd?: number
}

export type CostView = 'requests' | 'models' | 'history' | 'days'

/** What one calendar day (local time) of a session spent; a request counts on the day its response ended. */
export type DayTotals = Tokens & {
  requests: number
  estUsd: number
  /** Ledger shares of that day's requests. */
  ledgerUsd: number
  /** /cost growth read that day while no request was waiting for it. */
  otherUsd: number
}

/** Day buckets keyed by local `YYYY-MM-DD`. */
export type DayMap = Record<string, DayTotals>

/** One session's totals as kept across sessions in `$.store`. */
export type SessionSummary = Tokens & {
  startedAt: number
  lastAt: number
  ledgerUsd: number
  estUsd: number
  requests: number
  /** The session split by day; absent on summaries saved before days were kept. */
  days?: DayMap
}

declare module 'claude-code' {
  interface PluginState {
    'session-cost': {
      requests: RequestRow[]
      totals: Totals
      ledger: Ledger
      view: CostView
      days: DayMap
    }
  }
}
