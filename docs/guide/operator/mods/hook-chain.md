# The hook chain

This page explains the one idea every mod is built on: a hook is a link in a chain, and what it does with `next` decides what happens to the event. Read it before any of the reference chapters.

## One function shape

Every hook is added with `on` and has the same three parameters.

```ts
on('tool.call', { tool: 'Bash' }, ($, e, next) => {
  return next(e)
})
```

| Part | What it is |
|---|---|
| `'tool.call'` | The event's name. |
| `{ tool: 'Bash' }` | The matcher, optional. The hook runs only for inputs it matches. |
| `$` | The engine interface: every call to the outside, spelled noun then method (`$.ui.status`, `$.fs.read`). |
| `e` | The event's input: plain, frozen data. For `tool.call` on `Bash` it has `command`; on `Edit` it has `file_path`. |
| `next` | A function that runs the rest of the chain and resolves to the event's result. |

Types narrow with the matcher. Inside a hook matched on `{ tool: 'Bash' }`, `e.command` is a string and your editor knows it.

## The chain

When the engine raises an event, the hooks of every loaded mod are lined up in a chain. The input travels inward, link by link, until it reaches the engine's own behaviour, called core. The result travels back out the same way.

![The hook chain. The engine raises an event; its input travels inward through five tiers, prepend, user, append, builtin and core, each link calling next. The result travels back out the same way. Mods you install sit in the user tier. A link further out sees the call first and the result last](../images/hook-chain.svg)

The chain has five tiers, outermost first.

| Tier | Who is in it |
|---|---|
| `prepend` | Mods an organization's administrator lists to run first |
| `user` | Every mod a person installs. Yours is here |
| `append` | Mods an administrator lists to run last |
| `builtin` | Mods shipped inside the Claude Code binary |
| `core` | The engine itself: the permission prompt and the tool, the real drawing, the real store |

Outer means more authority. A managed mod in `prepend` can refuse a tool call before your hook ever sees it, and can change your hook's result on the way back. Do not rely on being the first or the only hook of an event.

## The four moves

What a hook does is decided by how it uses `next`.

![The four things a hook can do. Pass: return next(e), and the call goes on unchanged. Rewrite: call next with a changed input, so everything beneath sees your version. Answer: return a deny or a result without calling next, so nothing beneath runs. React: await next(e), act on the result, then return it](../images/four-moves.svg)

**Pass.** Call `next(e)` and return what it gives. Use it to count, time or log.

```ts
on('tool.call', ($, e, next) => {
  calls += 1
  return next(e)
})
```

**Rewrite.** Call `next` with a changed copy of the input. Everything beneath your hook, including the permission prompt, sees the new version. `e` is frozen, so spread it.

```ts
on('tool.call', { tool: 'Bash' }, ($, e, next) =>
  next({ ...e, command: e.command.trim() }),
)
```

**Answer.** Return without calling `next`. Nothing beneath runs. For `tool.call`, `{ deny: 'reason' }` refuses the call and the model reads the reason as the tool's error; `{ result }` stands in for the tool.

```ts
on('tool.call', { tool: 'Edit' }, ($, e, next) =>
  e.file_path.endsWith('.env') ? { deny: 'That file is protected.' } : next(e),
)
```

**React.** Await `next(e)`, look at the result, then return it.

```ts
on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
  const ran = await next(e)
  $.ui.status(ran.isError === true ? 'last command failed' : undefined)
  return ran
})
```

Each event says in its own documentation which moves it allows and what a refusal looks like there: `{ deny }` for a tool call, `{ drop }` for a prompt, `{ decision: 'deny' }` for a permission check.

## Matchers

A matcher is an object whose fields must equal the event's. The fields you can match on depend on the event.

| Event | Matcher | Meaning |
|---|---|---|
| `tool.call`, `tool.run` | `{ tool: 'Edit' }` | One tool. A tool a mod registered is `mcp__<plugin>__<name>` |
| `ui.render` | `{ component: 'Pane', requestId: 'notes' }` | One drawing site, and one instance of it |
| `command.run` | `{ command: 'decisions' }` | One slash command |
| `prompt.section` | `{ name: 'memory' }` | One named section of the system prompt |

Leave the matcher out and the hook runs for every input of the event. A hook on `tool.call` with no matcher sees every tool call of the session, the subagents' included.

## Guards need a `.catch`

A hook that throws, answers a wrong shape or takes too long is skipped, and the chain goes on without it. For a hook that only watches, that is the right behaviour. For a hook that guards, it means the thing it guards against goes through.

`on` returns a registration with a `.catch` method. Its handler is asked when the hook fails.

```ts
on('tool.call', { tool: 'Edit' }, ($, e, next) =>
  isProtected(e.file_path) ? { deny: 'That file is protected.' } : next(e),
).catch(($, e, next) =>
  next.called ? next(e) : { deny: 'The guard failed, so the edit is refused.' },
)
```

`next.called` says whether the hook had already called `next` before it failed. If it had, `next(e)` in the handler replays what that call settled to, and nothing runs twice. If it had not, the handler refuses. So a guard should judge first and call `next` after.

`claude plugin validate` lists every hook whose answer can refuse something, as `gating hook with .catch` or `gating hook without .catch`. That is a note, not a warning: whether a given hook should fail open or closed is your decision. [Behaviour and limitations](limits.md) has the picture.

## What else `next` carries

| Member | Use |
|---|---|
| `next.signal` | Aborts when the dispatch is abandoned: the user interrupted, another hook settled first, or your budget ran out. Pass it to anything you started for this dispatch |
| `next.budget.remainingMs` | The time your hook has left. Skip the slow path when it is short |
| `next.called` | In a `.catch` handler: whether the failed hook had called `next` |
| `next.error` | In a `.catch` handler: why the hook failed, `throw` or `timeout` |

## Streaming events

Two events deliver their result in pieces: `turn.step`, one model request, and `process.spawn`, a child process's output. A hook on either is an async generator, and `next(e)` is the stream beneath it.

```ts
on('turn.step', async function* ($, e, next) {
  const result = yield* next(e) // forward every chunk unchanged
  return result
})
```

`yield* next(e)` forwards the stream and evaluates to the final result. session-cost uses this hook to record each request's token usage.

Next: [Events and the engine interface](events.md).
