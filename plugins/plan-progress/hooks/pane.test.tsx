import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const PANE = {
  plugin: 'plan-progress',
  component: 'Pane',
  requestId: 'plan-progress',
  props: {
    title: 'Plan progress',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

const PLAN = `## Phase 1: Build

- Write the hooks module
- Write the tests
`

function engine(on: On) {
  let created = 0
  on('command.register', () => ({ value: { command: 'plan-progress' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__plan-progress__mark_step' } }))
  let open = false
  on('ui.open', () => { open = true; return { value: { isPlaced: true } } })
  on('ui.close', () => { open = false; return { value: undefined } })
  on('ui.panes', () => ({ value: open ? [{ id: 'plan-progress', title: 'Plan progress', isShown: true, isFocused: false, isPlaced: true }] : [] }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  mock.env(on, { HOME: '/home/me' })
  on('fs.list', () => ({ value: [] }))
  on('fs.read', () => ({ value: PLAN }))
  on('fs.stat', () => ({ value: { kind: 'file', size: PLAN.length, mtimeMs: 1, isLink: false } }))
  on('tool.call', { tool: 'ExitPlanMode' }, () => ({ result: { plan: PLAN, isAgent: false, filePath: '/home/me/.claude/plans/x.md' } }))
  on('tool.call', { tool: 'TaskCreate' }, (_, e) => ({ result: { task: { id: `t${++created}`, subject: e.subject } } }))
  on('tool.call', { tool: 'TaskUpdate' }, (_, e) => ({ result: { success: true, taskId: e.taskId, updatedFields: ['status'] } }))
}

test('the pane shows the plan phases and the task progress, on every surface', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'ExitPlanMode' })
  await $.tool.call({ tool: 'TaskCreate', subject: 'Write the hooks module', description: 'd', activeForm: 'Writing the hooks module' })
  await $.tool.call({ tool: 'TaskCreate', subject: 'Write the tests', description: 'd' })
  await $.tool.call({ tool: 'TaskUpdate', taskId: 't1', status: 'completed' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /Phase 1: Build/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /50%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /1\/2 done/ })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: /Write the hooks module/ }))?.text).toMatch(/^✓/)
    expect((await ui.find({ type: 'Text', text: /Write the tests/ }))?.text).toMatch(/^·/)

    await ui.press({ key: 'view:plan' })
    expect(await ui.find({ type: 'Markdown', text: /Phase 1: Build/ })).toBeDefined()
    await ui.press({ key: 'view:progress' })
    expect(await ui.find({ type: 'Markdown' })).toBeUndefined()
    await ui.unmount()
  }
})

test('the slash command opens the pane and switches the view', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ran = await $.command.run({
    command: 'plan-progress',
    args: 'plan',
    origin: { kind: 'unclassified' },
    presentation: { isFullscreen: true, columns: 160 },
  })
  expect(ran.text).toMatch(/plan view/)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /No plan yet/ })).toBeDefined()
  await ui.unmount()
})

const RUN = { command: 'plan-progress', origin: { kind: 'unclassified' }, presentation: { isFullscreen: true, columns: 160 } } as const

test('the slash command without arguments toggles the pane', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect((await $.command.run({ ...RUN, args: '' })).text).toMatch(/closed/)
  expect((await $.command.run({ ...RUN, args: '' })).text).toMatch(/opened/)
  expect((await $.command.run({ ...RUN, args: 'off' })).text).toMatch(/closed/)
  expect((await $.command.run({ ...RUN, args: 'on' })).text).toMatch(/opened/)
})

test('autoOpen false leaves the pane closed at session start', { options: { autoOpen: false, statusLine: false } }, async ($, on) => {
  let opened = 0
  on('command.register', () => ({ value: { command: 'plan-progress' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__plan-progress__mark_step' } }))
  on('ui.open', () => { opened++; return { value: { isPlaced: true } } })
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(opened).toBe(0)
})

test('with no tasks, the model marks plan steps through mark_step and the pane counts them', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const exit = await $.tool.call({ tool: 'ExitPlanMode' })
  expect(exit.context?.join('\n')).toMatch(/mcp__plan-progress__mark_step[\s\S]*1\.2 Write the tests/)

  const ran = await $.tool.call({ tool: 'mcp__plan-progress__mark_step', steps: ['1.1'], status: 'completed' })
  expect(String(ran.result)).toMatch(/1\/2 \(50%\)/)
  await $.tool.call({ tool: 'mcp__plan-progress__mark_step', steps: ['1.2'], status: 'in_progress' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /50%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /1\/2 done \(plan\)/ })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: /1\.1 Write the hooks module/ }))?.text).toMatch(/^✓/)
    expect((await ui.find({ type: 'Text', text: /1\.2 Write the tests/ }))?.text).toMatch(/^▶/)
    await ui.unmount()
  }

  await $.tool.call({ tool: 'mcp__plan-progress__mark_step', steps: ['1'], status: 'completed' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /100%/ })).toBeDefined()
  await ui.unmount()
})
