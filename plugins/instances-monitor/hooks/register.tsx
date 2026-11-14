import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Instance } from '../types'

const PANE = 'instances'
const POLL_MS = 3000

const instances = atom({ plugin: 'instances-monitor', key: 'instances' } as const, [], {
  shape: 'instances-1',
})

const dur = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h${String(m % 60).padStart(2, '0')}m` : `${Math.floor(h / 24)}d${h % 24}h`
}

const mem = (kb: number): string =>
  kb >= 1048576 ? `${(kb / 1048576).toFixed(1)}G` : `${Math.round(kb / 1024)}M`

const base = (p: string): string => p.split('/').filter(Boolean).pop() ?? p

async function scan($: any): Promise<void> {
  try {
    const home = (await $.process.run(['printenv', 'HOME'])).stdout.trim()
    const dir = `${home}/.claude/sessions`
    const files = (await $.fs.list(dir)).filter((f: any) => f.name.endsWith('.json'))
    const found: any[] = []
    for (const f of files) {
      try {
        found.push(JSON.parse(await $.fs.read(`${dir}/${f.name}`)))
      } catch {}
    }
    if (found.length === 0) return void (await update($, instances, () => []))
    const ps = await $.process.run([
      'ps', '-o', 'pid=,pcpu=,rss=', '-p', found.map(s => s.pid).join(','),
    ])
    const live = new Map<number, { cpu: number; rssKb: number }>()
    for (const line of ps.stdout.split('\n')) {
      const [pid, cpu, rss] = line.trim().split(/\s+/)
      if (pid) live.set(Number(pid), { cpu: Number(cpu), rssKb: Number(rss) })
    }
    const rows: Instance[] = found
      .filter(s => live.has(s.pid))
      .map(s => ({
        pid: s.pid,
        sessionId: s.sessionId ?? '',
        name: s.name ?? '',
        cwd: s.cwd ?? '',
        status: s.status ?? 'unknown',
        kind: s.kind ?? '',
        version: s.version ?? '',
        startedAt: s.startedAt ?? 0,
        updatedAt: s.updatedAt ?? 0,
        statusUpdatedAt: s.statusUpdatedAt ?? s.updatedAt ?? 0,
        ...live.get(s.pid)!,
      }))
      .sort((a, b) => a.startedAt - b.startedAt)
    await update($, instances, () => rows)
  } catch (err) {
    $.ui.log(`instances-monitor scan failed: ${String(err)}`, { to: 'debug' })
  }
}

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'instances',
      description: 'Show all Claude Code instances running on this machine',
    })
    void $.ui.open({ id: PANE, title: 'Claude instances' })
    await scan($)
    timer?.cancel()
    timer = $.clock.every(POLL_MS, () => void scan($))
    return next(e)
  })

  on('command.run', { command: 'instances' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Claude instances' })
    return { text: 'Instances pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, instances)
    const now = await $.clock.now()
    const busy = list.filter(i => i.status === 'busy').length
    const totalMem = list.reduce((n, i) => n + i.rssKb, 0)
    const color = (s: string) =>
      s === 'busy' ? 'green' : s === 'idle' ? 'gray' : 'yellow'

    return (
      <Box flexDirection="column">
        <Text bold>
          {list.length} running · {busy} busy · {mem(totalMem)}
        </Text>
        {list.length === 0 && <Text dimColor>No instances found.</Text>}
        {list.map(i => (
          <Box flexDirection="column" marginTop={1}>
            <Text>
              <Text color={color(i.status)}>● </Text>
              <Text bold>{i.name || base(i.cwd)}</Text>
              <Text dimColor> {i.status} {dur(now - i.statusUpdatedAt)}</Text>
            </Text>
            <Text dimColor>  {i.cwd}</Text>
            <Text dimColor>
              {'  '}pid {i.pid} · {i.kind} · v{i.version}
            </Text>
            <Text dimColor>
              {'  '}up {dur(now - i.startedAt)} · cpu {i.cpu.toFixed(1)}% · {mem(i.rssKb)}
            </Text>
          </Box>
        ))}
      </Box>
    )
  })
}
