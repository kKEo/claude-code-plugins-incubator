import { expect, test } from 'claude-code/testing'

import { bar, parsePlan, progressOf, similarity } from './progress'

const PLAN = `# Mod plan-progress

## Context

Some prose that is not a step.

## Phase 1: Skeleton

- Write the manifest and hooks.json
- Write the state contract

## Phase 2: Collect the plan

- [x] Hook prompt.attachment for plan_mode
- [ ] Re-read the plan on Write or Edit

\`\`\`
- a bullet inside a fence is ignored
\`\`\`
`

test('parsePlan splits headings into phases and bullets into steps', async () => {
  const phases = parsePlan(PLAN)
  expect(phases.map(p => p.title)).toEqual(['Context', 'Phase 1: Skeleton', 'Phase 2: Collect the plan'])
  expect(phases[0]?.steps).toEqual([])
  expect(phases[1]?.steps.map(s => s.text)).toEqual(['Write the manifest and hooks.json', 'Write the state contract'])
  expect(phases[2]?.steps.map(s => s.status)).toEqual(['completed', 'pending'])
  expect(phases[2]?.steps.every(s => s.isFromPlan)).toBe(true)
})

test('progressOf counts plan checkboxes when there are no tasks or todos', async () => {
  const p = progressOf(PLAN, [], [])
  expect(p.source).toBe('plan')
  expect(p.done).toBe(1)
  expect(p.total).toBe(2)
  expect(p.percent).toBe(50)
  expect(p.current).toBeUndefined()
})

test('progressOf marks plan steps from matching tasks and lists the rest', async () => {
  const p = progressOf(
    PLAN,
    [
      { id: '1', subject: 'Write the state contract', status: 'completed', blockedBy: [] },
      { id: '2', subject: 'Re-read the plan on Write or Edit', status: 'in_progress', activeForm: 'Re-reading the plan', blockedBy: [] },
      { id: '3', subject: 'Publish to the registry', status: 'pending', blockedBy: [] },
    ],
    [],
  )
  expect(p.source).toBe('tasks')
  expect(p.done).toBe(1)
  expect(p.total).toBe(3)
  expect(p.percent).toBe(33)
  expect(p.current).toBe('Re-reading the plan')
  expect(p.phases[1]?.steps[1]?.status).toBe('completed')
  expect(p.phases[2]?.steps[1]?.status).toBe('in_progress')
  expect(p.unmatched.map(s => s.text)).toEqual(['Publish to the registry'])
})

test('progressOf falls back to todos and handles an empty plan', async () => {
  const p = progressOf('', [], [
    { content: 'Run the tests', status: 'completed', activeForm: 'Running the tests' },
    { content: 'Write docs', status: 'in_progress', activeForm: 'Writing docs' },
  ])
  expect(p.source).toBe('todos')
  expect(p.phases).toEqual([])
  expect(p.total).toBe(2)
  expect(p.done).toBe(1)
  expect(p.current).toBe('Writing docs')
  expect(p.unmatched).toHaveLength(2)
  expect(progressOf('', [], []).source).toBe('none')
})

test('bar fills by percent', async () => {
  expect(bar(0, 10)).toBe('░░░░░░░░░░')
  expect(bar(50, 10)).toBe('█████░░░░░')
  expect(bar(100, 10)).toBe('██████████')
})

test('similarity ignores stop words and prefers an unclaimed step', async () => {
  expect(similarity('Write the hooks module', 'Write the tests')).toBe(0)
  expect(similarity('Write the hooks module', 'write hooks module')).toBe(1)
  expect(similarity('Add the registry entry and README', 'Registry entry + README added')).toBeGreaterThan(0)
  const p = progressOf('## P\n\n- Write the hooks module\n- Write the tests\n', [
    { id: '1', subject: 'Write the tests', status: 'completed', blockedBy: [] },
    { id: '2', subject: 'Write the hooks module', status: 'in_progress', blockedBy: [] },
  ], [])
  expect(p.phases[0]?.steps.map(s => s.status)).toEqual(['in_progress', 'completed'])
})
