import { expect, test } from 'claude-code/testing'

import { addEntry, answered, clip, isCollectable, newEntry, overflow, parseReply, pickNext, stats, MAX_TEXT } from './corpus'
import type { Entry } from '../types'

const fixed = (id: string, extra: Partial<Entry> = {}): Entry => ({
  ...newEntry(id, Number(id), `prompt number ${id} here`),
  status: 'fixed',
  corrected: `Prompt number ${id}.`,
  ...extra,
})

test('only natural-language prompts are collected', async () => {
  expect(isCollectable('Create a mod that gather all the prompts')).toBe(true)
  expect(isCollectable('/clear')).toBe(false)
  expect(isCollectable('! ls -la some folder')).toBe(false)
  expect(isCollectable('yes')).toBe(false)
  expect(isCollectable('ok go')).toBe(false)
  expect(isCollectable('ok do it')).toBe(true)
})

test('a very long prompt is cut at a word', async () => {
  const cut = clip('word '.repeat(500))
  expect(cut.length <= MAX_TEXT + 1).toBe(true)
  expect(cut.endsWith('word…')).toBe(true)
  expect(clip('  short one  ')).toBe('short one')
})

test('the reply is read as a verdict', async () => {
  expect(parseReply('{"ok":true}', 'a b')).toEqual({ status: 'ok' })
  expect(parseReply('```json\n{"corrected":"He goes home.","note":"Verb agreement."}\n```', 'He go home')).toEqual({
    status: 'fixed',
    corrected: 'He goes home.',
    note: 'Verb agreement.',
  })
  // The same words back mean nothing to correct.
  expect(parseReply('{"corrected":"He goes  home"}', 'He goes home')).toEqual({ status: 'ok' })
  expect(parseReply('Sure! It looks fine.', 'x')).toBe(null)
  expect(parseReply('{"note":"hm"}', 'x')).toBe(null)
})

test('a prompt typed twice is kept once, and the corpus drops correct prompts first', async () => {
  const a = newEntry('1', 1, 'the same words here')
  const list = addEntry(addEntry([], a), newEntry('2', 2, 'the same words here'))
  expect(list.length).toBe(1)

  const full = [fixed('1'), { ...fixed('2'), status: 'ok' as const }, fixed('3')]
  expect(overflow(full, 2)).toEqual(['2'])
  expect(overflow(full, 1)).toEqual(['2', '1'])
  expect(overflow(full, 3)).toEqual([])
})

test('the game deals only corrected prompts, never the same twice in a row, unknown ones more often', async () => {
  const list = [fixed('1', { lastAnswer: 'known' }), fixed('2'), newEntry('3', 3, 'not checked yet at all')]
  expect(pickNext(list, null, 0)?.id).toBe('1')
  // Weights 1 and 4: a fifth of the range is the known prompt's.
  expect(pickNext(list, null, 0.19)?.id).toBe('1')
  expect(pickNext(list, null, 0.21)?.id).toBe('2')
  expect(pickNext(list, '2', 0.99)?.id).toBe('1')
  expect(pickNext([fixed('1')], '1', 0.5)?.id).toBe('1')
  expect(pickNext([newEntry('3', 3, 'not checked yet at all')], null, 0.5)).toBe(null)
})

test('answers are counted', async () => {
  const once = answered(answered(fixed('1'), 'missed'), 'known')
  expect([once.known, once.missed, once.lastAnswer]).toEqual([1, 1, 'known'])
  expect(stats([once, fixed('2'), newEntry('3', 3, 'not checked yet at all')])).toEqual({ total: 3, pending: 1, ok: 0, fixed: 2, known: 1 })
})
