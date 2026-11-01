import type { PlanStatus, PlanTask, PlanTodo } from '../types'

export type PlanStep = { text: string; status: PlanStatus; isFromPlan: boolean }
export type PlanPhase = { title: string; steps: PlanStep[] }
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

/** Splits the plan's markdown into phases of steps. Headings open phases
 * (a "Phase N" heading always does; the first phase is implicit for steps
 * before any heading); top-level bullets are steps, a checkbox sets the
 * step's status. Text inside code fences is ignored. */
export function parsePlan(markdown: string): PlanPhase[] {
  const phases: PlanPhase[] = []
  let current: PlanPhase | undefined
  let inFence = false
  let fenceMark = ''
  for (const raw of markdown.split(/\r?\n/)) {
    const fence = raw.match(FENCE)
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1] ?? '' }
      else if ((fence[1] ?? '') === fenceMark) inFence = false
      continue
    }
    if (inFence) continue
    const heading = raw.match(HEADING)
    if (heading) {
      const level = heading[1]?.length ?? 1
      const title = heading[2] ?? ''
      if (level === 1 && phases.length === 0 && !/phase/i.test(title)) continue
      current = { title, steps: [] }
      phases.push(current)
      continue
    }
    const bullet = raw.match(BULLET)
    if (!bullet) continue
    const indent = raw.length - raw.trimStart().length
    if (indent > 3) continue
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
    if (text === '') continue
    if (!current) {
      current = { title: 'Plan', steps: [] }
      phases.push(current)
    }
    current.steps.push({ text, status, isFromPlan })
  }
  return phases
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

export function progressOf(planText: string, tasks: readonly PlanTask[], todos: readonly PlanTodo[]): Progress {
  const phases = parsePlan(planText)
  const live: PlanStep[] =
    tasks.length > 0
      ? tasks.map(t => ({ text: t.subject, status: t.status, isFromPlan: false }))
      : todos.map(t => ({ text: t.content, status: t.status, isFromPlan: false }))
  const source: Progress['source'] =
    tasks.length > 0 ? 'tasks' : todos.length > 0 ? 'todos' : phases.some(p => p.steps.some(s => s.isFromPlan)) ? 'plan' : 'none'

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
  else if (source === 'plan') counted = phases.flatMap(p => p.steps.filter(s => s.isFromPlan))
  else counted = []
  const done = counted.filter(s => s.status === 'completed').length
  const total = counted.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const inProgress =
    tasks.find(t => t.status === 'in_progress') ?? todos.find(t => t.status === 'in_progress')
  const current = inProgress
    ? 'activeForm' in inProgress && inProgress.activeForm
      ? inProgress.activeForm
      : 'subject' in inProgress
        ? inProgress.subject
        : inProgress.content
    : undefined
  return { done, total, percent, phases, unmatched, current, source }
}

/** A text progress bar of `width` cells. */
export function bar(percent: number, width: number): string {
  const w = Math.max(4, width)
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * w)
  return '█'.repeat(filled) + '░'.repeat(w - filled)
}
