import { expect, test } from 'claude-code/testing'

import { manifestVersion } from './version'

test('a manifest gives its version, and anything else gives none', () => {
  expect(manifestVersion('{"name":"session-cost","version":"0.4.0"}')).toBe('0.4.0')
  expect(manifestVersion('{"name":"session-cost"}')).toBe(null)
  expect(manifestVersion('{"version":7}')).toBe(null)
  expect(manifestVersion('404: Not Found')).toBe(null)
})
