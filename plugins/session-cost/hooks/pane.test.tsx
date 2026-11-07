import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

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
    isWorking: false,
    maxRows: 6,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 6 },
    view: {},
  },
} as const

/** The engine beneath the plugin: a /cost ledger the test moves, panes, store and clock. */
function engine(on: On) {
  const state = { usd: 0.5, open: false }
  const clock = mock.clock(on, { now: 1_800_000_000_000 })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'session-cost' } }))
  on('ui.open', () => { state.open = true; return { value: { isPlaced: true } } })
  on('ui.close', () => { state.open = false; return { value: undefined } })
  on('ui.panes', () => ({ value: state.open ? [{ id: 'session-cost', title: 'Session cost', isShown: true, isFocused: false, isPlaced: true }] : [] }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'sess-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.usage', () => ({ value: { startedAt: 0, rateLimits: [], cost: { usd: state.usd } } as never }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  // The engine's own band beneath the plugin: empty.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  on('turn.step', async function* (_, e) {
    // The engine adds the response's cost to the ledger as it streams.
    state.usd += e.agentId ? 0.004 : 0.02
    return {
      turnId: e.turnId,
      index: e.index,
      answer: '',
      toolUses: [],
      stopReason: 'end_turn' as const,
      usage: { model: e.agentId ? 'claude-haiku-5-5' : 'claude-opus-5-5', input_tokens: 1200, output_tokens: 300, cache_read_input_tokens: 40_000, cache_creation_input_tokens: 2000 },
    }
  })
  return { state, clock }
}

async function step($: Engine, index: number, agentId?: string) {
  const stream = $.turn.step({ turnId: 'turn-1', index, model: 'claude-opus-5-5', messageCount: 3, ...(agentId ? { agentId } : {}) })
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
