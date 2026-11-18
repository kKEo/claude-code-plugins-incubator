# decision-log: a tool, a pane and a store

This example gives the model a tool, `record_decision`, to call when it chooses between real alternatives. The mod keeps the decisions per project, across sessions, and lists them in a pane opened with `/decisions`. It shows a model-callable tool, a slash command, a pane and the store.

![How the decision-log example works. At session start the mod registers a tool and a command and loads the decisions kept by earlier sessions. When the model chooses between options it calls the tool with what was decided and why. The mod's tool.run hook answers with a result the model reads, writes session state so the pane is drawn again, and writes the store so the list survives the session. The interface shows the Decisions pane](../images/example-decision-log.svg)

## Files

```
decision-log/
├── .claude-plugin/plugin.json
├── hooks/hooks.json            # { "modules": ["./register.tsx"] }
├── hooks/register.tsx
├── types/index.d.ts
└── hooks/log.test.tsx
```


## The contract

```ts
export type Decision = { at: number; what: string; why: string }

declare module 'claude-code' {
  interface PluginState {
    'decision-log': { decisions: Shaped<Decision[]> }
  }
}
```

The manifest adds `"types": "./types/index.d.ts"` to the usual three fields.

## The module

```tsx
import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Decision } from '../types'

const PANE = 'decisions'
const TOOL = 'mcp__decision-log__record_decision'
const decisions = atom({ plugin: 'decision-log', key: 'decisions' } as const, [], {
  shape: 'decisions-1',
})

const isDecision = (one: unknown): one is Decision =>
  typeof one === 'object' && one !== null && 'what' in one && 'why' in one && 'at' in one

export const register: Register = on => {
  // The store key of this project; session.start sets it again after a reload.
  let storeKey = 'decisions'

  on('session.start', async ($, e, next) => {
    storeKey = `decisions:${e.cwd}`
    await $.command.register({ name: 'decisions', description: 'Show the recorded design decisions' })
    await $.tool.register({
      name: 'record_decision',
      description:
        'Records a design decision the user should be able to find later: what was decided and why. ' +
        'Call it once per decision, when you choose between real alternatives.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          what: { type: 'string', description: 'The decision, in one sentence' },
          why: { type: 'string', description: 'The reason, and the alternative it beat' },
        },
        required: ['what', 'why'],
      },
    })
    // The store outlives the session; the state is what the pane reads.
    const saved = await $.store.get(storeKey)
    const kept = Array.isArray(saved) ? saved.filter(isDecision) : []
    await update($, decisions, () => kept)

    return next(e)
  })

  // The model's call arrives here once it is allowed; the answer is the tool's result.
  on('tool.run', { tool: TOOL }, async ($, e) => {
    const one: Decision = { at: await $.clock.now(), what: String(e.what), why: String(e.why) }
    const list = [...(await read($, decisions)), one].slice(-100)
    await update($, decisions, () => list)
    await $.store.set(storeKey, list)

    return { result: `Recorded decision ${list.length}.` }
  })

  on('command.run', { command: 'decisions' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Decisions' })

    return { text: 'Decisions pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, decisions)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No decisions recorded yet.</Text>}
        {list.map((one, index) => (
          <Box flexDirection="column" marginBottom={1}>
            <Text bold>
              {index + 1}. {one.what}
            </Text>
            <Text dimColor>{one.why}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
```

## How it works

- **Setup in `session.start`.** The event is awaited before the first prompt, so the tool is in the model's list from turn one. `isDeferred: false` puts its schema in the prompt directly; left out, the tool would wait behind tool search, as an MCP server's does.
- **The description is the trigger.** The model decides when to call the tool from its description alone, exactly as it decides when to use a skill. Say when to call it, not only what it does.
- **The tool's name.** A tool a mod registers is listed as `mcp__<plugin>__<name>`. The `tool.run` matcher uses that full name.
- **`tool.run` serves the call.** It fires once the call has passed the permission check. The fields of the tool's input arrive on `e`. The hook returns `{ result }`, which the model reads as the tool's output.
- **State for the pane, store for tomorrow.** Each decision is written to both. The store key includes the working directory, so every project has its own list.
- **Old values are checked.** The atom carries a shape tag, and what comes back from the store goes through `isDecision` before it is trusted. A later version that changes `Decision` changes the tag and the guard.
- **The command answers with text.** `command.run` returns `{ text }`, the row the user sees.

## The test

```tsx
import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'decision-log',
  component: 'Pane',
  requestId: 'decisions',
  props: {
    title: 'Decisions',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

test('a recorded decision joins the ones kept from earlier sessions', async ($, on) => {
  mock.store(on, {
    'decisions:/repo': [{ at: 1, what: 'Ship a CLI first', why: 'No UI needed yet.' }],
  })
  mock.clock(on)
  on('command.register', () => ({ value: { command: 'decisions' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__decision-log__record_decision' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  const answer = await $.tool.call({
    tool: 'mcp__decision-log__record_decision',
    what: 'Use SQLite',
    why: 'One file, no server; Postgres was too much for a CLI.',
  })
  expect(answer.result).toBe('Recorded decision 2.')

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Ship a CLI first/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /SQLite/ }))?.text).toBe('2. Use SQLite')
  await ui.unmount()
})
```

`mock.store` seeds the store with what an earlier session left. The test then checks that the new decision is numbered after it.

## Limits to know

- The store holds 4 MiB of JSON per mod, in all. The module keeps the last 100 decisions per project for that reason.
- A tool's description cannot change during a conversation; see [Behaviour and limitations](limits.md). Put anything that changes into the tool's result.
- The pane is drawn only when the user opens it. A mod may open its pane by itself at session start, but it is then seated only in a wide terminal.
- Answering at `tool.call` instead of `tool.run` also serves the tool, and skips the permission check. plan-progress does that for its `mark_step` tool, which only records progress.
