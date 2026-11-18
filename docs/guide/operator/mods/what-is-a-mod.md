# What a mod is

This page explains what a mod is, what Claude Code does with one, and which files it is made of. It assumes you have read [Ways to extend Claude Code](../intro/extension-points.md).

A mod is a plugin whose `hooks/hooks.json` names a TypeScript module. Claude Code loads that module into the session, and the module adds hooks to the engine's events. A hook can watch an event, change it, answer it, or draw something in the interface. plan-progress, session-cost, prompt-coach and instances-monitor are mods.

The official name is "function hooks". "Mod" is the short word this guide and Claude Code's own tooling use for a plugin built on them.

## A mod and a command hook

Both kinds are declared in the same file, `hooks/hooks.json`, and both react to events. They work in very different ways.

![A command hook and a mod compared. For a command hook the engine reaches an event, starts your script as a new process with the event as JSON on stdin, and reads JSON from stdout; the script cannot draw and remembers nothing. For a mod the engine loads your module once into a sandbox, its hooks join the chain of each event, and a hook calls back through the engine interface to draw, keep state, run a process, ask a model or start a timer](../images/mod-vs-hook.svg)

| | Command hook | Mod |
|---|---|---|
| Declared as | `{ "hooks": { "Stop": [ … ] } }` | `{ "modules": ["./register.tsx"] }` |
| Started | A new process for every event | Loaded once per session, and again when it is reloaded |
| Events | A short fixed list: `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart` and the like | About fifty, including what the interface draws |
| Sees | The event as JSON on stdin | The event's input, and the result of everything beneath it |
| Can | Add context, block | Rewrite the input, replace the result, refuse, draw, keep state |
| Reaches the outside | Directly: it is a process | Only through the engine interface, `$` |
| Language | Anything that runs | TypeScript or JavaScript |

A command hook is the right tool when a script can do the job. A mod is the right tool when the job needs to draw, to remember, or to stand between the model and a tool.

## What is behind a mod

Three ideas explain most of how a mod behaves.

**The engine raises events.** Claude Code's core, which this guide calls the engine, announces each thing it is about to do as an event with a name: `tool.call` before a tool runs, `prompt.submit` when a prompt is sent, `ui.render` when the interface needs something drawn. Each event has an input and a result.

**Hooks form a chain.** A hook is a function you add to one event. All the hooks of an event, from every mod, are lined up in a chain that ends in the engine's own behaviour. Your hook receives the input, decides what to do, and usually passes the event on to the rest of the chain. [The hook chain](hook-chain.md) covers this in full.

**The module runs in a sandbox.** The engine compiles your TypeScript itself; there is no build step and no `node_modules`. The module runs in an environment of its own with no DOM and no Node: no `require`, no `fs`, no `process`, no network. Everything outside is reached through one object, `$`, which every hook receives. `$.fs.read` reads a file, `$.process.run` runs a command, `$.ui.status` pins a status line. Because every outside effect goes through `$`, the engine can meter it, refuse it, and show a validator exactly what a mod touches.

## The files

![The files of a mod and what the engine does with each. plugin.json is the manifest. hooks/hooks.json names the one hooks module. hooks/register.tsx exports register and adds the hooks. types/index.d.ts is the state contract, needed when the mod keeps state. Test files are optional and run with claude plugin test](../images/mod-anatomy.svg)

```
<mod>/
├── .claude-plugin/plugin.json     # manifest (required)
├── hooks/
│   ├── hooks.json                 # { "modules": ["./register.tsx"] } (required)
│   ├── register.tsx               # the hooks module (required)
│   └── *.test.ts                  # tests (optional)
├── types/index.d.ts               # state contract (when the mod keeps state)
└── tsconfig.json                  # one line, extends the engine's (optional)
```

| File | Contract |
|---|---|
| `.claude-plugin/plugin.json` | `name`, `version`, `description`. Add `"types": "./types/index.d.ts"` when the mod keeps session state, and a `userConfig` block for options the user sets in `/config`. See [plugin.json](../config/plugin-json.md). |
| `hooks/hooks.json` | `{ "modules": ["./register.tsx"] }`. One path, relative to this file. |
| `hooks/register.tsx` | Exports `register(on, options)`. The file and everything it imports from the plugin must end in `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` or `.cts`. Use `.tsx` when the module draws with JSX. |
| `types/index.d.ts` | Declares each value the mod keeps in `$.state`. See [State, lifecycle and reloads](state-lifecycle.md). |
| `.claude-plugin/types/` | Written by the engine beside a mod it hot-reloads: the API declarations for your editor. It ignores itself in git. Do not edit it. |

The smallest hooks module is four lines:

```ts
import type { Register } from 'claude-code'

export const register: Register = (on, options) => {
  on('tool.call', ($, e, next) => next(e))
}
```

`register` runs once each time the module loads. `on` adds a hook. `options` holds the values of the manifest's `userConfig` fields. The import from `'claude-code'` is types only; at run time it is empty.

## What a mod is used for

| You want | The mechanism | Example |
|---|---|---|
| A panel beside the chat that updates | `$.ui.open` and a `ui.render` hook for `Pane` | [decision-log](example-decision-log.md) |
| A row above the prompt | A `ui.render` hook for `AbovePrompt` | [turn-meter](example-turn-meter.md) |
| A line under the prompt | `$.ui.status(text)` | [ci-watch](example-ci-watch.md) |
| To block or rewrite a tool call | A `tool.call` hook | [path-guard](example-path-guard.md) |
| To change what the model reads | `prompt.submit`, `prompt.compose` | [repo-brief](example-repo-brief.md) |
| A tool the model can call | `$.tool.register` and a `tool.run` hook | [decision-log](example-decision-log.md) |
| A slash command | `$.command.register` and a `command.run` hook | [decision-log](example-decision-log.md) |
| Work on a timer | `$.clock.every` | [ci-watch](example-ci-watch.md) |
| A theme, a sound, a model call, a subagent type | `$.theme`, `$.audio`, `$.model`, `$.agent` | [Events and the engine interface](events.md) |

## What a mod is not

- It is not a way to teach Claude a workflow. That is a skill. A mod can ship skills beside its module, in the same plugin.
- It is not a Node program. A package from npm that needs Node's built-in modules will not load.
- It is not a stable API yet. The surface is early access and changes between Claude Code releases; see [Behaviour and limitations](limits.md).
- It is not a security boundary. A mod runs with the user's own rights, through `$`. Install only mods you would be willing to read.

Next: [Your first mod](first-mod.md).
