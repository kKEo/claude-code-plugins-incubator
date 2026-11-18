# ci-watch: background work on a timer

This example has no event behind it. A timer asks the GitHub CLI for the latest workflow run, pins the answer in the status line, raises a notification when a run turns red, and can start a turn asking Claude to look at the failure. It shows work that outlives a dispatch, host processes, notifications and waking an idle session.

![How the ci-watch example works. At session start the mod starts a timer at the configured interval. On every tick it runs gh to get the latest workflow run as JSON, pins the status line and compares the state with last time. On a new failure it raises a native notification, and with the wake option on it submits a prompt that starts a turn once the session is idle](../images/example-ci-watch.svg)

## Files

```
ci-watch/
├── .claude-plugin/plugin.json
├── hooks/hooks.json            # { "modules": ["./register.ts"] }
├── hooks/register.ts
└── hooks/watch.test.ts
```


It needs the `gh` command, signed in, and a repository with GitHub Actions.

## The manifest

```json
{
  "name": "ci-watch",
  "version": "0.1.0",
  "description": "Shows the latest CI run in the status line, notifies when it fails and can start a turn to look into it",
  "userConfig": {
    "intervalSeconds": {
      "type": "number",
      "title": "Poll interval, seconds",
      "description": "How often to ask gh for the latest run",
      "default": 120
    },
    "wake": {
      "type": "boolean",
      "title": "Start a turn on failure",
      "description": "When a run fails, submit a prompt asking Claude to look at the failing job",
      "default": false
    }
  }
}
```

## The module

```ts
import type { EngineInterface, Register } from 'claude-code'

type Run = { status: string; conclusion: string | null; name: string; url: string }

const LATEST = ['gh', 'run', 'list', '--limit', '1', '--json', 'status,conclusion,name,url']

// The last state seen, to tell a new failure from one already reported.
let lastState = ''

async function poll($: EngineInterface, isWaking: boolean): Promise<void> {
  const ran = await $.process.run(LATEST, { timeoutMs: 15_000 }).catch(() => undefined)
  let run: Run | undefined

  try {
    run = ran?.exitCode === 0 ? (JSON.parse(ran.stdout) as Run[])[0] : undefined
  } catch {
    run = undefined
  }

  if (run === undefined) {
    // No gh, no repository or no runs: say nothing.
    $.ui.status(undefined)

    return
  }
  const state = run.status === 'completed' ? (run.conclusion ?? 'done') : run.status
  $.ui.status(`CI ${state}: ${run.name}`)
  const isNewFailure = state === 'failure' && lastState !== '' && lastState !== 'failure'
  lastState = state

  if (!isNewFailure) {
    return
  }
  await $.ui.notify(`${run.name} failed`, { title: 'CI' })

  if (isWaking) {
    // Queues a prompt that starts a turn of its own once the session is idle.
    await $.prompt.submit({
      text: `The CI run "${run.name}" just failed: ${run.url}. Read the failing job's log and tell me what broke.`,
    })
  }
}

export const register: Register = (on, options) => {
  const everyMs = Math.max(30, Number(options.intervalSeconds ?? 120)) * 1000
  const isWaking = options.wake === true

  // Work that outlives one dispatch starts here and lives on a timer.
  on('session.start', async ($, e, next) => {
    if (e.isInteractive) {
      void poll($, isWaking)
      $.clock.every(everyMs, () => void poll($, isWaking))
    }

    return next(e)
  })
}
```

## How it works

- **The timer starts in `session.start`.** A hook lives for one dispatch; `$.clock.every` lives until the module reloads. `e.isInteractive` keeps the timer out of a `claude -p` run, where nobody would see the status line.
- **`poll` is declared at the top level.** A helper that receives `$` must be, so that the validator can follow its calls. It reports them as `$.process.run (via poll)`.
- **Everything outside goes through `$`.** The mod cannot import `child_process`. `$.process.run` takes an argv and a timeout and resolves with the exit code and the output.
- **Silence is a valid answer.** No `gh`, no repository, no runs, or output that is not JSON: each ends with `$.ui.status(undefined)`, which removes the line. A background mod should never nag about its own setup.
- **Only a change is news.** `lastState` remembers the previous state. The first poll never notifies, and a run that stays red notifies once.
- **Notify, then wake.** `$.ui.notify` uses the user's own notification channel and resolves with whether it was sent. `$.prompt.submit` queues a prompt; it starts a turn only when the session is idle, so it never interrupts work in progress. Waking is off by default, because it spends the user's tokens.

## The test

```ts
import { expect, mock, test } from 'claude-code/testing'

const run = (conclusion: string | null) => ({
  value: {
    exitCode: 0,
    stdout: JSON.stringify([
      { status: conclusion === null ? 'in_progress' : 'completed', conclusion, name: 'build', url: 'https://x/1' },
    ]),
    stderr: '',
    isStdoutTruncated: false,
    isStderrTruncated: false,
  },
})

const options = { intervalSeconds: 30, wake: true }

test('a run that turns red notifies once and wakes the session', { options }, async ($, on) => {
  const clock = mock.clock(on)
  const statuses: (string | undefined)[] = []
  const prompts: string[] = []
  let notified = 0
  let conclusion: string | null = null
  on('process.run', () => run(conclusion))
  on('ui.status', (_, e) => {
    statuses.push(e.text)

    return { value: undefined }
  })
  on('ui.notify', () => {
    notified += 1

    return { value: { isSent: true, channel: 'terminal_bell' } }
  })
  on('prompt.submit', (_, e) => {
    prompts.push(e.text)

    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await clock.advance(1)
  expect(statuses.at(-1)).toBe('CI in_progress: build')

  conclusion = 'failure'
  await clock.advance(30_000)
  await clock.advance(30_000)

  expect(statuses.at(-1)).toBe('CI failure: build')
  expect(notified).toBe(1)
  expect(prompts.length).toBe(1)
})
```

`mock.clock` puts the test in charge of time: `advance` fires the timer. The third argument's `options` gives the mod its `userConfig` values for the test.

## Limits to know

- `lastState` is a module variable. A reload forgets it, and the next poll is treated as the first. That is the safe direction: it can miss one notification, and never repeats one.
- A prompt a mod submits is framed for the model as coming from the plugin. It is not the user's own words, and the transcript names the mod.
- A managed `ui.notify` hook, or the user's settings, can turn notifications off. The call then resolves `{ isSent: false, reason }`; it does not throw.
- Every tick starts a process. Keep the interval long. The option's floor in this module is 30 seconds.
