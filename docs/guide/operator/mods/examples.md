# Example mods

This page introduces five small mods, each built on a different mechanism, written from the developer's side: what the mod is for, which events and calls it uses, and why it is shaped the way it is. Each has a page with its full source.

| Mod | What it is for | Mechanisms | Lines |
|---|---|---|---|
| [path-guard](example-path-guard.md) | Refuse edits to protected files; soften a forced `git push` | `tool.call`: answer with `{ deny }`, rewrite with `next({ …e })`, fail closed with `.catch` | 37 |
| [turn-meter](example-turn-meter.md) | A row above the prompt with the last turn's duration and tool count | `turn.start`, `tool.call`, `turn.complete`; `$.state`; a band; a `Button`; a toast; `userConfig` | 64 |
| [decision-log](example-decision-log.md) | A tool the model calls to record a design decision, and a pane that lists them | `$.tool.register`, `tool.run`; `$.command.register`; a pane; `$.store` | 79 |
| [repo-brief](example-repo-brief.md) | Give the model the project's house rules and the current branch | `prompt.compose`, `prompt.submit` with `context`; `$.fs`; `$.process` | 42 |
| [ci-watch](example-ci-watch.md) | The latest CI run in the status line; notify and wake the session on a failure | `$.clock.every`; `$.process.run`; `$.ui.status`; `$.ui.notify`; `$.prompt.submit` | 57 |

Together they cover the four moves of [The hook chain](hook-chain.md), four of the six drawing sites, all three places to keep a value, and work with no event behind it.

## How to run one

Each page lists the mod's files. Create them in a folder of their own, then:

```bash
claude plugin validate ~/mods/path-guard     # what it hooks and calls
claude plugin test ~/mods/path-guard         # its tests
claude --plugin-dir ~/mods/path-guard        # a session with it loaded
```

All five were validated and tested with Claude Code 2.1.326. The mod API is early access, so on a newer build run the first two commands before you rely on one.

## What the examples leave out

They are teaching mods. Before shipping one, add what [Publishing a plugin](../install/publish.md) asks for: a README, a LICENSE, an `author` in the manifest. The validator's plugin directory checks list what is missing.

They also keep their rules in the source: the protected paths, the `gh` command line. A mod meant for other people moves such things into `userConfig`, as turn-meter and ci-watch do for their numbers.
