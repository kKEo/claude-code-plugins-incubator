export type Instance = {
  pid: number
  sessionId: string
  name: string
  cwd: string
  status: string
  kind: string
  version: string
  startedAt: number
  updatedAt: number
  statusUpdatedAt: number
  cpu: number
  rssKb: number
}

declare module 'claude-code' {
  interface PluginState {
    'instances-monitor': { instances: Shaped<Instance[]> }
  }
}
