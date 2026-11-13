import { expect, test } from 'claude-code/testing'

import { CHECK_TTL_MS, compareVersions, isStale, manifestVersion, updateStatus } from './version'

test('a manifest gives its version, and anything else gives none', () => {
  expect(manifestVersion('{"name":"session-cost","version":"0.4.0"}')).toBe('0.4.0')
  expect(manifestVersion('{"name":"session-cost"}')).toBe(null)
  expect(manifestVersion('{"version":7}')).toBe(null)
  expect(manifestVersion('404: Not Found')).toBe(null)
})

test('versions compare by their numbers, not as text', () => {
  expect(compareVersions('0.3.2', '0.4.0')).toBeLessThan(0)
  expect(compareVersions('0.10.0', '0.9.9')).toBeGreaterThan(0)
  expect(compareVersions('1.0', '1.0.0')).toBe(0)
  expect(compareVersions('v1.2.3', '1.2.3-beta.1')).toBe(0)
})

test('the status says whether an update is available', () => {
  expect(updateStatus('0.3.2', '0.4.0')).toBe('available')
  expect(updateStatus('0.4.0', '0.4.0')).toBe('current')
  expect(updateStatus('0.5.0', '0.4.0')).toBe('ahead')
  expect(updateStatus(null, '0.4.0')).toBe('unknown')
  expect(updateStatus('0.4.0', null)).toBe('unknown')
})

test('a check is stale when missing or older than a day', () => {
  expect(isStale(undefined, 1000)).toBe(true)
  expect(isStale({ at: 0, latest: null }, 1000)).toBe(true)
  expect(isStale({ at: 1000, latest: '0.4.0' }, 1000 + CHECK_TTL_MS)).toBe(false)
  expect(isStale({ at: 1000, latest: '0.4.0' }, 1001 + CHECK_TTL_MS)).toBe(true)
})
