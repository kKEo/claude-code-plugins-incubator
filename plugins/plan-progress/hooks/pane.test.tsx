import { expect, test } from 'claude-code/testing'
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
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
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
