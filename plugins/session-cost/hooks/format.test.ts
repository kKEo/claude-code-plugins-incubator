import { expect, test } from 'claude-code/testing'

import { stamp } from './format'

test('stamps show local time to the minute, so they agree with the day labels', async () => {
  // Built from local fields, so the expectation holds in any time zone.
  expect(stamp(new Date(2027, 0, 16, 9, 5, 42).getTime())).toBe('2027-01-16 09:05')
  expect(stamp(new Date(2027, 11, 31, 23, 59, 0).getTime())).toBe('2027-12-31 23:59')
})
