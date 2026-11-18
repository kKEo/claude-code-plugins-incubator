# turn-meter: a row above the prompt

This example draws one row above the prompt: how long the last turn took and how many tools it called, with a button to hide it. It shows the pass move, session state, a band, a button handler, a toast and a `userConfig` option.

![How the turn-meter example works. Three engine events feed it: turn.start resets the tool counter, tool.call counts one and passes it on, turn.complete reads the duration. The mod writes the result to session state, the band's render hook reads it and is redrawn on a write, and a toast appears when the turn was slow. The interface shows a row above the prompt with a Hide button whose press writes a flag](../images/example-turn-meter.svg)

## Files

```
turn-meter/
├── .claude-plugin/plugin.json
├── hooks/hooks.json            # { "modules": ["./register.tsx"] }
├── hooks/register.tsx
├── types/index.d.ts
└── hooks/band.test.tsx
```


## The manifest and the contract

```json
{
  "name": "turn-meter",
  "version": "0.1.0",
  "description": "A row above the prompt with how long the last turn took and how many tools it called",
  "types": "./types/index.d.ts",
  "userConfig": {
    "slowSeconds": {
      "type": "number",
      "title": "Slow turn, seconds",
      "description": "Show a toast when a turn takes longer than this",
      "default": 120
    }
  }
}
```

`types` names the state contract. `userConfig` declares one option; the user changes it in `/config`, and the module reloads with the new value.

```ts
export type Turn = { seconds: number; tools: number }

declare module 'claude-code' {
  interface PluginState {
    'turn-meter': { last: Turn | null; isHidden: boolean }
  }
}
```

## The module

```tsx
import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Turn } from '../types'

// Session state: the host holds it, so it survives a hot reload.
const last = atom({ plugin: 'turn-meter', key: 'last' } as const, null)
const isHidden = atom({ plugin: 'turn-meter', key: 'isHidden' } as const, false)

export const register: Register = (on, options) => {
  const slowSeconds = Number(options.slowSeconds ?? 120)
  // A scratch value of one turn: fine as a module variable.
  let tools = 0

  on('turn.start', ($, e, next) => {
    if (e.agentId === undefined) {
      tools = 0
    }

    return next(e)
  })

  // No matcher: every tool call of the session passes through here.
  on('tool.call', ($, e, next) => {
    tools += 1

    return next(e)
  })

  // React: let the turn end, then act on what happened.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) {
      return next(e) // a subagent's turn, not the person's
    }
    const turn: Turn = { seconds: Math.round(e.durationMs / 1000), tools }
    await update($, last, () => turn)

    if (turn.seconds > slowSeconds) {
      $.ui.toast(`That turn took ${turn.seconds}s`)
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Reading while drawing subscribes this row: a later write redraws it.
    const turn = await read($, last)

    if (e.props.hasSurvey || turn === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>
          Last turn: {turn.seconds}s, {turn.tools} tool calls{' '}
        </Text>
        <Button key="hide" label="Hide" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
```

## How it works

- **Three events, one value.** `turn.start` resets the counter, `tool.call` counts, `turn.complete` writes a `Turn` to state. `e.agentId` is set on a subagent's turn, so the hooks skip those and report the person's own turn only.
- **Two kinds of memory.** `tools` is a module variable: it is scratch for the running turn, and losing it at a reload costs one wrong count. `last` and `isHidden` are in `$.state`: the band reads them, and they survive a reload.
- **The read is the subscription.** The band's hook calls `read($, last)`. When `turn.complete` writes a new value, the engine runs that hook again. Nothing calls a redraw.
- **Drawing nothing.** When there is no turn yet, the row is hidden, or the engine shows a survey in the band (`e.props.hasSurvey`), the hook returns `next(e)` and draws nothing.
- **A handler writes.** The button's `onPress` calls `update`. A render hook itself may never write state.
- **Options arrive in `register`.** `options.slowSeconds` is read once per load. Changing it in `/config` reloads the module, so there is no stale value to worry about.

## The test

```tsx
import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'turn-meter',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 3,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 3 },
    view: {},
  },
} as const

test('the row shows the last turn and hides on a press', async ($, on) => {
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('tool.call', () => ({ result: {} }))
  on('turn.complete', (_, e) => ({ text: e.answer }))

  await $.turn.start({ turnId: 't1', text: 'run the tests' })
  await $.tool.call({ tool: 'Bash', command: 'npm test' })
  await $.turn.complete({ turnId: 't1', answer: 'done', durationMs: 42_000, isAborted: false, reason: 'answer' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /Last turn/ }))?.text).toMatch(/42s, 1 tool calls/)
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 'hide' })
  expect(await ui.find({ type: 'Text', text: /Last turn/ })).toBeUndefined()
  await ui.unmount()
})
```

`$.ui.mount` draws the band through the mod on the surface the test names, and hands back the drawing to search and press. Looping over two surfaces shows the tree does not depend on one.

## Limits to know

- The band is one row per mod. Draw more than a row and you want a pane instead.
- `tool.call` with no matcher sees the subagents' calls too. The count includes them; filter on `e.agentId` if you want only the main thread's.
- The row is not drawn in a headless run: there is no surface.
