# repo-brief: shape what the model reads

This example gives the model two pieces of context it would otherwise have to discover: the project's house rules, from a file, and the current git branch. It shows the two places a mod can add context, and why they differ.

![How the repo-brief example works. Steady text: when a thread renders its system prompt, the prompt.compose hook reads house-rules.md and appends a section, which is sent once and is then fixed for the thread. Changing text: for every prompt you type, the prompt.submit hook asks git for the branch and attaches it as context the model reads and you never see. The model knows the rules from the system prompt and the branch fresh with each prompt](../images/example-repo-brief.svg)

## Files

```
repo-brief/
├── .claude-plugin/plugin.json
├── hooks/hooks.json            # { "modules": ["./register.ts"] }
├── hooks/register.ts
└── hooks/brief.test.ts
```


## The module

```ts
import type { Register } from 'claude-code'

const RULES = '.claude/house-rules.md'

export const register: Register = on => {
  // Steady text: one more section of the system prompt, sent once per thread.
  on('prompt.compose', async ($, e, next) => {
    const { sections } = await next(e)
    const text = await $.fs.read(RULES).then(
      file => file.trim(),
      () => '',
    )

    if (text === '') {
      return { sections }
    }

    return {
      sections: [
        ...sections,
        { id: 'repo-brief:rules', text: `# House rules of this project\n\n${text}`, scope: 'session' },
      ],
    }
  })

  // Changing text: a block beside each prompt, which the model reads and the user never sees.
  on('prompt.submit', async ($, e, next) => {
    if (e.command !== undefined || e.isMeta === true) {
      return next(e)
    }
    const git = await $.process
      .run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 3000 })
      .catch(() => undefined)
    const branch = git?.exitCode === 0 ? git.stdout.trim() : ''

    if (branch === '') {
      return next(e)
    }

    return next({ ...e, context: [...(e.context ?? []), `Current git branch: ${branch}`] })
  })
}
```

## How it works

- **React, then add.** The `prompt.compose` hook first awaits `next(e)`, which resolves to the sections as the engine composed them, then returns the list with one more at the end.
- **A section has an id and a scope.** A mod's own id is `<plugin>:<name>`. `scope: 'session'` puts the text after the prompt cache boundary, where text that differs per project belongs. A `shared` section must read the same for everyone on this build.
- **A missing file is not an error.** `$.fs.read` rejects when the file is absent. The hook turns that into an empty string and returns the sections untouched. Paths are relative to the session's working directory.
- **Context beside the prompt.** The `prompt.submit` hook rewrites the input on its way down, adding to `e.context`. The model reads each entry as a block after the prompt; the user never sees it.
- **Leave commands alone.** When `e.command` is set, the submission runs a slash command, and when `e.isMeta` is true, the person did not type it. The hook passes both through.
- **A process by argv.** `$.process.run` takes an argument list, not a shell line, and here a three-second limit. A failure, or a folder that is no git repository, leaves the prompt as it was.

## Why two hooks

House rules do not change during a conversation, so they go in the system prompt: sent once, cached, cheap. The branch can change between two prompts, and the system prompt of a running conversation cannot be changed; see the picture in [Behaviour and limitations](limits.md). So the branch travels with each prompt, as a new row at the end.

## The test

```ts
import { expect, test } from 'claude-code/testing'

test('the branch rides beside a typed prompt', async ($, on) => {
  let context: readonly string[] | undefined
  on('process.run', () => ({
    value: { exitCode: 0, stdout: 'feature/login\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
  }))
  on('prompt.submit', (_, e) => {
    context = e.context

    return { text: e.text, context: e.context }
  })

  await $.prompt.submit({ text: 'fix the login test', wait: false, origin: { kind: 'composer' } })

  expect(context).toEqual(['Current git branch: feature/login'])
})
```

The test answers `process.run` in git's place and reads the context that reached the bottom of the chain.

## Limits to know

- The section's text is read when a thread renders its system prompt. Edit the rules file mid-conversation and the change waits for a new thread or a compaction.
- The `prompt.submit` hook runs a process for every prompt. Keep such a hook fast; its own time budget is ten seconds, though time spent inside the `$` call does not count against it.
- Context is capped: past 100,000 characters per entry the model reads a head and a path.
- Validation lists this hook as `gating hook without .catch`, because a `prompt.submit` hook may drop a prompt. This one never does, so failing open is right.
