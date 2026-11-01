import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { PlanSource, PlanStatus, PlanTask, PlanTodo, PlanView } from '../types'
import { bar, progressOf } from './progress'

const PANE = 'plan-progress'
const TITLE = 'Plan progress'
const COMMAND = 'plan-progress'

const EMPTY_PLAN: PlanSource = { path: null, text: '', mtimeMs: 0, isPlanMode: false }
const plan = atom({ plugin: 'plan-progress', key: 'plan' } as const, EMPTY_PLAN)
const tasks = atom({ plugin: 'plan-progress', key: 'tasks' } as const, [] as PlanTask[])
const todos = atom({ plugin: 'plan-progress', key: 'todos' } as const, [] as PlanTodo[])
const view = atom({ plugin: 'plan-progress', key: 'view' } as const, 'progress' as PlanView)

type Engine = EngineInterface

/** Reads the plan file into state; a missing file leaves the path and clears the text. */
async function loadPlan($: Engine, path: string, isPlanMode?: boolean): Promise<void> {
  let text = ''
  let mtimeMs = 0
  try {
    text = await $.fs.read(path)
    mtimeMs = (await $.fs.stat(path)).mtimeMs
  } catch {
    text = ''
  }
  await update($, plan, old => ({
    path,
    text,
    mtimeMs,
    isPlanMode: isPlanMode ?? old?.isPlanMode ?? false,
  }))
  await refreshStatus($)
}

async function plansFolder($: Engine): Promise<string | undefined> {
  const home = await $.env.get('HOME')
  return home ? `${home}/.claude/plans` : undefined
}

/** The newest `*.md` under ~/.claude/plans, for a mod loaded after planning. */
async function newestPlan($: Engine): Promise<string | undefined> {
  const folder = await plansFolder($)
  if (!folder) return undefined
  try {
    const entries = await $.fs.list(folder)
    const newest = entries
      .filter(f => f.kind === 'file' && f.name.endsWith('.md'))
      .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
    return newest ? `${folder}/${newest.name}` : undefined
  } catch {
    return undefined
  }
}

async function refreshStatus($: Engine): Promise<void> {
  const [p, t, d] = await Promise.all([read($, plan), read($, tasks), read($, todos)])
  const progress = progressOf(p?.text ?? '', t ?? [], d ?? [])
  if (!p?.path && progress.total === 0) {
    $.ui.status(undefined)
    return
  }
  const head = p?.isPlanMode ? 'planning' : 'plan'
  const count = progress.total > 0 ? ` ${progress.done}/${progress.total} ✓` : ''
  const now = progress.current ? ` · ${progress.current}` : ''
  $.ui.status(`${head}${count}${now}`)
}

