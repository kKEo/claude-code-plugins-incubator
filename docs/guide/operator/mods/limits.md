# Behaviour and limitations

This page collects what a mod cannot do and how the engine behaves at the edges: when a hook fails, when it is slow, and when it tries to change something already sent to the model. Read it before you promise a feature.

## When a hook fails

A hook fails when it throws, returns a shape the event refuses, or runs out of time. The engine's rule is the same at every event: the failed hook is skipped, by itself, and the chain goes on as if it were absent.

![What the engine does when a hook fails. Without a catch handler the hook is skipped, the chain goes on and the tool runs: the guard fails open. With a catch handler the handler is asked, gets a second of its own, and can refuse: the guard fails closed. Time budgets: ten seconds of the hook's own time per dispatch, one second for a catch handler, five seconds to linger after an abort, and thirty seconds of engine calls in one render hook](../images/mod-failure.svg)

| Consequence | Detail |
|---|---|
| A broken mod cannot take the session down | The session carries on; only the failed hook is missing |
| A guard fails open by default | If your `tool.call` guard throws, the tool runs. Add `.catch` to refuse instead; see [The hook chain](hook-chain.md) |
| You are told once | While the mod loads from a watched folder, the transcript shows one dim line naming the mod, the event and the reason. In any other session that line goes to the debug log only |
| A module that does not load is not half-loaded | None of its hooks run. The plugin's `skills/` and `commands/` files still load |

## Time budgets

| Budget | Value | What counts |
|---|---|---|
| One dispatch of one hook | 10 s | The hook's own code only. Time spent inside `next(e)` or inside a `$` call does not count, except a `$.clock.sleep` |
| A `.catch` handler | 1 s | From the moment the handler is called |
| Lingering after an abort | 5 s | After `next.signal` aborts, before the hook is reported as lingering |
| `$` calls in one `ui.render` or `tool.list` hook | 30 s in all | All the hook's `$` calls together |
| `$.process.run` | 30 s by default, 10 min at most | Set `timeoutMs` |

A minute-long `$.model.complete` inside a hook costs the hook nothing from its own budget. A loop that polls with `$.clock.sleep` pays every sleep. Long work belongs on a timer, not in a hook.

## The sandbox

| Not available | Use instead |
|---|---|
| `require`, Node's built-in modules, npm packages that need them | Plain TypeScript, or a file of your own imported with `import` |
| Dynamic `import()` | A static `import` declaration. A module holding `import()` does not load |
| `fs`, `child_process`, `fetch` | `$.fs`, `$.process`, `$.http` |
| The DOM, `window`, `document` | Elements from `$.ui.resolve(e)` |
| `setTimeout`, `setInterval` for lasting work | `$.clock.after`, `$.clock.every` |

Web-standard globals are there: `URL`, `TextEncoder`, `AbortController`, `crypto.subtle`. Heavy computation can be compiled to WebAssembly and loaded with `$.wasm.compile`.

## What a thread has sent is fixed

This is the limit that surprises people most. A mod cannot change what the model was already sent in a conversation: the system prompt, the tool descriptions, the earlier messages.

![What a thread has already sent is fixed. The system prompt, the tool descriptions and the earlier messages have been sent and stay as they are. A mod adds new context as a new row at the end. The prompt cache is keyed on the prefix, so changing it makes every later request pay full price. A changed section or description waits for a new thread or a compaction](../images/fixed-prefix.svg)

| You want | What happens | Do this instead |
|---|---|---|
| To change a system prompt section mid-conversation | The new answer waits for a new thread or a compaction | Put steady text in `prompt.compose`; put changing text beside the prompt |
| To update a tool's description as things change | The same: it waits | Return the changing part in the tool's result |
| To give the model fresh context now | Works | `context` on `prompt.submit`, `context` on a tool result, or `$.session.append` with `type: 'user'` |
| To edit an earlier message | Not possible | Rewrite a row at `session.append`, before it is stored |

An answer can carry `breakPromptCache: true` to go out at once. It costs the whole prompt cache for that conversation, and a dim line names the mod that did it. Keep it for what must not wait.

## Limits on what you draw

| Limit | Value |
|---|---|
| Text drawn by one tree | The first 100,000 characters; the rest is replaced by a note saying how much was left out |
| `$.ui.status`, `$.ui.toast`, `$.ui.log` | The first 2,000 characters on the terminal, 10,000 on a remote surface |
| A command's or agent's `description`, a pane's `title` | Kept up to 4,096 characters |
| A tree around the question dialog | 12 rows on the terminal, 48 elsewhere |
| A tree that does not validate | The hook is skipped and the engine draws its own content |
| Toasts | One mod's new toast replaces only its own earlier one |
| A pane opened unasked | Seated only in a wide terminal; see [Drawing in the interface](drawing.md) |
| A headless run, `claude -p` | No surface: panes are not placed, `$.ui.notify` answers `no-surface` |

## Limits on what the mod may do

| Area | Limit |
|---|---|
| Another mod's state | Readable, never writable. Only the owner writes a `$.state` value |
| `$.store` | JSON only; 4 MiB per mod |
| `$.fs.read` | 4 MiB per read; read a larger file by ranges |
| `$.process.run` | 4 MiB of standard output, and the same of standard error; the rest is dropped |
| `$.ui.view` | Moves the view only in answer to the user's own input, never from a timer |
| `$.prompt.submit` | Starts a turn only once the session is idle |
| Model calls | Billed to the session's credentials and counted in its cost total. Nothing caps them per call, so count your own |
| Cost figures | `$.session.usage().cost` is a client-side estimate. Label it as one |

## Who is allowed to load a mod

A mod is the user's own code path into the session, so several settings can keep it out.

| Setting or flag | Effect |
|---|---|
| `--safe-mode`, `--bare` | Turn off what a person installed. An organization's managed mods stay |
| Managed `allowManagedHooksOnly` | A mod in the `user` tier loads no hooks |
| Managed `disableAllHooks` | Hooks modules are off |
| An untrusted workspace | A mod Claude writes in the session is not turned on |
| `engines["claude-code"]` in `plugin.json` | A copy outside the stated version range is off whole |

In an organization, managed mods in the `prepend` and `append` tiers sit around yours. They can refuse your calls, and withhold parts of `$` from you: a call to a withheld noun fails with `removed by plugin`.

## Early access

The mod API is early access and moves between Claude Code releases.

- Pin nothing to a doc page, this one included. The declaration file written beside your mod is the contract for the build that wrote it.
- After a Claude Code update, run `claude plugin validate` and `claude plugin test` on every mod before you trust it.
- Give a hook that uses a new prop a `.catch` that draws without it, so an older Claude Code still shows something.
- `claude plugin validate` is a check for authors and listings. It is not a guarantee and not a security boundary: a module that never went through it loads all the same.

Next: [Example mods](examples.md).
