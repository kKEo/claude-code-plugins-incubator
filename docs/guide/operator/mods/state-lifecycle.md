# State, lifecycle and reloads

This page says what runs when in the life of a mod, and where each kind of value should be kept so that it survives what it needs to survive.

## What runs when

![The life of a mod inside one session. Load: the engine reads the folder, compiles the module and runs register once. Run: session.start is awaited before the first prompt, then each event runs your hook with its own time budget, and timers keep work alive between events. Reload: when you save a file a fresh copy loads, register and session.start run again, state and store stay, module variables and timers are gone. End: session.end gives one short chance to save, and /clear raises it too](../images/mod-lifecycle.svg)

| Moment | What happens | What to do there |
|---|---|---|
| Load | The engine reads `plugin.json` and `hooks/hooks.json`, compiles the module, and calls `register(on, options)` once | Add hooks. Read `options`. Nothing else: there is no `$` yet |
| `session.start` | Raised once the session is ready, and awaited before the first prompt | Register commands, tools and agent types. Load saved values. Start timers |
| Dispatch | An event runs your hook | Do the hook's work within its time budget |
| Reload | A file of the mod changed. A fresh copy of the module loads | Nothing to write: `register` and `session.start` run again by themselves |
| `session.end` | The session ends, or `/clear` runs | Save, quickly |

`session.start` is the place for setup because it is awaited: a tool registered there is in the model's tool list from the first turn.

`/clear` raises `session.end` with `reason: 'clear'` and no `session.start` after it. A mod that resets per-conversation values does so in `session.end`.

## Three places to keep a value

![Three places a mod can keep a value and how long each lasts. A module variable lasts until the next hot reload and suits scratch values for one turn. A value in $.state survives reloads and lasts until the session ends; it is what a drawing reads. A value in $.store lasts across sessions and holds up to 4 MiB of JSON per mod](../images/three-memories.svg)

| Where | Lives until | Use it for | Limits |
|---|---|---|---|
| A module variable | The next reload | Scratch that is rebuilt cheaply: a counter for the running turn, a timer handle | Lost at a reload, with no warning |
| `$.state` | The session ends | Anything a drawing reads | JSON data. Only the owning mod writes a value |
| `$.store` | Deleted | Anything the next session needs | JSON data, 4 MiB in all per mod |

A value that matters to the user and should outlive the session goes in both: `$.state` so the drawing follows it, `$.store` so it is there tomorrow.

## The state contract

A mod that uses `$.state` declares every value in `types/index.d.ts`, and names that file in its manifest as `"types": "./types/index.d.ts"`.

```ts
// types/index.d.ts
export type Decision = { at: number; what: string; why: string }

declare module 'claude-code' {
  interface PluginState {
    'decision-log': { decisions: Shaped<Decision[]> }
  }
}
```

The module refers to a value through an atom whose `plugin` and `key` are literals.

```ts
import { atom, read, update } from 'claude-code'

const decisions = atom({ plugin: 'decision-log', key: 'decisions' } as const, [], {
  shape: 'decisions-1',
})

const list = await read($, decisions)               // while drawing, or anywhere
await update($, decisions, old => [...old, one])    // from an event or a handler
```

| Function | Does |
|---|---|
| `atom(ref, initial, { shape? })` | Names one value and what it reads as before anything was written |
| `read($, atom)` | Returns the value. Inside a render hook it also subscribes the drawing |
| `update($, atom, fn)` | Reads, applies `fn` and writes with a version check, retrying on a miss |
| `derive(sources, fn)` | A value computed from others |

`claude plugin validate` reads the contract and holds the module to it: a key the module names that the contract does not declare fails validation.

## New code meets old values

State outlives a reload, and the store outlives the session. So the code you just edited will read values written by the code before the edit.

- For `$.state`, declare the key as `Shaped<T>` and give the atom a `shape` tag. A value stored under any other tag reads as `initial`. Change the tag whenever the value's fields change.
- For `$.store`, check what you read. `$.store.get` returns `unknown`; filter it through a type guard before trusting it. [decision-log](example-decision-log.md) shows this.

```ts
// Before the edit: { shape: 'calls-1' }. A call gained a field, so:
const calls = atom({ plugin: 'tool-calls', key: 'calls' } as const, [], { shape: 'calls-2' })
```

## Reloads while you develop

| How the mod is loaded | Reloads when |
|---|---|
| `claude --plugin-dir <folder>`, interactive | You save a file. Saves made by Claude during its own turn reload once, when the turn ends |
| A folder marketplace with a relative `source` | You run `/reload-plugins`: the folder itself is read, not a copy |
| Installed from a git marketplace | Only as a new version: `/plugin update <name>`, then `/reload-plugins` |

At a reload the previous copy's `$.clock.every` timers stop, and `register` and `session.start` run again in the fresh copy. A reload that fails to load keeps the previous version running, so a syntax error does not take your pane away.

## Work that outlives one event

A hook runs inside one dispatch. Work that should keep going belongs on a timer started in `session.start`.

```ts
on('session.start', async ($, e, next) => {
  $.clock.every(60_000, () => void poll($))
  return next(e)
})
```

- `$.clock.every(ms, fn)` runs until cancelled or until the module reloads. `$.clock.after(ms, fn)` runs once.
- `$.prompt.submit({ text })` queues a prompt that starts a turn of its own once the session is idle. It is how background work wakes a quiet session. It never lands inside a running turn.
- `$.ui.status`, `$.ui.toast` and `$.ui.notify` show something without starting a turn.

> **Warning.** A function that receives `$` must be declared at the top level of the module or imported from one of its files. `claude plugin validate` refuses a helper declared inside `register` that is handed `$`, because it cannot follow what the helper calls.

Next: [Behaviour and limitations](limits.md).
