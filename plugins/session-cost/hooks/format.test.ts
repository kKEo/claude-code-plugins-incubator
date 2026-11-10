import { expect, test } from 'claude-code/testing'

import { durationBar, stamp } from './format'

test('stamps show local time to the minute, so they agree with the day labels', async () => {
  // Built from local fields, so the expectation holds in any time zone.
  expect(stamp(new Date(2027, 0, 16, 9, 5, 42).getTime())).toBe('2027-01-16 09:05')
  expect(stamp(new Date(2027, 11, 31, 23, 59, 0).getTime())).toBe('2027-12-31 23:59')
})

test('the duration bar is scaled to the slowest request and never empty for a real duration', async () => {
  expect(durationBar(4000, 4000, 10)).toBe('██████████')
  expect(durationBar(2000, 4000, 10)).toBe('█████░░░░░')
  expect(durationBar(1, 4000, 10)).toBe('█░░░░░░░░░')
  expect(durationBar(0, 4000, 10)).toBe('░░░░░░░░░░')
  expect(durationBar(500, 0, 10)).toBe('░░░░░░░░░░')
  expect(durationBar(9000, 4000, 10)).toBe('██████████')
})
