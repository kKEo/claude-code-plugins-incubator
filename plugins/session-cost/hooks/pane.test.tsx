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
  on('prompt.submit', (_, e) => ({ text: e.text }))
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

const typed = (text: string) => ({ text, wait: false, origin: { kind: 'composer' } as const })
const done = ($: Engine) => $.turn.complete({ turnId: 'turn-1', answer: 'done', durationMs: 10, isAborted: false, reason: 'answer' })

/** The Recent sessions row of a saved session, as a later session's History tab shows it. */
async function recentRow($: Engine, id: string) {
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'view:history' })
  const found = await ui.find({ type: 'Text', text: new RegExp(id) })
  await ui.unmount()
  return found?.text
}

test('a session without a title is named in Recent sessions by its first prompt', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.prompt.submit(typed('Clone   the incubator\nrepo please'))
  await step($, 0)
  await done($)
  await $.prompt.submit(typed('and now something else'))
  await step($, 1)
  await done($)

  state.id = 'sess-2'
  expect(await recentRow($, 'sess-1')).toMatch(/2 req sess-1\s+Clone the incubator repo please$/)
})

/** A transcript the test writes to, read by the mod as the engine's file system would. */
function transcript(on: On) {
  const file = { path: '/home/u/.claude/projects/p/sess-1.jsonl', text: '' }
  on('session.info', () => ({ value: { transcriptPath: file.path } }))
  on('fs.stat', (_, e) => (e.path === file.path ? { value: { kind: 'file', size: file.text.length, mtimeMs: 0, isLink: false } } : { deny: 'ENOENT' }))
  on('fs.read', (_, e) => {
    if (e.path !== file.path) return { deny: 'ENOENT' }
    const from = e.offset ?? 0
    return { value: file.text.slice(from, e.length === undefined ? undefined : from + e.length) }
  })
  const append = (row: object) => {
    file.text += JSON.stringify(row) + '\n'
  }
  return { file, append }
}

test('names in Recent sessions start in one column, a long one cut short, and a session with none shows its id alone', async ($, on) => {
  const saved = { startedAt: 0, ledgerUsd: 1, estUsd: 1, requests: 5, input: 1, output: 1, cacheRead: 1, cacheWrite: 1 }
  const now = 1_800_000_000_000
  engine(on, {
    'session:a': { ...saved, lastAt: now - 3000, name: 'Short' },
    'session:0123456789abcdef': { ...saved, lastAt: now - 2000 },
    'session:old-one': { ...saved, lastAt: now - 1000 },
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'view:history' })
  // The id takes 8 cells, padded or cut, then two spaces before the name.
  expect((await ui.find({ type: 'Text', text: /Short$/ }))?.text).toMatch(/5 req a {9}Short$/)
  expect((await ui.find({ type: 'Text', text: /old-one/ }))?.text).toMatch(/5 req old-one$/)
  expect((await ui.find({ type: 'Text', text: /01234567/ }))?.text).toMatch(/5 req 01234567$/)
  await ui.unmount()
})

test('after /clear the next conversation is named by its own first prompt, and only the person\'s prompts name one', async ($, on) => {
  const { state } = engine(on)
  on('session.end', (_, e) => ({ sessionId: e.sessionId }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'a message from a peer', wait: false, origin: { kind: 'peer', from: 'x' } as never })
  await $.prompt.submit(typed('First conversation'))
  await step($, 0)
  await done($)
  await $.session.end({ reason: 'clear', sessionId: 'sess-1', resume: { id: 'sess-1' } })

  state.id = 'sess-2'
  await $.prompt.submit(typed('Second conversation'))
  await step($, 1)
  await done($)

  state.id = 'sess-3'
  expect(await recentRow($, 'sess-1')).toMatch(/sess-1\s+First conversation$/)
  expect(await recentRow($, 'sess-2')).toMatch(/sess-2\s+Second conversation$/)
})

test('a long first prompt is kept cut short, ending in an ellipsis', async ($, on) => {
  const { state } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.prompt.submit(typed(`Explain ${'very '.repeat(30)}carefully`))
  await step($, 0)
  await done($)
  state.id = 'sess-2'
  const name = (await recentRow($, 'sess-1'))?.replace(/^.*? req sess-1\s+/, '') ?? ''
  expect(name).toMatch(/^Explain very very .*…$/)
  expect(name.length).toBe(60)
})

test('a title from the transcript names the session over its first prompt, a custom one over an AI one', async ($, on) => {
  const { state } = engine(on)
  const { append } = transcript(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  append({ type: 'user', message: { role: 'user', content: 'Clone the incubator repo' }, sessionId: 'sess-1' })
  await $.prompt.submit(typed('Clone the incubator repo'))
  await step($, 0)
  append({ type: 'ai-title', aiTitle: 'Cloning the incubator', sessionId: 'sess-1' })
  await done($)
  state.id = 'sess-2'
  expect(await recentRow($, 'sess-1')).toMatch(/sess-1\s+Cloning the incubator$/)

  state.id = 'sess-1'
  append({ type: 'custom-title', customTitle: 'incubator', sessionId: 'sess-1' })
  append({ type: 'ai-title', aiTitle: 'Cloning and testing the incubator', sessionId: 'sess-1' })
  await step($, 1)
  await done($)
  state.id = 'sess-2'
  expect(await recentRow($, 'sess-1')).toMatch(/sess-1\s+incubator$/)
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

test('every tab shows the installed version in its header', async ($, on) => {
  engine(on)
  on('fs.read', () => ({ value: '{"name":"session-cost","version":"0.4.0"}' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Button', key: 'view:version' })).toBeUndefined()
    for (const tab of ['requests', 'models', 'history', 'days']) {
      await ui.press({ key: `view:${tab}` })
      expect(await ui.find({ type: 'Text', text: /v0\.4\.0/ })).toBeDefined()
    }
    await ui.unmount()
  }
})
