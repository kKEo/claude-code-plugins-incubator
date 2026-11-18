import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CompareSelection, CostView, DayMap, RequestKind, RequestRow, SessionNames, SessionRollup, SessionSummary, Tokens } from '../types'
import {
  addOtherToDays,
  addRowToDays,
  addSharesToDays,
  backfillDays,
  dayKey,
  dayKeysBack,
  dayLabel,
  dayUsd,
  daysSince,
  summaryDays,
  sumDays,
} from './days'
import { CACHE_READ_RAMP, CACHE_WRITE_RAMP, clockTime, count, duration, durationBar, heatColor, heatLevel, oneLine, padEnd, padStart, percent, shortModel, stamp, toolList, usd } from './format'
import { EMPTY_LEDGER, addRow, appendRow, applyLedger, cacheHit, emptyTotals, sessionSpend, tokenSum } from './ledger'
import { estimate } from './pricing'
import { sessionName, titlesIn } from './names'
import { cell, compareSessions, delta, resolveSession, splitArgs } from './compare'
import { UNKNOWN_AGENT_TYPE, addRowToRollup, addSharesToRollup, emptyRollup, rollupFromRows, rollupRequests, setAgentMeta } from './rollup'
import { manifestVersion } from './version'

const PLUGIN = 'session-cost'
const PANE = 'session-cost'
const TITLE = 'Session cost'
const COMMAND = 'session-cost'
const STORE_PREFIX = 'session:'
const DAY_MS = 24 * 60 * 60 * 1000
/** Rows drawn in the Requests view; older ones stay counted in the totals. */
const DRAWN_ROWS = 300
/** The most characters of a session's name kept in history; the row cuts it shorter to fit. */
const NAME_CHARS = 60
/** The most of the transcript's tail read for titles at once; the first scan of a long session starts this far back. */
const TITLE_SCAN_BYTES = 1024 * 1024

const requests = atom({ plugin: 'session-cost', key: 'requests' } as const, [] as RequestRow[])
const totals = atom({ plugin: 'session-cost', key: 'totals' } as const, emptyTotals())
const ledger = atom({ plugin: 'session-cost', key: 'ledger' } as const, EMPTY_LEDGER)
const view = atom({ plugin: 'session-cost', key: 'view' } as const, 'requests' as CostView)
const days = atom({ plugin: 'session-cost', key: 'days' } as const, {} as DayMap)
const names = atom({ plugin: 'session-cost', key: 'names' } as const, {} as SessionNames)
const rollup = atom({ plugin: 'session-cost', key: 'rollup' } as const, emptyRollup())
const compare = atom({ plugin: 'session-cost', key: 'compare' } as const, {} as CompareSelection)

type Engine = EngineInterface

/** From the manifest's userConfig; the module reloads with new values on a change. */
let isStatusLineOn = true
let historyDays = 30
/** The version in this copy's plugin.json: undefined until read, null when it states none. */
let installed: string | null | undefined
/** Model requests whose response has not ended yet; the ledger is read when it drops to 0. */
let inFlight = 0
/** Serialises state writes so rows, totals and ledger move together. */
let queue: Promise<unknown> = Promise.resolve()

function serial<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work)
  queue = run.catch(() => undefined)
  return run
}

async function ledgerUsd($: Engine): Promise<number | undefined> {
  try {
    return (await $.session.usage()).cost?.usd
  } catch {
    return undefined
  }
}

/** What a subagent the mod did not see spawned was started as, from the engine's list of agents. */
async function lookupAgent($: Engine, id: string): Promise<{ type: string; parentId?: string }> {
  try {
    const found = (await $.agent.list()).find(a => a.id === id)
    if (found) return { type: found.type, ...(found.parentId === undefined ? {} : { parentId: found.parentId }) }
  } catch {
    // The list is a convenience; the requests count either way.
  }
  return { type: UNKNOWN_AGENT_TYPE }
}

async function record($: Engine, row: Omit<RequestRow, 'seq' | 'estUsd' | 'ledgerUsd' | 'isApprox'>): Promise<void> {
  await serial(async () => {
    const r0 = (await read($, rollup)) ?? emptyRollup()
    const meta = row.agentId !== undefined && r0.byAgent[row.agentId] === undefined ? await lookupAgent($, row.agentId) : undefined
    const t = (await read($, totals)) ?? emptyTotals()
    const full: RequestRow = {
      ...row,
      seq: t.requests + 1,
      estUsd: estimate(row.model, row),
      ledgerUsd: null,
      isApprox: false,
    }
    await update($, requests, rows => appendRow(rows ?? [], full))
    await update($, totals, old => addRow(old ?? emptyTotals(), full))
    await update($, days, d => addRowToDays(d ?? {}, full))
    await update($, rollup, r => {
      const base = r ?? emptyRollup()
      return addRowToRollup(meta && full.agentId !== undefined ? setAgentMeta(base, full.agentId, meta) : base, full)
    })
    await update($, ledger, old => ({ ...(old ?? EMPTY_LEDGER), pending: [...(old ?? EMPTY_LEDGER).pending, full.seq] }))
  })
}