const glyph: Record<PlanStatus, string> = { pending: '·', in_progress: '▶', completed: '✓' }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Show the plan and its progress in a pane',
      argumentHint: '[plan|progress|<path to plan.md>]',
    })
    if (e.surface !== null && e.isInteractive) void $.ui.open({ id: PANE, title: TITLE })
    await refreshStatus($)
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'plan' || arg === 'progress') {
      await update($, view, () => arg)
      await $.ui.open({ id: PANE, title: TITLE })
      return { text: `Plan progress pane: ${arg} view.` }
    }
    if (arg !== '') {
      await loadPlan($, arg)
      await update($, view, () => 'plan')
      await $.ui.open({ id: PANE, title: TITLE })
      return { text: `Plan loaded from ${arg}.` }
    }
    const current = await read($, plan)
    if (!current?.path) {
      const found = await newestPlan($)
      if (found) await loadPlan($, found)
    }
    const opened = await $.ui.open({ id: PANE, title: TITLE })
    const p = await read($, plan)
    const where = p?.path ? `showing ${p.path}` : 'no plan known yet; enter plan mode or pass a path'
    return { text: opened.isPlaced ? `Plan progress pane opened, ${where}.` : `Plan progress pane waits for a wider terminal (${opened.reason}); ${where}.` }
  })

  // The plan's location arrives with the plan-mode reminders the engine injects.
  on('prompt.attachment', { type: ['plan_mode', 'plan_mode_reentry', 'plan_mode_exit'] }, async ($, e, next) => {
    if (e.agentId === undefined) {
      const detail = e.detail
      if (detail) {
        const isPlanMode = e.type !== 'plan_mode_exit'
        await loadPlan($, detail.planFilePath, isPlanMode)
      }
    }
    return next(e)
  })

  on('tool.call', { tool: 'ExitPlanMode' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && !ran.deny && !ran.isError && ran.result) {
      const result = ran.result as { plan?: string | null; filePath?: string }
      if (result.filePath) await loadPlan($, result.filePath, false)
      else if (result.plan) {
        await update($, plan, old => ({ ...(old ?? EMPTY_PLAN), text: result.plan ?? '', isPlanMode: false }))
        await refreshStatus($)
      } else await update($, plan, old => ({ ...(old ?? EMPTY_PLAN), isPlanMode: false }))
    }
    return ran
  }).catch(($, e, next) => next(e))

  // The model edits the plan file: re-read it.
  on('tool.call', { tool: ['Write', 'Edit'] }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny || ran.isError) return ran
    const path = String((e as { file_path?: unknown }).file_path ?? '')
    if (path === '') return ran
    const known = (await read($, plan))?.path
    const folder = known ? undefined : await plansFolder($)
    const isPlan = known ? path === known : folder !== undefined && path.startsWith(folder + '/') && path.endsWith('.md')
    if (isPlan) await loadPlan($, path)
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && !ran.deny && !ran.isError && ran.result) {
      const { task } = ran.result as { task: { id: string; subject: string } }
      await update($, tasks, list => [
        ...(list ?? []).filter(t => t.id !== task.id),
        { id: task.id, subject: task.subject, status: 'pending' as PlanStatus, activeForm: e.activeForm, blockedBy: [] as string[] },
      ])
      await refreshStatus($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && !ran.deny && !ran.isError) {
      await update($, tasks, list => {
        const all = list ?? []
        if (e.status === 'deleted') return all.filter(t => t.id !== e.taskId)
        const found = all.find(t => t.id === e.taskId)
        const merged: PlanTask = {
          id: e.taskId,
          subject: e.subject ?? found?.subject ?? e.taskId,
          status: e.status ?? found?.status ?? 'pending',
          activeForm: e.activeForm ?? found?.activeForm,
          blockedBy: [...(found?.blockedBy ?? []), ...(e.addBlockedBy ?? [])],
        }
        return found ? all.map(t => (t.id === e.taskId ? merged : t)) : [...all, merged]
      })
      await refreshStatus($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TaskList' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && !ran.deny && !ran.isError && ran.result) {
      const { tasks: listed } = ran.result as {
        tasks: Array<{ id: string; subject: string; status: PlanStatus; blockedBy: string[] }>
      }
      await update($, tasks, old =>
        listed.map(t => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          activeForm: (old ?? []).find(o => o.id === t.id)?.activeForm,
          blockedBy: t.blockedBy ?? [],
        })),
      )
      await refreshStatus($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && !ran.deny && !ran.isError) {
      await update($, todos, () => e.todos.map(t => ({ content: t.content, status: t.status, activeForm: t.activeForm })))
      await refreshStatus($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const [p, t, d, v] = await Promise.all([read($, plan), read($, tasks), read($, todos), read($, view)])
    const source = p ?? EMPTY_PLAN
    const mode: PlanView = v ?? 'progress'
    const progress = progressOf(source.text, t ?? [], d ?? [])
    const columns = Math.max(20, e.props.bodyColumns)
    const fileName = source.path ? source.path.split('/').pop() ?? source.path : undefined
    const barWidth = Math.max(6, Math.min(30, columns - 20))

    const header = (
      <Box flexDirection="row" gap={1}>
        <Button key="view:progress" hotkey="g" variant={mode === 'progress' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'progress')}>
          Progress
        </Button>
        <Button key="view:plan" hotkey="p" variant={mode === 'plan' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'plan')}>
          Plan
        </Button>
        {source.isPlanMode && <Text color="planMode">plan mode</Text>}
      </Box>
    )

    const summary = (
      <Box flexDirection="column">
        <Text>
          <Text color={progress.percent === 100 ? 'success' : 'claude'}>{bar(progress.percent, barWidth)}</Text>
          <Text tabular> {progress.percent}%</Text>
          <Text dimColor>  {progress.done}/{progress.total} done{progress.source === 'none' ? '' : ` (${progress.source})`}</Text>
        </Text>
        {progress.current && (
          <Text>
            <Text color="warning">▶ </Text>
            {progress.current}
          </Text>
        )}
        <Text dimColor>{fileName ?? 'no plan file yet'}</Text>
      </Box>
    )

    let body
    if (mode === 'plan') {
      body = source.text.trim() === ''
        ? <Text dimColor>No plan yet. Enter plan mode, or run /{COMMAND} &lt;path&gt; to load one.</Text>
        : <Markdown text={source.text} />
    } else {
      const rows = progress.phases.map((phase, i) => (
        <Box key={`phase:${i}`} flexDirection="column" marginTop={1}>
          <Text weight="bold">{phase.title}</Text>
          {phase.steps.map(step => (
            <Text dimColor={step.status === 'pending'} wrap="truncate-end">
              <Text color={step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'warning' : undefined}>{glyph[step.status]}</Text> {step.text}
            </Text>
          ))}
          {phase.steps.length === 0 && <Text dimColor>  (no steps listed)</Text>}
        </Box>
      ))
      const extra = progress.unmatched.length > 0 && (
        <Box key="unmatched" flexDirection="column" marginTop={1}>
          <Text weight="bold">{progress.phases.length > 0 ? 'Other tasks' : 'Tasks'}</Text>
          {progress.unmatched.map(step => (
            <Text dimColor={step.status === 'pending'} wrap="truncate-end">
              <Text color={step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'warning' : undefined}>{glyph[step.status]}</Text> {step.text}
            </Text>
          ))}
        </Box>
      )
      body = (
        <Box flexDirection="column">
          {rows}
          {extra}
          {progress.phases.length === 0 && progress.unmatched.length === 0 && (
            <Text dimColor>Nothing to track yet: no plan steps, tasks or todos.</Text>
          )}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        {header}
        {summary}
        {body}
      </Box>
    )
  })
}
