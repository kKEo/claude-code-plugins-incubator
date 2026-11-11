import { expect, test } from 'claude-code/testing'

import { CACHE_READ_RAMP, CACHE_WRITE_RAMP, durationBar, heatColor, heatLevel, stamp, toolList } from './format'

test('stamps show local time to the minute, so they agree with the day labels', async () => {
  // Built from local fields, so the expectation holds in any time zone.
  expect(stamp(new Date(2027, 0, 16, 9, 5, 42).getTime())).toBe('2027-01-16 09:05')
  expect(stamp(new Date(2027, 11, 31, 23, 59, 0).getTime())).toBe('2027-12-31 23:59')
})

test('the duration bar is scaled to the slowest request and carries the duration flush right', async () => {
  expect(durationBar(4000, 4000, 7)).toEqual({ label: '   4.0s', filled: 7 })
  expect(durationBar(2000, 4000, 7)).toEqual({ label: '   2.0s', filled: 4 })
  expect(durationBar(1, 4000, 7)).toEqual({ label: '    1ms', filled: 1 })
  expect(durationBar(0, 4000, 7)).toEqual({ label: '    0ms', filled: 0 })
  expect(durationBar(500, 0, 7)).toEqual({ label: '  500ms', filled: 0 })
  expect(durationBar(9000, 4000, 7)).toEqual({ label: '   9.0s', filled: 7 })
  expect(durationBar(1_234_500, 1_234_500, 7)).toEqual({ label: '1234.5s', filled: 7 })
})

test('the tools of a response are listed in call order, repeats counted and MCP names shortened', async () => {
  expect(toolList(['Bash'])).toBe('Bash')
  expect(toolList(['Read', 'Bash', 'Read', 'Read'])).toBe('Read ×3, Bash')
  expect(toolList(['mcp__github__create_issue', 'Edit'])).toBe('create_issue, Edit')
  expect(toolList([])).toBe('')
})

test('a share is colored in five levels from light to vivid, and nothing is left uncolored', async () => {
  expect(heatLevel(0, 1000)).toBe(0)
  expect(heatLevel(500, 0)).toBe(0)
  expect(heatLevel(1, 1000)).toBe(1)
  expect(heatLevel(199, 1000)).toBe(1)
  expect(heatLevel(200, 1000)).toBe(2)
  expect(heatLevel(400, 1000)).toBe(3)
  expect(heatLevel(600, 1000)).toBe(4)
  expect(heatLevel(800, 1000)).toBe(5)
  expect(heatLevel(1000, 1000)).toBe(5)
  expect(heatColor(CACHE_READ_RAMP, 0)).toBeUndefined()
  expect(heatColor(CACHE_READ_RAMP, 1)).toBe('#9bd3a4')
  expect(heatColor(CACHE_READ_RAMP, 5)).toBe('#0a8a2a')
  expect(heatColor(CACHE_WRITE_RAMP, 1)).toBe('#e3a6a6')
  expect(heatColor(CACHE_WRITE_RAMP, 5)).toBe('#d01919')
})
