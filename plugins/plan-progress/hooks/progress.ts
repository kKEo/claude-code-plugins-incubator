import type { PlanStatus, PlanTask, PlanTodo } from '../types'

export type PlanStep = {
  text: string
  status: PlanStatus
  /** True when a plan checkbox set the status. */
  isFromPlan: boolean
  /** `<phase>.<step>`, both counted from 1, as `mark_step` takes it; '' on a live item. */
  id: string
}
export type PlanPhase = { title: string; steps: PlanStep[]; id: string }
/** Statuses the model recorded with `mark_step`, keyed by `stepKey`. */
export type PlanMarks = Readonly<Record<string, PlanStatus>>
export type Progress = {
  done: number
  total: number
  percent: number
  phases: PlanPhase[]
  /** Live items (tasks or todos) that matched no plan step. */
  unmatched: PlanStep[]
  /** What is being worked on now, if anything. */
  current: string | undefined
  /** Where the counts come from. */
  source: 'tasks' | 'todos' | 'plan' | 'none'
}

const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/
const BULLET = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/
const CHECKBOX = /^\[([ xX])\]\s*(.*)$/
const FENCE = /^\s*(```|~~~)/
/** A heading that names a unit of work. */
const WORK_HEADING = /\b(phase|stage|milestone)\b|\b(step|part)\s*\d|^\s*\d+[.)]\s/i
/** Sections that describe the plan rather than list its work. */
const NOTE_HEADING = /^(context|background|overview|summary|motivation|goals?|non-goals?|notes?|facts|findings|assumptions|open questions|questions|risks?|out of scope|references?|links)\b/i

/** Lowercases, strips markdown marks and punctuation, squeezes spaces. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, m => m.slice(1, -1))
    .replace(/[*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Splits the plan's markdown into phases of steps; top-level bullets are
 * steps, a checkbox sets the step's status, text in code fences is ignored.
 *
 * Which headings open phases: when some heading names a unit of work
 * ("Phase 2: …", "Step 3", "1. Setup"), only those do, and deeper headings
 * inside one fold into it; otherwise every heading does but note sections
 * ("Context", "Open questions", …) are skipped. A leading H1 is the plan's
 * title. Steps before any heading form an implicit first phase. */
export function parsePlan(markdown: string): PlanPhase[] {
  const lines = markdown.split(/\r?\n/)
  const headings: Array<{ level: number; title: string } | undefined> = []
  let inFence = false
  let fenceMark = ''
  for (const raw of lines) {
    const fence = raw.match(FENCE)
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1] ?? '' }
      else if ((fence[1] ?? '') === fenceMark) inFence = false
      headings.push(undefined)
      continue
    }
    const heading = inFence ? null : raw.match(HEADING)
    headings.push(heading ? { level: heading[1]?.length ?? 1, title: (heading[2] ?? '').replace(/\*\*/g, '') } : undefined)
  }
  const hasWorkHeadings = headings.some(h => h && WORK_HEADING.test(h.title))

  const phases: PlanPhase[] = []
  let current: PlanPhase | undefined
  /** The level of the heading that opened `current`, 0 for the implicit phase. */
  let currentLevel = 0
  /** False inside a section whose bullets are not steps. */
  let isCounting = true
  let isFirstHeading = true
  /** The indent of the section's outermost bullets; deeper ones are details of a step. */
  let baseIndent: number | undefined
  inFence = false
  fenceMark = ''
  lines.forEach((raw, i) => {
    const fence = raw.match(FENCE)
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1] ?? '' }
      else if ((fence[1] ?? '') === fenceMark) inFence = false
      return
    }
    if (inFence) return
    const heading = headings[i]
    if (heading) {
      baseIndent = undefined
      const wasFirst = isFirstHeading
      isFirstHeading = false
      if (wasFirst && heading.level === 1 && !WORK_HEADING.test(heading.title)) return
      const isWork = WORK_HEADING.test(heading.title)
      if (hasWorkHeadings && !isWork) {
        // A sub-heading of a phase keeps adding to it; any other heading pauses counting.
        isCounting = current !== undefined && currentLevel > 0 && heading.level > currentLevel && isCounting
        return
      }
      if (!hasWorkHeadings && NOTE_HEADING.test(heading.title.trim())) {
        isCounting = false
        return
      }
      current = { title: heading.title, steps: [], id: String(phases.length + 1) }
      currentLevel = heading.level
      isCounting = true
      phases.push(current)
      return
    }
    if (!isCounting) return
    const bullet = raw.match(BULLET)
    if (!bullet) return
    const indent = raw.length - raw.trimStart().length
    baseIndent ??= indent
    if (indent > baseIndent || indent > 3) return
    let text = bullet[1] ?? ''
    let status: PlanStatus = 'pending'
    const box = text.match(CHECKBOX)
    let isFromPlan = false
    if (box) {
      isFromPlan = true
      status = box[1] === ' ' ? 'pending' : 'completed'
      text = box[2] ?? ''
    }
    text = text.replace(/\*\*/g, '').trim()
    if (text === '') return
    if (!current) {
      if (hasWorkHeadings) return
      current = { title: 'Plan', steps: [], id: String(phases.length + 1) }
      currentLevel = 0
      phases.push(current)
    }
    current.steps.push({ text, status, isFromPlan, id: `${current.id}.${current.steps.length + 1}` })
  })
  return phases
}

/** The key a mark is stored under: the step's text, so edits that move steps keep their marks. */
export function stepKey(text: string): string {
  return normalise(text)
}

/** Resolves `mark_step` references to step keys: "2" is every step of phase 2,
 * "2.3" its third step, anything else the step whose text it names best. */
export function resolveSteps(phases: readonly PlanPhase[], refs: readonly string[]): { keys: string[]; unknown: string[] } {
  const keys: string[] = []
  const unknown: string[] = []
  for (const raw of refs) {
    const ref = raw.trim().replace(/^(phase|step)\s*/i, '')
    const phase = phases.find(p => p.id === ref)
    if (phase) {
      if (phase.steps.length === 0) unknown.push(raw)
      keys.push(...phase.steps.map(s => stepKey(s.text)))
      continue
    }
    let step = phases.flatMap(p => p.steps).find(s => s.id === ref)
    if (!step) {
      let best = 0
      for (const s of phases.flatMap(p => p.steps)) {
        const score = similarity(s.text, raw)
        if (score > best) { best = score; step = s }
      }
    }
    if (step) keys.push(stepKey(step.text))
    else unknown.push(raw)
  }
  return { keys, unknown }
}

/** The plan as `mark_step` and the approval note show it to the model: one line per step with its id. */
export function outline(phases: readonly PlanPhase[]): string {
  const mark: Record<PlanStatus, string> = { pending: '[ ]', in_progress: '[>]', completed: '[x]' }
  return phases
    .filter(p => p.steps.length > 0)
    .map(p => [`${p.id}. ${p.title}`, ...p.steps.map(s => `  ${mark[s.status]} ${s.id} ${s.text}`)].join('\n'))
    .join('\n')
}

const rank: Record<PlanStatus, number> = { pending: 0, in_progress: 1, completed: 2 }

const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'then', 'its', 'our', 'are', 'all', 'one', 'two', 'per', 'via', 'each', 'any', 'not'])

function words(text: string): Set<string> {
  return new Set(normalise(text).split(' ').filter(w => w.length > 2 && !STOP.has(w)))
}

/** How well a live item names a plan step: 1 for the same text or one holding
 * the other, else the share of meaningful words they share; 0 below the bar. */
export function similarity(step: string, item: string): number {
  const a = normalise(step)
  const b = normalise(item)
  if (a === '' || b === '') return 0
  if (a === b || a.includes(b) || b.includes(a)) return 1
  const wa = words(a)
  const wb = words(b)
  if (wa.size === 0 || wb.size === 0) return 0
  let shared = 0
  for (const w of wb) if (wa.has(w)) shared++
  const score = shared / Math.max(wa.size, wb.size)
  return score >= 0.6 ? score : 0
}

export function progressOf(planText: string, tasks: readonly PlanTask[], todos: readonly PlanTodo[], marks: PlanMarks = {}): Progress {
  const phases = parsePlan(planText)
  for (const step of phases.flatMap(p => p.steps)) {
    const marked = marks[stepKey(step.text)]
    if (marked) step.status = marked
  }
  const live: PlanStep[] =
    tasks.length > 0
      ? tasks.map(t => ({ text: t.subject, status: t.status, isFromPlan: false, id: '' }))
      : todos.map(t => ({ text: t.content, status: t.status, isFromPlan: false, id: '' }))
  const hasSteps = phases.some(p => p.steps.length > 0)
  const source: Progress['source'] = tasks.length > 0 ? 'tasks' : todos.length > 0 ? 'todos' : hasSteps ? 'plan' : 'none'

  const unmatched: PlanStep[] = []
  const claimed = new Set<PlanStep>()
  for (const item of live) {
    let best: PlanStep | undefined
    let bestScore = 0
    for (const phase of phases) {
      for (const step of phase.steps) {
        const score = similarity(step.text, item.text) - (claimed.has(step) ? 0.5 : 0)
        if (score > bestScore) { best = step; bestScore = score }
      }
    }
    if (best && bestScore > 0) {
      claimed.add(best)
      if (rank[item.status] > rank[best.status] || best.status === 'pending') best.status = item.status
    } else unmatched.push(item)
  }

  let counted: PlanStep[]
  if (source === 'tasks' || source === 'todos') counted = live
  else if (source === 'plan') {
    // A plan with checkboxes counts its checkboxes; one without counts every step.
    const all = phases.flatMap(p => p.steps)
    const boxed = all.filter(s => s.isFromPlan)
    counted = boxed.length > 0 ? boxed : all
  } else counted = []
  const done = counted.filter(s => s.status === 'completed').length
  const total = counted.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const inProgress =
    tasks.find(t => t.status === 'in_progress') ?? todos.find(t => t.status === 'in_progress')
  const markedNow = phases.flatMap(p => p.steps).find(s => s.status === 'in_progress')
  const current = inProgress
    ? 'activeForm' in inProgress && inProgress.activeForm
      ? inProgress.activeForm
      : 'subject' in inProgress
        ? inProgress.subject
        : inProgress.content
    : markedNow?.text
  return { done, total, percent, phases, unmatched, current, source }
}

/** A text progress bar of `width` cells. */
export function bar(percent: number, width: number): string {
  const w = Math.max(4, width)
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * w)
  return '█'.repeat(filled) + '░'.repeat(w - filled)
}
