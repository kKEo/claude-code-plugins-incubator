# Your first mod

This page builds a working mod from nothing: three files, validated, loaded into a session, edited live and tested. It takes about ten minutes. You need Claude Code 2.1.326 or newer and a terminal.

The mod is called `tool-count`. It pins a line under the prompt that says how many tool calls the session has made.

## 1. Write the three files

Make a folder anywhere outside your projects, for example `~/mods/tool-count`.

`.claude-plugin/plugin.json`, the manifest:

```json
{
  "name": "tool-count",
  "version": "0.1.0",
  "description": "Counts the tool calls of the session in the status line"
}
```

`hooks/hooks.json`, which names the module:

```json
{ "modules": ["./register.ts"] }
```

`hooks/register.ts`, the hooks module:

```ts
import type { Register } from 'claude-code'

export const register: Register = on => {
  let calls = 0

  on('tool.call', ($, e, next) => {
    calls += 1
    $.ui.status(`${calls} tool calls`)

    return next(e)
  })
}
```

Read the module from the bottom up. `next(e)` passes the tool call on unchanged, so the mod only watches. `$.ui.status` pins the line. `calls` is a module variable, which is enough here because the count is only shown, not drawn from state. `register` runs once when the module loads, and `on` adds the hook.

## 2. Validate it

```bash
claude plugin validate ~/mods/tool-count
```

The validator reads the manifest and the module the way the engine will, type-checks them, and reports what the module does:

```
Validating hooks: …/tool-count/hooks/hooks.json

  ❯ ./register.ts hooks: tool.call
  ❯ ./register.ts gating hook without .catch: tool.call
  ❯ ./register.ts calls: $.ui.status

Provides:

  ❯ modules: hooks/register.ts
```

| Line | Meaning |
|---|---|
| `hooks: tool.call` | The events the module hooks, with their matchers |
| `gating hook without .catch` | `tool.call` is an event where an answer can refuse. This hook only passes, so failing open is right. It is a note, not a warning |
| `calls: $.ui.status` | Every part of `$` the module touches. A reviewer reads this line first |

After these lines the command prints the plugin directory's checks: a missing README, LICENSE or icon. They matter when you publish, not now.

## 3. Load it

```bash
claude --plugin-dir ~/mods/tool-count
```

`--plugin-dir` loads the plugin from disk for that session only. Ask Claude to list the files in a folder. The line `1 tool calls` appears under the prompt and counts up with every call.

If nothing appears, start with `claude --debug --plugin-dir ~/mods/tool-count` and look for a line that begins with `tool-count:`. A module that failed to load, or a hook that was skipped, is named there with the reason.

## 4. Change it while it runs

Leave the session open and edit `hooks/register.ts` in your editor: change the text to `` `tools: ${calls}` `` and save. The session reloads the module by itself. The count starts again from zero, because `calls` is a module variable and a reload starts the module afresh. [State, lifecycle and reloads](state-lifecycle.md) explains what to use when a value must survive that.

The first load also wrote a folder beside your mod, `.claude-plugin/types/`. It holds the API declarations for this build of Claude Code. Add a one-line `tsconfig.json` at the mod's top level and your editor completes `$.` and checks `e`:

```json
{ "extends": "./.claude-plugin/types/tsconfig.json" }
```

With TypeScript installed, `npx tsc -p ~/mods/tool-count` type-checks the mod from a shell.

## 5. Test it

Add `hooks/count.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

test('each tool call moves the status line', async ($, on) => {
  const lines: (string | undefined)[] = []
  on('ui.status', (_, e) => {
    lines.push(e.text)

    return { value: undefined }
  })
  on('tool.call', () => ({ result: {} }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'pwd' })

  expect(lines).toEqual(['1 tool calls', '2 tool calls'])
})
```

```bash
claude plugin test ~/mods/tool-count
```

```
hooks/count.test.ts:
(pass) each tool call moves the status line

 1 pass
 0 fail
```

A test runs the mod against the real engine with nothing beneath it. So the test supplies the bottom of the chain itself:

- `on('ui.status', …)` stands for the engine's status line and records what the mod pinned. A call on `$` is answered with `{ value }`.
- `on('tool.call', …)` stands for the tool and answers with the event's own result, `{ result }`.
- `$.tool.call(…)` raises the event the way a session does, through the mod's hook and down to the test's.

## 6. Where to go from here

| You want to | Read |
|---|---|
| Understand `next` properly | [The hook chain](hook-chain.md) |
| Draw something | [Drawing in the interface](drawing.md) |
| See complete, larger mods | [Example mods](examples.md) |
| Add the mod to this marketplace | [Publishing a plugin](../install/publish.md) |

> **Tip.** You can also ask Claude to write a mod. Claude Code ships a `plugin-authoring` skill: say "make a mod that shows the last turn's duration above the prompt" and Claude writes the three files in a session folder, asks once whether to turn them on, and reloads them at the end of each turn that edits them.
