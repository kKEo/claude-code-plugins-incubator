import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

/** A found element's children, as the bar test walks them (FoundElement types them as unknown). */
type Node = { type: string; props?: Record<string, unknown>; children: (Node | string)[] }

const PANE = {
  plugin: 'session-cost',
  component: 'Pane',
  requestId: 'session-cost',
  props: {
    title: 'Session cost',
    isFocused: false,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const BAND = {
  plugin: 'session-cost',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 6,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 6 },
    view: {},
  },
} as const

/** The engine beneath the plugin: a /cost ledger the test moves, panes, store and clock. */
function engine(on: On, store: Record<string, unknown> = {}) {
  const state = { usd: 0.5, open: false, id: 'sess-1', stepMs: [] as number[], stepTools: [] as string[][], stepCache: [] as { read: number; write: number }[], now: 1_800_000_000_000 }
  const clock = mock.clock(on, { now: 1_800_000_000_000 })
  mock.store(on, store)
  on('command.register', () => ({ value: { command: 'session-cost' } }))
  on('ui.open', () => { state.open = true; return { value: { isPlaced: true } } })
  on('ui.close', () => { state.open = false; return { value: undefined } })
  on('ui.panes', () => ({ value: state.open ? [{ id: 'session-cost', title: 'Session cost', isShown: true, isFocused: false, isPlaced: true }] : [] }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: state.id }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.usage', () => ({ value: { startedAt: 0, rateLimits: [], cost: { usd: state.usd } } as never }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  // The engine's own band beneath the plugin: empty.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  on('turn.step', async function* (_, e) {
    // A test queues how long each request takes; the mocked clock moves by that much.
    const ms = state.stepMs.shift()
    if (ms !== undefined) await clock.set((state.now += ms))
    // The engine adds the response's cost to the ledger as it streams.
    state.usd += e.agentId ? 0.004 : 0.02
    // A test queues the tools each response calls; none queued is a plain answer.
    const tools = state.stepTools.shift() ?? []
    // A test queues what each request read from and wrote to the cache; the default is read-heavy.
    const cache = state.stepCache.shift() ?? { read: 40_000, write: 2000 }
    return {
      turnId: e.turnId,
      index: e.index,
      answer: '',
      toolUses: tools.map(name => ({ name, input: {} })),
      stopReason: tools.length > 0 ? ('tool_use' as const) : ('end_turn' as const),
      usage: { model: e.agentId ? 'claude-haiku-5-5' : 'claude-opus-5-5', input_tokens: 1200, output_tokens: 300, cache_read_input_tokens: cache.read, cache_creation_input_tokens: cache.write },
    }
  })
  return { state, clock }
}

async function step($: Engine, index: number, agentId?: string, effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max' | number) {
  const stream = $.turn.step({
    turnId: 'turn-1',
    index,
    model: 'claude-opus-5-5',
    messageCount: 3,
    ...(agentId ? { agentId } : {}),
    ...(effort === undefined ? {} : { effort }),
  })
  for await (const _ of stream) {
    // drain
  }
}

test('every request is recorded with its ledger share and estimate, and the pane shows them', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  await step($, 1)
  await step($, 2, 'agent-abc123')
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    // Ledger total includes the 0.50 spent before the mod loaded; the rows hold only their own.
    expect(await ui.find({ type: 'Text', text: /\$0\.544/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /3 req/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /#1 / })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /sub:agent-/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /\$0\.020/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /est \$0\.029/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /unattributed \$0\.500/ })).toBeDefined()

    await ui.press({ key: 'view:models' })
    expect(await ui.find({ type: 'Text', text: /haiku-5-5/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /opus-5-5/ })).toBeDefined()

    await ui.press({ key: 'view:history' })
    expect(await ui.find({ type: 'Text', text: /This session/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Today/ })).toBeDefined()
    await ui.press({ key: 'view:requests' })
    await ui.unmount()
  }
})

test('a request row shows the effort it asked for, and none when it asked for none', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0, undefined, 'xhigh')
  await step($, 1, 'agent-abc123', 'low')
  await step($, 2)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /^#1 / }))?.text).toMatch(/opus-5-5 xhigh main/)
    expect((await ui.find({ type: 'Text', text: /^#2 / }))?.text).toMatch(/haiku-5-5 low sub:agent-/)
    expect((await ui.find({ type: 'Text', text: /^#3 / }))?.text).toMatch(/opus-5-5 main/)
    await ui.unmount()
  }
})

test('the chip above the prompt carries the toggle on the configured action', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /1 req/ })).toBeDefined()
  const button = await ui.find({ type: 'Button', key: 'session-cost-toggle' })
  expect(button?.props.action).toBe('app:toggleReplTab')
  await ui.press({ key: 'session-cost-toggle' })
  expect(state.open).toBe(true)
  await ui.press({ key: 'session-cost-toggle' })
  expect(state.open).toBe(false)
  await ui.unmount()
})

test('a collapsed band drops the cost text but keeps the toggle mounted', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, isCollapsed: true }, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /req/ })).toBeUndefined()
  const button = await ui.find({ type: 'Button', key: 'session-cost-toggle' })
  expect(button?.props.action).toBe('app:toggleReplTab')
  await ui.press({ key: 'session-cost-toggle' })
  expect(state.open).toBe(true)
  await ui.unmount()
})

