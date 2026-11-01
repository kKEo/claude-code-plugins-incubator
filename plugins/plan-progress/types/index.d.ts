export type PlanStatus = 'pending' | 'in_progress' | 'completed'

export type PlanSource = {
  /** Absolute path of the plan file, null while none is known. */
  path: string | null
  /** The plan's markdown as last read; empty while none. */
  text: string
  /** Modification time of the file as last read, 0 while none. */
  mtimeMs: number
  /** True while the session is in plan mode. */
  isPlanMode: boolean
}

export type PlanTask = {
  id: string
  subject: string
  status: PlanStatus
  activeForm?: string
  blockedBy: string[]
}

export type PlanTodo = {
  content: string
  status: PlanStatus
  activeForm: string
}

export type PlanView = 'plan' | 'progress'

declare module 'claude-code' {
  interface PluginState {
    'plan-progress': {
      plan: PlanSource
      tasks: PlanTask[]
      todos: PlanTodo[]
      view: PlanView
    }
  }
}
