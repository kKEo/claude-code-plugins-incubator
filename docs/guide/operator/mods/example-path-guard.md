# path-guard: guard and rewrite tool calls

This example stands between the model and three tools. It refuses any edit to a `.env` file or to anything under `secrets/`, and it turns a forced `git push` into the safer `--force-with-lease`. It shows two of the four moves, answer and rewrite, and how a guard is made to fail closed.

![How the path-guard example works. The model calls Edit or Write with a file path, or Bash with a command. The mod matches the path and answers with a deny, returned without next so nothing beneath runs; for a git push it rewrites the command to use force-with-lease. The edit is refused and the model reads the reason; the softer push runs; if the guard itself breaks, its catch handler refuses the edit](../images/example-path-guard.svg)

## Files

```
path-guard/
├── .claude-plugin/plugin.json
├── hooks/hooks.json            # { "modules": ["./register.ts"] }
├── hooks/register.ts
└── hooks/guard.test.ts
```


## The module

```ts
import type { Register } from 'claude-code'

// Files no tool call may write: .env files and anything under secrets/.
const PROTECTED = /(^|\/)(\.env(\.[\w-]+)?$|secrets\/)/
const FORCE = /(\s)(--force|-f)(?=\s|$)/

const refusal = (path: string): string =>
  `path-guard: ${path} is protected. Ask the user to change it by hand.`

export const register: Register = on => {
  // Answer: return without calling next, so the tool never runs.
  on('tool.call', { tool: 'Edit' }, ($, e, next) =>
    PROTECTED.test(e.file_path) ? { deny: refusal(e.file_path) } : next(e),
  ).catch(($, e, next) =>
    next.called ? next(e) : { deny: 'path-guard: the guard failed, so the edit is refused.' },
  )

  on('tool.call', { tool: 'Write' }, ($, e, next) =>
    PROTECTED.test(e.file_path) ? { deny: refusal(e.file_path) } : next(e),
  ).catch(($, e, next) =>
    next.called ? next(e) : { deny: 'path-guard: the guard failed, so the write is refused.' },
  )

  // Rewrite: pass a changed input down, so everything beneath sees the new command.
  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    if (!/\bgit\s+push\b/.test(e.command)) {
      return next(e)
    }
    const command = e.command.replace(FORCE, '$1--force-with-lease')

    if (command !== e.command) {
      $.ui.toast('path-guard: --force became --force-with-lease')
    }

    return next({ ...e, command })
  })
}
```

## How it works

- **One hook per tool.** The matcher `{ tool: 'Edit' }` narrows `e`, so `e.file_path` is typed. `Write` gets a hook of its own for the same reason: its input is a different type.
- **Answer to refuse.** `{ deny: '…' }` is returned without calling `next`. Nothing beneath runs: no permission prompt, no tool. The model reads the text as the tool's error, so write it for the model. This one tells it what to do next.
- **Rewrite to soften.** For `Bash` the hook calls `next` with a changed `command`. The permission prompt shows the rewritten command, and that is what runs.
- **Fail closed.** The two guards carry a `.catch`. If the guard throws before judging, `next.called` is false and the handler refuses. The `Bash` hook has none: if the rewrite fails, the original command goes on to the permission prompt, which is acceptable.

`claude plugin validate` shows the difference:

```
  ❯ ./register.ts gating hook with .catch: tool.call{tool=Edit}
  ❯ ./register.ts gating hook with .catch: tool.call{tool=Write}
  ❯ ./register.ts gating hook without .catch: tool.call{tool=Bash}
  ❯ ./register.ts calls: $.ui.toast
```

## The test

```ts
import { expect, test } from 'claude-code/testing'

test('an edit of a protected file never reaches the tool', async ($, on) => {
  let ran = 0
  on('tool.call', () => {
    ran += 1

    return { result: {} }
  })

  const refused = await $.tool.call({
    tool: 'Edit',
    file_path: '/repo/.env.local',
    old_string: 'a',
    new_string: 'b',
  })
  expect(refused.deny).toMatch(/protected/)
  expect(ran).toBe(0)

  await $.tool.call({ tool: 'Edit', file_path: '/repo/src/app.ts', old_string: 'a', new_string: 'b' })
  expect(ran).toBe(1)
})

test('a forced push is rewritten before it runs', async ($, on) => {
  const seen: string[] = []
  on('ui.toast', () => ({ value: undefined }))
  on('tool.call', { tool: 'Bash' }, (_, e) => {
    seen.push(e.command)

    return { result: {} }
  })

  await $.tool.call({ tool: 'Bash', command: 'git push --force origin main' })
  await $.tool.call({ tool: 'Bash', command: 'rm -f build.log' })

  expect(seen).toEqual(['git push --force-with-lease origin main', 'rm -f build.log'])
})
```

The test's own `tool.call` hook sits beneath the mod and stands for the tool. Counting how often it runs proves the refused edit never reached it.

## Limits to know

- A path guard on spellings is best effort. A symbolic link, `..` or a `Bash` command such as `echo X > .env` gets past it. For a robust guard resolve the path first, `$.fs.stat(path, { resolve: true })`, and allow-list on `realPath`; and consider `tool.check` for `Bash`.
- The regular expression rewrites the first `--force` or `-f` after `git push`. A compound shell line can fool it. A real mod would parse the command, or deny instead of rewriting.
- Mods in an outer tier run first. An organization's managed mod may have refused or rewritten the call before this hook sees it.