test('the slash command toggles the pane, switches views and resets', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  const run = (args: string) =>
    $.command.run({ command: 'session-cost', args, origin: { kind: 'unclassified' }, presentation: { isFullscreen: true, columns: 160 } })

  expect((await run('')).text).toMatch(/opened/)
  expect(state.open).toBe(true)
  expect((await run('')).text).toMatch(/closed/)
  expect(state.open).toBe(false)
  expect((await run('models')).text).toMatch(/models view/)
  expect(state.open).toBe(true)

  expect((await run('reset')).text).toMatch(/cleared/)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /0 req/ })).toBeDefined()
  await ui.unmount()
})

test('after a reset, the saved history holds only what the session spent since', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const run = (args: string) =>
    $.command.run({ command: 'session-cost', args, origin: { kind: 'unclassified' }, presentation: { isFullscreen: true, columns: 160 } })
  const done = () => $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  await step($, 0)
  await done()
  await run('reset')
  await step($, 1)
  await done()

  // Seen from a later session, sess-1's saved row holds the one request after the reset.
  state.id = 'sess-2'
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'view:history' })
  const saved = await ui.find({ type: 'Text', text: /sess-1/ })
  expect(saved?.text).toMatch(/\$0\.020\s+1 req/)
  await ui.unmount()
})

test('a reset with no request after it leaves nothing in history', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })
  await $.command.run({ command: 'session-cost', args: 'reset', origin: { kind: 'unclassified' }, presentation: { isFullscreen: true, columns: 160 } })

  state.id = 'sess-2'
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'view:history' })
  expect(await ui.find({ type: 'Text', text: /This session/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /sess-1/ })).toBe(undefined)
  await ui.unmount()
})

/** Local time on a January 2027 day, after the mocked clock's start in any time zone. */
const jan = (d: number, h: number) => new Date(2027, 0, d, h).getTime()

test('a session that crosses midnight is split by day in the Days tab and in History', async ($, on) => {
  // An older session saved before days were kept: it counts whole on its last day.
  const old = { startedAt: jan(16, 9), lastAt: jan(16, 10), ledgerUsd: 1, estUsd: 1, requests: 5, input: 1, output: 1, cacheRead: 1, cacheWrite: 1 }
  const { clock } = engine(on, { 'session:old': old })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.set(jan(15, 23))
  await step($, 0)
  await clock.set(jan(16, 1))
  await step($, 1)
  await step($, 2)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  const run = (args: string) =>
    $.command.run({ command: 'session-cost', args, origin: { kind: 'unclassified' }, presentation: { isFullscreen: true, columns: 160 } })
  expect((await run('days')).text).toMatch(/days view/)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const sat = await ui.find({ type: 'Text', text: /Sat 16 Jan/ })
    expect(sat?.text).toMatch(/\$0\.040\s+2 req\s+\$1\.040\s+2 sess/)
    expect(sat?.text).toMatch(/today/)
    expect((await ui.find({ type: 'Text', text: /Fri 15 Jan/ }))?.text).toMatch(/\$0\.020\s+1 req\s+\$0\.020\s+1 sess/)
    expect(await ui.find({ type: 'Text', text: /spans 2 days/ })).toBeDefined()

    await ui.press({ key: 'view:history' })
    expect((await ui.find({ type: 'Text', text: /^Today/ }))?.text).toMatch(/\$1\.040\s+7 req/)
    expect((await ui.find({ type: 'Text', text: /^Last 7 days/ }))?.text).toMatch(/\$1\.060\s+8 req/)

    await ui.press({ key: 'view:requests' })
    expect(await ui.find({ type: 'Text', text: /── Fri 15 Jan ──/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /── Sat 16 Jan ──/ })).toBeDefined()
    await ui.press({ key: 'view:days' })
    await ui.unmount()
  }
})

