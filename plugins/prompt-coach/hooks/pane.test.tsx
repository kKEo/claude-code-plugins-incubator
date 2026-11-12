import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const PANE = {
  plugin: 'prompt-coach',
  component: 'Pane',
  requestId: 'prompt-coach',
  props: {
    title: 'Prompt coach',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const USAGE = { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }

/** The engine beneath the mod: a store, a clock, panes, and a coach that answers from a table. */
function engine(on: On, store: Record<string, unknown> = {}) {
  const state = { open: false, asked: [] as string[], toasts: [] as string[], replies: {} as Record<string, string>, isDown: false }
  const clock = mock.clock(on, { now: 1_800_000_000_000 })
  mock.store(on, store)
  on('command.register', () => ({ value: { command: 'prompt-coach' } }))
  on('ui.open', () => { state.open = true; return { value: { isPlaced: true } } })
  on('ui.close', () => { state.open = false; return { value: undefined } })
  on('ui.panes', () => ({ value: state.open ? [{ id: 'prompt-coach', title: 'Prompt coach', isShown: true, isFocused: false, isPlaced: true }] : [] }))
  on('ui.toast', (_, e) => { state.toasts.push(JSON.stringify(e)); return { value: undefined } })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('model.complete', (_, e) => {
    state.asked.push(e.prompt)
    if (state.isDown) return { value: { isAnswered: false, reason: 'api-error', status: 529, error: 'overloaded', usage: USAGE } as never }
    const hit = Object.keys(state.replies).find(k => e.prompt.includes(k))
    return { value: { isAnswered: true, text: hit === undefined ? '{"ok":true}' : state.replies[hit]!, usage: USAGE } as never }
  })
  return { state, clock }
}

const typed = { origin: { kind: 'composer' }, wait: false } as const

test('typed prompts are collected, checked and listed with their correction', async ($, on) => {
  const { state, clock } = engine(on)
  state.replies['He go home'] = '{"corrected":"He goes home every single day.","note":"Third person singular takes -s."}'
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: 'He go home every single day', ...typed } as never)
  await $.prompt.submit({ text: 'Please run the whole test suite again.', ...typed } as never)
  await $.prompt.submit({ text: 'yes', ...typed } as never)
  await clock.advance(50)

  expect(state.asked.length).toBe(2)
  expect(state.asked[0]).toMatch(/<prompt>/)
  expect(state.toasts.length).toBe(1)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /He go home every single day/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /→ He goes home every single day\./ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Third person singular/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /✓ fine/ })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: /corrected · / }))?.text).toMatch(/2 prompts · 1 corrected · 1 fine/)
    await ui.unmount()
  }
})

test('the practice tab shows a prompt, reveals its correct form and deals the next one', async ($, on) => {
  const { state, clock } = engine(on)
  state.replies['He go home'] = '{"corrected":"He goes home every single day.","note":"Verb agreement."}'
  state.replies['I has two'] = '{"corrected":"I have two failing tests.","note":"Have, not has."}'
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'He go home every single day', ...typed } as never)
  await $.prompt.submit({ text: 'I has two failing tests', ...typed } as never)
  await clock.advance(50)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'view:practice' })
  const first = (await ui.find({ type: 'Text', text: /He go home|I has two/ }))?.text ?? ''
  expect(first).not.toBe('')
  // The answer stays hidden until asked for.
  expect(await ui.find({ type: 'Text', text: /He goes home|I have two/ })).toBeUndefined()
  expect(await ui.find({ type: 'Button', key: 'answer:known' })).toBeUndefined()

  await ui.press({ key: 'reveal' })
  expect(await ui.find({ type: 'Text', text: /He goes home|I have two/ })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'reveal' })).toBeUndefined()

  await ui.press({ key: 'answer:known' })
  // The other prompt, its answer hidden again.
  const second = (await ui.find({ type: 'Text', text: /He go home|I has two/ }))?.text ?? ''
  expect(second).not.toBe(first)
  expect(await ui.find({ type: 'Button', key: 'reveal' })).toBeDefined()

  await ui.press({ key: 'reveal' })
  await ui.press({ key: 'answer:missed' })
  expect((await ui.find({ type: 'Text', text: /He go home|I has two/ }))?.text).toBe(first)
  expect(await ui.find({ type: 'Text', text: /1\/2 known/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Known 1× · not yet 0×/ })).toBeDefined()
  await ui.unmount()
})

test('the corpus outlives the session, and unchecked prompts are checked at the next start', async ($, on) => {
  const { state, clock } = engine(on, {
    'p:a': { id: 'a', at: 1_799_999_000_000, text: 'I has two failing tests', status: 'pending', tries: 1, known: 0, missed: 0 },
    'p:b': { id: 'b', at: 1_799_999_100_000, text: 'Fix the bug.', status: 'ok', tries: 0, known: 0, missed: 0 },
    'p:broken': { id: 7 },
  })
  state.replies['I has two'] = '{"corrected":"I have two failing tests.","note":"Have, not has."}'
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await clock.advance(2500)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /→ I have two failing tests\./ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /corrected · / }))?.text).toMatch(/2 prompts · 1 corrected · 1 fine/)
  await ui.unmount()
})

test('prompts nobody typed, commands and an unreachable model', async ($, on) => {
  const { state, clock } = engine(on)
  state.isDown = true
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'A background task has finished its long work', origin: { kind: 'task-notification' }, wait: false } as never)
  await $.prompt.submit({ text: 'He go home every single day', ...typed } as never)
  await $.prompt.submit({ text: 'I has two failing tests', ...typed } as never)
  await clock.advance(50)
  // A failure ends its run: each of the two runs asked once, and nothing was hammered.
  expect(state.asked.length).toBe(2)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /background task/ })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /corrected · / }))?.text).toMatch(/2 prompts · 0 corrected · 0 fine · 2 unchecked/)
  await ui.press({ key: 'view:practice' })
  expect(await ui.find({ type: 'Text', text: /Nothing to practise yet/ })).toBeDefined()
  await ui.unmount()

  expect((await $.command.run({ command: 'prompt-coach', args: 'clear' } as never) as { text: string }).text).toMatch(/removed 2/)
  expect((await $.command.run({ command: 'prompt-coach', args: '' } as never) as { text: string }).text).toMatch(/opened/)
  expect((await $.command.run({ command: 'prompt-coach', args: '' } as never) as { text: string }).text).toMatch(/closed/)
})
