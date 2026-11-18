# Events and the engine interface

This page lists the events most mods hook and the parts of `$` most mods call, and says where the complete, exact reference lives. Use it to find the name of the thing you need.

## Events over one turn

![The events a mod can hook, in the order a session raises them. When the session starts: register and session.start. When you send a prompt: prompt.submit, prompt.compose and turn.start. While the model works: turn.step, tool.call, tool.check and tool.run. When the turn ends: session.append, turn.complete and session.end. At any time: ui.render, ui.press, ui.input, command.run and timers](../images/mod-events.svg)

## The events worth knowing

| Event | Raised when | A hook can |
|---|---|---|
| `session.start` | The session is ready, before the first prompt. Awaited | Register commands, tools and agents; start timers; open a pane |
| `session.end` | The session ends, or `/clear` runs (`reason: 'clear'`) | Save, within a short time bound |
| `session.compact` | The conversation is compacted | Record the compaction's usage |
| `prompt.submit` | A prompt is submitted, by a person or a mod | Rewrite `text`, attach `context` the model reads, or `{ drop }` it |
| `prompt.compose` | A thread renders its system prompt | Append, replace, reorder or drop sections |
| `prompt.context` | A conversation computes the context blocks of its first message | Add or remove blocks |
| `turn.start` | A turn begins, the main one or a subagent's (`agentId`) | Reset per-turn values |
| `turn.step` | One model request. Streams | Read usage, rewrite chunks |
| `turn.complete` | A turn ends, with `answer`, `durationMs`, `reason` and `usage` | Notify, record, add a closing line |
| `tool.call` | The engine is about to run a tool | Deny, rewrite the input, answer in the tool's place, read the result |
| `tool.check` | The engine decides whether a call may run | Return a `{ decision }`: allow, ask or deny |
| `tool.run` | A call is allowed and about to run | Serve a tool the mod registered; audit what really runs |
| `tool.describe` | A tool's description is prepared for the model | Change the description, or whether it waits behind tool search |
| `session.append` | A row is about to be stored in the conversation | Rewrite its text before it is kept, for example to redact |
| `command.run` | Someone runs a slash command | Answer a command the mod registered with `{ text }` |
| `ui.render` | A drawing site needs content | Return a tree, change the engine's props, or leave it |
| `ui.press`, `ui.input`, `ui.select` | A button, field or picker of a mod's drawing is used | Usually handled by the element's own `onPress` and the like |
| `config.set` | A setting changes | Refuse or observe |
| `agent.spawn` | A subagent is started | Observe or change the spawn |
| `skill.prompt` | A skill's body is rendered into the conversation | Rewrite or mask it |

The settings hooks' own events are hookable too, under a `classic.` prefix: `classic.Stop`, `classic.PreToolUse`, `classic.SessionEnd`. The input there is what a command hook receives on stdin.

> **Note.** Most of these events fire for subagents as well as the main conversation. Where it matters, check `e.agentId`: it is absent on the main thread.

## The engine interface

Every hook receives `$`. A call is always a noun, then a method.

| Noun | What it reaches | Calls you will use first |
|---|---|---|
| `$.ui` | The interface | `status`, `toast`, `notify`, `log`, `open`, `close`, `resolve`, `invalidate`, `copy` |
| `$.state` | Values held for the session, with versions | Used through `atom`, `read` and `update` from `'claude-code'` |
| `$.store` | Values kept across sessions | `get`, `set`, `delete`, `keys` |
| `$.clock` | Time | `now`, `every`, `after`, `sleep` |
| `$.fs` | Files | `read`, `write`, `list`, `stat` |
| `$.process` | Host commands | `run(argv, { cwd, env, stdin, timeoutMs })`, `spawn` for a stream |
| `$.http` | The network | `fetch(url, init)` |
| `$.model` | Model calls | `complete` for one completion with no history, `fork` to ask a question over the session's own transcript |
| `$.tool` | Tools | `register`, `call`, `check`, `list` |
| `$.command` | Slash commands | `register`, `run` |
| `$.agent` | Subagents | `register`, `spawn`, `list` |
| `$.prompt` | The prompt box and the queue | `submit`, `fill`, `read`, `paint` |
| `$.session` | The conversation | `messages`, `append`, `usage`, `version` |
| `$.env` | Environment variables | `get` |
| `$.plugin` | The mod itself | `name`, `root` (its folder, for files it ships) |
| `$.theme`, `$.audio` | Colours and sound | `theme.set`, `audio.play` |
| `$.config`, `$.settings` | Options and settings | Listing and changing them |

A call on `$` is itself an event. `$.fs.write` raises `fs.write`, `$.ui.toast` raises `ui.toast`. That is why a mod further out can refuse another mod's call, and why a test can answer any call with a hook of its own.

## Where the exact reference is

This page is a map. The authority is the declaration file the engine writes, which lists every event with its input and result, every method on `$` with a doc comment and an example, and every element a drawing may contain.

| Where | When it is there |
|---|---|
| `<mod>/.claude-plugin/types/claude-code/index.d.ts` | After the engine has loaded the mod from a folder it hot-reloads. Rewritten at every load, so it always matches the installed Claude Code |
| `<mod>/.claude-plugin/types/claude-code-tools/index.d.ts` | The same moment. The built-in tools' inputs, so that `e` narrows per tool |
| `<mod>/.claude-plugin/types/tsconfig.json` | The same moment. The mod's own `tsconfig.json` is one line: `{ "extends": "./.claude-plugin/types/tsconfig.json" }` |

The API file is about 26,000 lines in Claude Code 2.1.326. Do not read it; search it for the name at hand.

```bash
grep -n "'tool.call'" plugins/<name>/.claude-plugin/types/claude-code/index.d.ts
grep -n "export type ToolCallResult" plugins/<name>/.claude-plugin/types/claude-code/index.d.ts
```

Two more sources are worth knowing.

- `claude plugin validate <mod>` reads a module the way the engine will and prints which events it hooks and which `$` calls it makes. It is the quickest check that the engine sees what you meant.
- Claude Code ships a skill named `plugin-authoring`. Ask Claude to "make a mod that …" and it loads the skill, which carries the long-form reference and complete example modules for the build you are running.

Next: [Drawing in the interface](drawing.md).