test('each request row carries a 7-cell bar scaled to the slowest request, with its duration on it', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  state.stepMs.push(1000, 4000, 2000)
  await step($, 0)
  await step($, 1)
  await step($, 2)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const bar = async (seq: number) => {
      const row = await ui.find({ type: 'Text', text: new RegExp(`^#${seq} `) })
      const kids = (row?.children ?? []) as (Node | string)[]
      const strip = kids.find(c => typeof c !== 'string' && c.type === 'Text' && c.children.some(cc => typeof cc !== 'string' && cc.props?.backgroundColor))
      const [fill, track] = (typeof strip === 'string' ? [] : strip?.children ?? []).filter((c): c is Node => typeof c !== 'string')
      const text = (el: typeof fill) => (typeof el === 'string' || !el ? undefined : el.children.join(''))
      return { fill: text(fill), track: text(track), color: fill?.props?.backgroundColor, trackColor: track?.props?.backgroundColor }
    }
    // #2 is the slowest (4.0s): full and highlighted.
    expect(await bar(2)).toEqual({ fill: '   4.0s', track: '', color: 'warning', trackColor: 'subtle' })
    expect(await bar(3)).toEqual({ fill: '   2', track: '.0s', color: 'suggestion', trackColor: 'subtle' })
    expect(await bar(1)).toEqual({ fill: '  ', track: ' 1.0s', color: 'suggestion', trackColor: 'subtle' })
    await ui.unmount()
  }
})

test('a request with no measured time shows no bar', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(JSON.stringify(await ui.find({ type: 'Text', text: /^#1 / }))).not.toContain('backgroundColor')
  await ui.unmount()
})

test('a request that called tools names them in place of the bare stop reason', async ($, on) => {
  const { state } = engine(on)
  state.stepTools.push(['Read', 'mcp__github__create_issue', 'Read'], [])
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  await step($, 1)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const called = (await ui.find({ type: 'Text', text: /^#1 / }))?.text
    expect(called).toMatch(/→ Read ×2, create_issue/)
    expect(called).not.toMatch(/tool_use/)
    expect((await ui.find({ type: 'Text', text: /^#2 / }))?.text).toMatch(/end_turn/)
    await ui.unmount()
  }
})

test('cache reads are green and cache writes red, more vivid the larger their share of the prompt', async ($, on) => {
  const { state } = engine(on)
  // Newest first in the pane: #3 neither read nor wrote, #2 mostly wrote, #1 mostly read.
  state.stepCache.push({ read: 40_000, write: 2000 }, { read: 800, write: 38_000 }, { read: 0, write: 0 })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await step($, 0)
  await step($, 1)
  await step($, 2)
  await $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const reads = await ui.findAll({ type: 'Text', text: /^cr / })
    const writes = await ui.findAll({ type: 'Text', text: /^cw / })
    expect(reads.map(r => r.props.color)).toEqual([undefined, '#9bd3a4', '#0a8a2a'])
    expect(writes.map(w => w.props.color)).toEqual([undefined, '#d01919', '#e3a6a6'])
    // A zero count has no hue: it is dimmed instead.
    expect(reads[0]?.props.dimColor).toBe(true)
    expect(reads[2]?.props.dimColor).toBe(false)
    await ui.unmount()
  }
})

test('the Version tab shows the installed version and says when a newer one is published', async ($, on) => {
  const { clock, state } = engine(on)
  const published = { version: '9.9.9', status: 200, fetched: 0 }
  on('fs.read', () => ({ value: '{"name":"session-cost","version":"0.4.0"}' }))
  on('session.version', () => ({ value: { version: '2.1.322' } as never }))
  on('http.fetch', () => {
    published.fetched += 1
    return { value: { status: published.status, ok: published.status === 200, headers: {}, text: JSON.stringify({ version: published.version }) } }
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    published.version = '9.9.9'
    published.status = 200
    const ui = await $.ui.mount({ ...PANE, surface })
    // The first opening checks by itself; a later surface asks for a fresh check.
    const isFirst = published.fetched === 0
    await ui.press({ key: 'view:version' })
    if (isFirst) {
      expect(published.fetched).toBe(1)
      expect(await ui.find({ type: 'Text', text: /Update available/ })).toBeDefined()
    }
    await ui.press({ key: 'version:check' })
    expect(await ui.find({ type: 'Text', text: /^0\.4\.0$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Update available: 0\.4\.0 → 9\.9\.9/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2\.1\.322/ })).toBeDefined()

    // Opening the tab again within a day does not ask the network again; the button does.
    const before = published.fetched
    await ui.press({ key: 'view:requests' })
    await ui.press({ key: 'view:version' })
    expect(published.fetched).toBe(before)
    published.version = '0.4.0'
    await ui.press({ key: 'version:check' })
    expect(published.fetched).toBe(before + 1)
    expect(await ui.find({ type: 'Text', text: /Up to date/ })).toBeDefined()

    published.status = 404
    await ui.press({ key: 'version:check' })
    expect(await ui.find({ type: 'Text', text: /update check failed: HTTP 404/ })).toBeDefined()

    // A day later the tab checks by itself.
    published.status = 200
    await clock.set((state.now += 25 * 60 * 60 * 1000))
    await ui.press({ key: 'view:requests' })
    await ui.press({ key: 'view:version' })
    expect(await ui.find({ type: 'Text', text: /Up to date/ })).toBeDefined()
    await ui.press({ key: 'view:requests' })
    await ui.unmount()
  }
})