/** Reads /cost and hands the delta to the requests that finished since the last read. */
async function settleLedger($: Engine): Promise<void> {
  const now = await ledgerUsd($)
  if (now === undefined) return
  await serial(async () => {
    const at = await $.clock.now()
    const [rows, t, l] = await Promise.all([read($, requests), read($, totals), read($, ledger)])
    const applied = applyLedger(rows ?? [], t ?? emptyTotals(), l ?? EMPTY_LEDGER, now)
    await update($, requests, () => applied.rows)
    await update($, totals, () => applied.totals)
    await update($, ledger, () => applied.ledger)
    // Spend no request took counts on the day it was read, once the session has requests of its own.
    const other = applied.unattributedUsd > 0 && applied.totals.requests > 0 ? applied.unattributedUsd : 0
    await update($, rollup, r => addSharesToRollup(r ?? emptyRollup(), applied.rows, applied.shares))
    await update($, days, d => addOtherToDays(addSharesToDays(d ?? {}, applied.rows, applied.shares, at), at, other))
  })
  await refreshStatus($)
}

async function refreshStatus($: Engine): Promise<void> {
  if (!isStatusLineOn) {
    $.ui.status(undefined)
    return
  }
  const [t, l] = await Promise.all([read($, totals), read($, ledger)])
  if (!t || t.requests === 0) {
    $.ui.status(undefined)
    return
  }
  $.ui.status(`${usd(l?.sessionUsd ?? t.ledgerUsd)} · ${t.requests} req · ${count(tokenSum(t))} tok`)
}

// ── history across sessions ──────────────────────────────────────────────────

/** The session's totals as history keeps them, named as `n` names it; none before its first request. */
async function liveSummary($: Engine, n: SessionNames): Promise<SessionSummary | undefined> {
  const [t, l, d, r] = await Promise.all([read($, totals), read($, ledger), read($, days), read($, rollup)])
  if (!t || t.requests === 0) return undefined
  const name = sessionName(n)
  const usage = await $.session.usage()
  return {
    days: d ?? {},
    startedAt: usage.startedAt,
    lastAt: await $.clock.now(),
    ledgerUsd: l ? sessionSpend(l) : t.ledgerUsd,
    estUsd: t.estUsd,
    requests: t.requests,
    input: t.input,
    output: t.output,
    cacheRead: t.cacheRead,
    cacheWrite: t.cacheWrite,
    ...(name === undefined ? {} : { name: oneLine(name, NAME_CHARS) }),
    // Breakdowns that do not add up to the totals would mislead a comparison: leave them out.
    ...(r && rollupRequests(r) === t.requests ? { rollup: r } : {}),
  }
}

/** Saves the session's totals to history. Serialised, so a reset cannot interleave with it and leave a stale entry. */
async function saveSummary($: Engine, sessionId?: string): Promise<void> {
  try {
    await serial(async () => {
      const summary = await liveSummary($, await scanTitles($))
      if (summary === undefined) return
      const id = sessionId ?? (await $.session.id())
      await $.store.set(STORE_PREFIX + id, summary)
    })
  } catch {
    // History is a convenience; never fail a turn over it.
  }
}

/** Reads what the transcript added since the last scan for the session's titles; reads nothing else of it. */
async function scanTitles($: Engine): Promise<SessionNames> {
  const n = (await read($, names)) ?? {}
  try {
    const path = (await $.session.info()).transcriptPath
    if (path === '') return n
    const { size } = await $.fs.stat(path)
    const from = Math.max(n.scanned !== undefined && n.scanned <= size ? n.scanned : 0, size - TITLE_SCAN_BYTES)
    if (from >= size) return n
    const found = titlesIn(await $.fs.read(path, { offset: from, length: size - from }))
    const next = { ...n, ...found, scanned: size }
    await update($, names, () => next)
    return next
  } catch {
    // No transcript, or none the mod may read: the first prompt names the session.
    return n
  }
}

async function loadHistory($: Engine): Promise<Array<SessionSummary & { id: string }>> {
  try {
    const keys = (await $.store.keys()).filter(k => k.startsWith(STORE_PREFIX))
    const values = await Promise.all(keys.map(k => $.store.get(k)))
    return keys
      .map((k, i) => ({ id: k.slice(STORE_PREFIX.length), ...(values[i] as SessionSummary) }))
      .filter(s => typeof s.lastAt === 'number')
  } catch {
    return []
  }
}

type Saved = SessionSummary & { id: string }

/** Every session the Compare view can show: the saved ones, and this one from its live state. */
async function comparable($: Engine): Promise<{ sessions: Saved[]; currentId: string }> {
  const [history, currentId, n] = await Promise.all([loadHistory($), $.session.id(), read($, names)])
  const live = await liveSummary($, n ?? {})
  const others = history.filter(s => s.id !== currentId)
  return { sessions: live ? [...others, { id: currentId, ...live }] : others, currentId }
}

/** Picks a session as A, or as B once A is picked; answers whether that completed a pair. */
async function pick($: Engine, id: string): Promise<boolean> {
  const sel = (await read($, compare)) ?? {}
  if (sel.a === undefined || sel.b !== undefined || sel.a === id) {
    await update($, compare, () => ({ a: id }))
    return false
  }
  await update($, compare, () => ({ a: sel.a, b: id }))
  await update($, view, () => 'compare')
  return true
}

/** Drops days older than `historyDays` from each stored session, and a session left with none. */
async function pruneHistory($: Engine): Promise<void> {
  try {
    const now = await $.clock.now()
    const oldest = dayKeysBack(now, historyDays).at(-1) ?? dayKey(now)
    for (const { id, ...s } of await loadHistory($)) {
      if (!s.days || Object.keys(s.days).length === 0) {
        if (now - s.lastAt > historyDays * DAY_MS) await $.store.delete(STORE_PREFIX + id)
        continue
      }
      const kept = daysSince(s.days, oldest)
      if (Object.keys(kept).length === 0) await $.store.delete(STORE_PREFIX + id)
      else if (Object.keys(kept).length < Object.keys(s.days).length) await $.store.set(STORE_PREFIX + id, { ...s, days: kept })
    }
  } catch {
    // History is a convenience.
  }
}

// ── installed version ────────────────────────────────────────────────────────

/** The version this copy of the plugin was loaded at, from its own manifest. */
async function installedVersion($: Engine): Promise<string | null> {
  if (installed !== undefined) return installed
  try {
    installed = manifestVersion(await $.fs.read(`${$.plugin.root}/.claude-plugin/plugin.json`))
  } catch {
    installed = null
  }
  return installed
}

// ── pane toggle ──────────────────────────────────────────────────────────────

async function isOpen($: Engine): Promise<boolean> {
  return (await $.ui.panes()).some(pane => pane.id === PANE)
}

async function toggle($: Engine): Promise<string> {
  if (await isOpen($)) {
    await $.ui.close({ id: PANE })
    return 'Session cost pane closed.'
  }
  const opened = await $.ui.open({ id: PANE, title: TITLE })
  return opened.isPlaced ? 'Session cost pane opened.' : `Session cost pane waits for a wider terminal (${opened.reason}).`
}

async function reset($: Engine): Promise<void> {
  await serial(async () => {
    const now = (await ledgerUsd($)) ?? 0
    await update($, requests, () => [])
    await update($, totals, () => emptyTotals())
    await update($, days, () => ({}))
    await update($, rollup, () => emptyRollup())
    await update($, ledger, () => ({ lastUsd: now, sessionUsd: now, pending: [], resetUsd: now }))
    // Drop the session's saved summary too, or its pre-reset spend would still count in History.
    try {
      await $.store.delete(STORE_PREFIX + (await $.session.id()))
    } catch {
      // History is a convenience; the reset itself has already happened.
    }
  })
  await refreshStatus($)
}

/** Prompts the person wrote, not ones a peer, a schedule or a plugin sent. */
function isPersonsPrompt(kind: string): boolean {
  return kind === 'composer' || kind === 'bridge' || kind === 'sdk'
}

const VIEWS: readonly CostView[] = ['requests', 'models', 'history', 'days', 'compare']

export const register: Register = (on, options) => {
  const autoOpen = options.autoOpen === true
  const isBandOn = options.band !== false
  const toggleAction = typeof options.toggleAction === 'string' && options.toggleAction !== '' ? options.toggleAction : 'app:toggleReplTab'
  isStatusLineOn = options.statusLine !== false
  historyDays = typeof options.historyDays === 'number' && options.historyDays > 0 ? options.historyDays : 30
  inFlight = 0
  installed = undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Toggle the pane listing every model request with its tokens and cost',
      argumentHint: '[on|off|requests|models|history|days|compare [A B]|reset]',
    })
    // A session recorded before days were kept: split what its rows still show by day.
    await serial(async () => {
      const [d, t, rows] = await Promise.all([read($, days), read($, totals), read($, requests)])
      if ((!d || Object.keys(d).length === 0) && t && t.requests > 0) {
        const filled = backfillDays(rows ?? [], t, await $.clock.now())
        await update($, days, () => filled)
      }
      // A session recorded before rollups were kept: rebuild one while its rows still hold every request.
      const r = await read($, rollup)
      if ((!r || rollupRequests(r) === 0) && t && t.requests > 0 && (rows ?? []).length === t.requests) {
        await update($, rollup, () => rollupFromRows(rows ?? []))
      }
    })
    // A reload keeps the rows; spend before the first new request is not theirs.
    const now = await ledgerUsd($)
    if (now !== undefined) {
      await serial(async () => {
        await update($, ledger, old => ({ ...(old ?? EMPTY_LEDGER), lastUsd: now, sessionUsd: now, pending: [] }))
      })
    }
    void pruneHistory($)
    if (autoOpen && e.surface !== null && e.isInteractive) void $.ui.open({ id: PANE, title: TITLE })
    await refreshStatus($)
    return next(e)
  })

  // Every model request, main loop and subagents alike.
  on('turn.step', async function* ($, e, next) {
    let startedAt = 0
    try {
      startedAt = await $.clock.now()
    } catch {
      startedAt = 0
    }
    inFlight += 1
    let result
    try {
      result = yield* next(e)
      return result
    } finally {
      inFlight = Math.max(0, inFlight - 1)
      try {
        const ended = await $.clock.now()
        const u = result?.usage ?? null
        const tokens: Tokens = {
          input: u?.input_tokens ?? 0,
          output: u?.output_tokens ?? 0,
          cacheRead: u?.cache_read_input_tokens ?? 0,
          cacheWrite: u?.cache_creation_input_tokens ?? 0,
        }
        const kind: RequestKind = e.agentId === undefined ? 'main' : 'subagent'
        const tools = [...(result?.toolUses ?? []), ...(result?.serverToolUses ?? [])].map(use => use.name)
        await record($, {
          ...tokens,
          at: ended,
          durationMs: startedAt > 0 ? ended - startedAt : 0,
          turnId: e.turnId,
          index: e.index,
          agentId: e.agentId,
          kind,
          model: u?.model ?? e.model,
          ...(e.effort === undefined ? {} : { effort: e.effort }),
          stopReason: result?.stopReason ?? null,
          ...(tools.length === 0 ? {} : { tools }),
        })
        if (inFlight === 0) await settleLedger($)
        else await refreshStatus($)
      } catch {
        // Recording is best effort; the request itself is untouched.
      }
    }
  })

  // What each subagent was spawned as, for its row in the rollup.
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    try {
      const id = started.agentId
      if (id !== undefined) {
        const meta = { type: e.subagentType, ...(e.parentAgentId === undefined ? {} : { parentId: e.parentAgentId }) }
        await serial(() => update($, rollup, r => setAgentMeta(r ?? emptyRollup(), id, meta)))
      }
    } catch {
      // A label is a convenience; the spawn itself is untouched.
    }
    return started
  })

  on('session.compact', async ($, e, next) => {
    const startedAt = await $.clock.now()
    const ran = await next(e)
    try {
      if (ran.messages !== undefined && ran.usage) {
        const ended = await $.clock.now()
        await record($, {
          input: ran.usage.input_tokens,
          output: ran.usage.output_tokens,
          cacheRead: ran.usage.cache_read_input_tokens,
          cacheWrite: ran.usage.cache_creation_input_tokens,
          at: ended,
          durationMs: ended - startedAt,
          turnId: 'compact',
          index: 0,
          agentId: e.agentId,
          kind: 'compact',
          model: await $.session.model(),
          stopReason: null,
        })
        if (inFlight === 0) await settleLedger($)
      }
    } catch {
      // best effort
    }
    return ran
   }).catch(($, e, next) => next(e))

  // The first prompt the person sends names the session until a title does.
  on('prompt.submit', async ($, e, next) => {
    const sent = await next(e)
    try {
      if (sent.drop === undefined && !e.command && !e.isMeta && isPersonsPrompt(e.origin.kind)) {
        const prompt = oneLine(e.text, NAME_CHARS)
        if (prompt !== '') await update($, names, n => (n?.prompt ? n : { ...(n ?? {}), prompt }))
      }
    } catch {
      // A name is a convenience; never hold up a prompt over it.
    }
    return sent
  })

  // A turn's end: settle anything the ledger added late, and keep history current.
  on('turn.complete', async ($, e, next) => {
    const ran = await next(e)
    if (inFlight === 0) await settleLedger($)
    if (e.agentId === undefined) await saveSummary($)
    return ran
  })

  on('session.end', async ($, e, next) => {
    await saveSummary($, e.sessionId)
    if (e.reason === 'clear') {
      await serial(async () => {
        await update($, requests, () => [])
        await update($, totals, () => emptyTotals())
        await update($, days, () => ({}))
        await update($, rollup, () => emptyRollup())
        await update($, ledger, () => EMPTY_LEDGER)
        await update($, names, () => ({}))
      })
      $.ui.status(undefined)
    }
    return next(e)
  })

  on('command.run', { command: 'session-cost' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const words = splitArgs(e.args.trim())
    if (words[0]?.toLowerCase() === 'compare' && words.length > 1) {
      if (words.length !== 3) return { text: 'Usage: /session-cost compare <A> <B>, each a session id, id prefix or name ("quoted" when it has spaces).' }
      const { sessions } = await comparable($)
      const found = words.slice(1).map(w => resolveSession(sessions, w))
      const errors = found.flatMap(f => ('error' in f ? [f.error] : []))
      if (errors.length > 0) return { text: `Session cost: ${errors.join('; ')}.` }
      const [a, b] = found.map(f => ('id' in f ? f.id : ''))
      await update($, compare, () => ({ a, b }))
      await update($, view, () => 'compare')
      const opened = await $.ui.open({ id: PANE, title: TITLE })
      return { text: opened.isPlaced ? 'Session cost pane: compare view.' : `Session cost pane waits for a wider terminal (${opened.reason}).` }
    }
    if (arg === 'off' || arg === 'close' || arg === 'hide') {
      if (await isOpen($)) await $.ui.close({ id: PANE })
      return { text: 'Session cost pane closed.' }
    }
    if (arg === 'reset') {
      await reset($)
      return { text: 'Session cost: this session’s request list and totals were cleared.' }
    }
    if ((VIEWS as readonly string[]).includes(arg)) {
      await update($, view, () => arg as CostView)
      const opened = await $.ui.open({ id: PANE, title: TITLE })
      return { text: opened.isPlaced ? `Session cost pane: ${arg} view.` : `Session cost pane waits for a wider terminal (${opened.reason}).` }
    }
    if (arg === 'on' || arg === 'open' || arg === 'show') {
      const opened = await $.ui.open({ id: PANE, title: TITLE })
      return { text: opened.isPlaced ? 'Session cost pane opened.' : `Session cost pane waits for a wider terminal (${opened.reason}).` }
    }
    if (arg !== '' && arg !== 'toggle') {
      return { text: `Unknown argument "${arg}". Use: on, off, requests, models, history, days, compare [A B] or reset.` }
    }
    return { text: await toggle($) }
  }).catch(async () => ({ text: 'Session cost: the command failed; see the debug log.' }))

  // The chip above the prompt; its Button carries the keyboard toggle.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isBandOn || e.props.hasSurvey) return next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    const button = <Button key="session-cost-toggle" label="usage" plain action={toggleAction} onPress={() => toggle($)} />
    // Collapsed: nothing is on screen, so skip the reads and the cost text, but keep
    // the Button mounted, since its keyboard chord only works while it is mounted.
    if (e.props.isCollapsed) {
      const below = await next(e)
      return (
        <Box flexDirection="column">
          <Box key="session-cost-chip" flexDirection="row">{button}</Box>
          {below}
        </Box>
      )
    }
    const [t, l] = await Promise.all([read($, totals), read($, ledger)])
    const below = await next(e)
    const spent = usd(l?.sessionUsd ?? t?.ledgerUsd ?? 0)
    const chip = (
      <Box key="session-cost-chip" flexDirection="row" gap={1}>
        <Text dimColor>
          {spent} · {t?.requests ?? 0} req · {count(t ? tokenSum(t) : 0)} tok
        </Text>
        {button}
      </Box>
    )
    return (
      <Box flexDirection="column">
        {chip}
        {below}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const [rows, t0, l, v, d0, version] = await Promise.all([read($, requests), read($, totals), read($, ledger), read($, view), read($, days), installedVersion($)])
    const sessionDays = d0 ?? {}
    const t = t0 ?? emptyTotals()
    // A view kept by an older version (the removed Version tab) falls back to Requests.
    const mode: CostView = v !== undefined && VIEWS.includes(v) ? v : 'requests'
    const sessionUsd = l?.sessionUsd ?? t.ledgerUsd
    const unattributed = sessionUsd - t.ledgerUsd

    const tabs = (
      <Box flexDirection="row" gap={1}>
        <Button key="view:requests" hotkey="r" variant={mode === 'requests' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'requests')}>
          Requests
        </Button>
        <Button key="view:models" hotkey="m" variant={mode === 'models' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'models')}>
          Models
        </Button>
        <Button key="view:history" hotkey="h" variant={mode === 'history' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'history')}>
          History
        </Button>
        <Button key="view:days" hotkey="d" variant={mode === 'days' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'days')}>
          Days
        </Button>
        <Button key="view:compare" hotkey="c" variant={mode === 'compare' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'compare')}>
          Compare
        </Button>
      </Box>
    )

    const header = (
      <Box flexDirection="column">
        <Text>
          <Text weight="bold" color="claude">{usd(sessionUsd)}</Text>
          <Text dimColor> /cost</Text>
          <Text>  est {usd(t.estUsd)}{t.hasUnpriced ? '+' : ''}</Text>
          <Text dimColor>  {t.requests} req</Text>
          {version !== null ? <Text dimColor>  · v{version}</Text> : null}
        </Text>
        <Text tabular>
          in {count(t.input)} · out {count(t.output)} · cache r {count(t.cacheRead)} · w {count(t.cacheWrite)}
        </Text>
        <Text dimColor>
          cache hit {percent(cacheHit(t))} · main {t.byKind.main} · sub {t.byKind.subagent} · compact {t.byKind.compact}
          {Math.abs(unattributed) >= 0.00005 ? ` · unattributed ${usd(unattributed)}` : ''}
        </Text>
      </Box>
    )

    let body
    if (mode === 'requests') {
      const list = (rows ?? []).slice(-DRAWN_ROWS).reverse()
      const isMultiDay = list.some(r => dayKey(r.at) !== dayKey(list[0]?.at ?? r.at))
      // Elapsed-time bars are scaled to the slowest request drawn.
      const maxMs = list.reduce((m, r) => Math.max(m, r.durationMs), 0)
      const barWidth = 7
      body =
        list.length === 0 ? (
          <Text dimColor>No requests yet. Every model request of this session will be listed here.</Text>
        ) : (
          <Box flexDirection="column">
            {list.flatMap((r, i) => {
              const day = dayKey(r.at)
              const newer = list[i - 1]
              // Newest first: a row from another day than the one above it opens that day.
              const opensDay = newer === undefined ? isMultiDay : dayKey(newer.at) !== day
              const separator =
                opensDay ? (
                  <Text key={`day:${day}:${r.seq}`} dimColor>
                    ── {dayLabel(day)} ──
                  </Text>
                ) : null
              const who = r.kind === 'main' ? 'main' : r.kind === 'compact' ? 'compact' : `sub:${(r.agentId ?? '').slice(0, 6)}`
              const bar = durationBar(r.durationMs, maxMs, barWidth)
              // Cache reads in green and writes in red, each more vivid the larger its share of the prompt.
              const prompt = r.input + r.cacheRead + r.cacheWrite
              const readColor = heatColor(CACHE_READ_RAMP, heatLevel(r.cacheRead, prompt))
              const writeColor = heatColor(CACHE_WRITE_RAMP, heatLevel(r.cacheWrite, prompt))
              const ledgerText = r.ledgerUsd === null ? '…' : `${r.isApprox ? '~' : ''}${usd(r.ledgerUsd)}`
              const entry = (
                <Box key={`req:${r.seq}`} flexDirection="column">
                  <Text wrap="truncate-end">
                    <Text dimColor>#{r.seq} {clockTime(r.at)}</Text> {shortModel(r.model)}{r.effort === undefined ? null : <Text dimColor> {String(r.effort)}</Text>} <Text color={r.kind === 'main' ? undefined : 'warning'}>{who}</Text>
                    {r.durationMs > 0 ? (
                      <Text>
                        {' '}
                        <Text color="inverseText" backgroundColor={r.durationMs === maxMs && list.length > 1 ? 'warning' : 'suggestion'}>{bar.label.slice(0, bar.filled)}</Text>
                        <Text color="text" backgroundColor="subtle">{bar.label.slice(bar.filled)}</Text>
                      </Text>
                    ) : (
                      <Text dimColor> {duration(r.durationMs)}</Text>
                    )}
                    {r.tools !== undefined && r.tools.length > 0 ? (
                      // What it called says more than `tool_use`; any other stop reason stays beside it.
                      <Text dimColor>{r.stopReason && r.stopReason !== 'tool_use' ? ` ${r.stopReason}` : ''} → {toolList(r.tools)}</Text>
                    ) : (
                      <Text dimColor>{r.stopReason ? ` ${r.stopReason}` : ''}</Text>
                    )}
                  </Text>
                  <Text wrap="truncate-end" tabular>
                    {'  '}in {padStart(count(r.input), 5)} out {padStart(count(r.output), 5)}{' '}
                    <Text color={readColor} dimColor={readColor === undefined}>cr {padStart(count(r.cacheRead), 5)}</Text>{' '}
                    <Text color={writeColor} dimColor={writeColor === undefined}>cw {padStart(count(r.cacheWrite), 5)}</Text>
                    {'  '}<Text color="success">{ledgerText}</Text>
                    <Text dimColor> / est {usd(r.estUsd)}</Text>
                  </Text>
                </Box>
              )
              return separator ? [separator, entry] : [entry]
            })}
            {(rows ?? []).length > DRAWN_ROWS || t.requests > (rows ?? []).length ? (
              <Text dimColor>
                Showing the newest {Math.min(DRAWN_ROWS, (rows ?? []).length)} of {t.requests}; totals include all.
              </Text>
            ) : null}
          </Box>
        )
    } else if (mode === 'models') {
      const models = Object.entries(t.byModel).sort((a, b) => b[1].ledgerUsd + b[1].estUsd - (a[1].ledgerUsd + a[1].estUsd))
      const nameWidth = Math.min(18, Math.max(8, ...models.map(([m]) => shortModel(m).length)))
      body =
        models.length === 0 ? (
          <Text dimColor>No requests yet.</Text>
        ) : (
          <Box flexDirection="column">
            {models.map(([m, s]) => (
              <Box key={`model:${m}`} flexDirection="column">
                <Text wrap="truncate-end">
                  <Text weight="bold">{padEnd(shortModel(m), nameWidth)}</Text> {padStart(String(s.requests), 4)} req  <Text color="success">{usd(s.ledgerUsd)}</Text>
                  <Text dimColor> / est {usd(s.estUsd)}</Text>
                </Text>
                <Text wrap="truncate-end" dimColor tabular>
                  {'  '}in {count(s.input)} · out {count(s.output)} · cr {count(s.cacheRead)} · cw {count(s.cacheWrite)} · hit {percent(cacheHit(s))}
                </Text>
              </Box>
            ))}
          </Box>
        )
    } else if (mode === 'compare') {
      const sel = (await read($, compare)) ?? {}
      const { sessions } = await comparable($)
      const find = (id?: string) => (id === undefined ? undefined : sessions.find(s => s.id === id))
      const a = find(sel.a)
      const b = find(sel.b)
      const who = (side: 'A' | 'B', s: Saved | undefined, id: string | undefined) => (
        <Text key={`cmp:who:${side}`} wrap="truncate-end">
          <Text weight="bold">{side} </Text>
          {s ? `${padEnd(s.id.slice(0, 8), 8)} ${stamp(s.lastAt)}${s.name ? `  ${s.name}` : ''}` : id === undefined ? '—' : `${id.slice(0, 8)} (no longer saved)`}
        </Text>
      )
      const COL = 10
      body =
        !a || !b ? (
          <Box flexDirection="column">
            {who('A', a, sel.a)}
            {who('B', b, sel.b)}
            <Text dimColor>—</Text>
            <Text dimColor>Pick two sessions in History (A, then B), or run /session-cost compare A B.</Text>
          </Box>
        ) : (
          <Box flexDirection="column" gap={1}>
            <Box flexDirection="column">
              {who('A', a, sel.a)}
              {who('B', b, sel.b)}
              <Box flexDirection="row">
                <Button key="compare:swap" hotkey="s" onPress={() => update($, compare, old => ({ a: old?.b, b: old?.a }))}>
                  swap
                </Button>
              </Box>
            </Box>
            {compareSessions(a, b).map(section => (
              <Box key={`cmp:section:${section.title}`} flexDirection="column">
                <Text weight="bold">{section.title}</Text>
                <Text dimColor tabular>
                  {padEnd('', 16)} {padStart('A', COL)} {padStart('B', COL)} {padStart('B−A', COL)} {padStart('%', 6)}
                </Text>
                {section.missing !== undefined ? <Text dimColor>n/a for {section.missing}: saved before session-cost 0.6.0 kept breakdowns.</Text> : null}
                {section.metrics.length === 0 && section.missing === undefined ? <Text dimColor>none in either session</Text> : null}
                {section.metrics.map(m => {
                  const d = delta(m)
                  const color = d.tone === 'better' ? 'success' : d.tone === 'worse' ? 'error' : undefined
                  return (
                    <Text key={`cmp:${m.id}`} wrap="truncate-end" tabular>
                      {padEnd(m.label, 16)} {padStart(cell(m.a, m.unit), COL)} {padStart(cell(m.b, m.unit), COL)}{' '}
                      <Text color={color} dimColor={color === undefined}>
                        {padStart(d.text, COL)} {padStart(d.pct, 6)}
                      </Text>
                    </Text>
                  )
                })}
              </Box>
            ))}
          </Box>
        )
    } else {
      const now = await $.clock.now()
      const history = await loadHistory($)
      const currentId = await $.session.id()
      // This session from its live days, never from its own saved summary.
      const others = history.filter(s => s.id !== currentId)
      const sessions: DayMap[] = [...others.map(summaryDays), sessionDays]
      const window = (keys: readonly string[]) => {
        const sums = sessions.map(dm => sumDays(dm, keys)).filter(x => x.requests > 0 || dayUsd(x) !== 0)
        return {
          spent: sums.reduce((a, x) => a + dayUsd(x), 0),
          reqs: sums.reduce((a, x) => a + x.requests, 0),
          toks: sums.reduce((a, x) => a + tokenSum(x), 0),
          sessions: sums.length,
        }
      }

      if (mode === 'history') {
        const line = (label: string, w: { spent: number; reqs: number; toks: number; sessions: number }) => (
          <Text key={`hist:${label}`} wrap="truncate-end" tabular>
            {padEnd(label, 14)} <Text color="success">{padStart(usd(w.spent), 9)}</Text>  {padStart(String(w.reqs), 5)} req  {padStart(count(w.toks), 6)} tok
            <Text dimColor>  {w.sessions} session{w.sessions === 1 ? '' : 's'}</Text>
          </Text>
        )
        const recent = others.sort((a, b) => b.lastAt - a.lastAt).slice(0, 10)
        const sel = (await read($, compare)) ?? {}
        body = (
          <Box flexDirection="column">
            <Box flexDirection="row" gap={1}>
              {t.requests > 0 ? (
                <Button key={`pick:${currentId}`} plain onPress={() => pick($, currentId)}>
                  {sel.a === currentId ? 'A' : sel.b === currentId ? 'B' : '·'}
                </Button>
              ) : null}
              {line('This session', { spent: l ? sessionSpend(l) : t.ledgerUsd, reqs: t.requests, toks: tokenSum(t), sessions: 1 })}
            </Box>
            {line('Today', window(dayKeysBack(now, 1)))}
            {line('Last 7 days', window(dayKeysBack(now, 7)))}
            {line(`Last ${historyDays} days`, window(dayKeysBack(now, historyDays)))}
            {recent.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text weight="bold">Recent sessions</Text>
                {recent.map(s => (
                  <Box key={`sess:${s.id}`} flexDirection="row" gap={1}>
                    <Button key={`pick:${s.id}`} plain onPress={() => pick($, s.id)}>
                      {sel.a === s.id ? 'A' : sel.b === s.id ? 'B' : '·'}
                    </Button>
                    <Text wrap="truncate-end" dimColor tabular>
                      {stamp(s.lastAt)} {padStart(usd(s.ledgerUsd), 9)} {padStart(String(s.requests), 5)} req {s.name ? `${padEnd(s.id.slice(0, 8), 8)}  ${s.name}` : s.id.slice(0, 8)}
                    </Text>
                  </Box>
                ))}
                <Text dimColor>Press a row's · to mark it A, then another's to mark it B and compare.</Text>
              </Box>
            )}
          </Box>
        )
      } else {
        const today = dayKey(now)
        const keys = dayKeysBack(now, historyDays).filter(k => window([k]).sessions > 0)
        const spans = Object.values(sessionDays).filter(x => x.requests > 0).length
        body =
          keys.length === 0 ? (
            <Text dimColor>No spend recorded in the last {historyDays} days.</Text>
          ) : (
            <Box flexDirection="column">
              <Text dimColor tabular>
                {padEnd('Day', 12)} {padStart('this session', 18)}   {padStart('all sessions', 18)}
              </Text>
              {keys.map(k => {
                const mine = sessionDays[k]
                const all = window([k])
                const mineText = mine && (mine.requests > 0 || dayUsd(mine) !== 0) ? `${padStart(usd(dayUsd(mine)), 9)} ${padStart(String(mine.requests), 4)} req` : padStart('—', 18)
                return (
                  <Text key={`day:${k}`} wrap="truncate-end" tabular>
                    <Text weight={k === today ? 'bold' : undefined}>{padEnd(dayLabel(k), 12)}</Text> <Text color="success">{mineText}</Text>
                    {'   '}{padStart(usd(all.spent), 9)} {padStart(String(all.sessions), 3)} sess
                    {k === today ? <Text dimColor>  today</Text> : null}
                  </Text>
                )
              })}
              {spans > 1 && <Text dimColor>This session spans {spans} days.</Text>}
            </Box>
          )
      }
    }

    return (
      <Box flexDirection="column" gap={1}>
        {tabs}
        {header}
        {body}
      </Box>
    )
  })
}
