# Hooks

This page documents `hooks/hooks.json` in its two forms: the shell-command hooks that feature-dev-documentalist and memors-hooks ship, and the TypeScript modules that mods use. It also covers the script wrapper and the environment they run in.

## hooks.json

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" check-undocumented",
            "async": true
          }
        ]
      }
    ]
  }
}
```

| Field | Meaning | Value here |
|---|---|---|
| event key (`Stop`) | When to run. Claude Code events include `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `SessionStart`, `Notification` | `Stop`: end of each Claude turn |
| `matcher` | Regex on the tool name for tool events; empty matches everything | `""` |
| `type` | `command` runs a shell string | `command` |
| `command` | The shell string; `${CLAUDE_PLUGIN_ROOT}` expands to the installed plugin directory | the wrapper plus the script name |
| `async` | `true` runs without blocking the turn; output arrives when ready | `true` |
| `timeout` | Seconds before the hook is killed; default 60 | not set |

memors-hooks uses the same form with five events: `SessionStart` (`orient`), `UserPromptSubmit` (`recall`, opt-in), `PreToolUse` on `Bash` (`guard-cli`, the only hook that can block), `PostToolUse` (`check-known-source` and `track`) and `Stop` (`nudge-remember`). Each sets its own `timeout`, and each runs through the same `run-hook.cmd` wrapper described below.

## Hooks modules (mods)

`plan-progress` and `session-cost` ship a different kind of `hooks/hooks.json`: `{ "modules": ["./register.tsx"] }`. Instead of shell commands keyed by event, each names one TypeScript module exporting `register(on, options)`, where `options` holds the plugin's `/config` values. The module subscribes to engine events and draws into the interface.

- plan-progress subscribes to `session.start`, `command.run`, `tool.call`, `prompt.attachment` and `ui.render`, and draws a pane. It registers a tool of its own, `mcp__plan-progress__mark_step`, which the model calls to mark plan steps done.
- session-cost subscribes to `session.start`, `turn.step` (every model request), `session.compact`, `turn.complete`, `session.end`, `command.run` and `ui.render`. It reads the `/cost` ledger through `$.session.usage()`, keeps per-session totals across sessions in `$.store`, and borrows an engine keybinding action (`toggleAction`) for its chip's button, so a user's chord can toggle the pane. Its Version view reads its own manifest with `$.fs.read`, the Claude Code version with `$.session.version()`, and the published manifest with `$.http.fetch`, only when the view opens with a stale check or on **Check now**. It registers no tool.

Such a module has no `hooks` key, so the reconciliation in `scripts/docs-check` skips it. Each is validated with `claude plugin validate plugins/<name>` and tested with `claude plugin test plugins/<name>`; `claude --plugin-dir plugins/<name>` runs it with hot reload while developing.

## The script wrapper

`run-hook.cmd` is a polyglot file. On Windows `cmd.exe` runs the batch half, which looks for Git for Windows bash in `C:\Program Files\Git\bin\bash.exe`, then `C:\Program Files (x86)\…`, then `bash` on `PATH`, and exits 0 silently if none is found. On Unix the shell skips the batch half (the first line is a no-op heredoc) and runs `exec bash "<dir>/<script>" "$@"`.

Hook scripts are extensionless (`check-undocumented`, not `check-undocumented.sh`) because Claude Code on Windows prepends `bash` to any command containing `.sh`, which would break the wrapper.

## check-undocumented

Runs after every turn and exits 0 silently unless all of these hold:

1. Inside a git repository, on a named branch.
2. The branch is not `main`, `master`, `develop`, `development`, `trunk` or `HEAD`.
3. `git status --short` is non-empty.
4. No directory matches `docs/features/*<branch>*`.

When they hold it prints a JSON object with the nudge text:

| Environment | Output shape |
|---|---|
| `CURSOR_PLUGIN_ROOT` set | `{"additional_context": "…"}` |
| `CLAUDE_PLUGIN_ROOT` set and `COPILOT_CLI` unset | `{"hookSpecificOutput": {"hookEventName": "Stop", "additionalContext": "…"}}` |
| otherwise | `{"additionalContext": "…"}` |

The nudge text is: `Tip: there are uncommitted changes on branch '<branch>' with no feature docs yet. Run /document-phase to capture this phase before committing.`

## Environment variables

| Variable | Set by | Used for |
|---|---|---|
| `CLAUDE_PLUGIN_ROOT` | Claude Code, while running a plugin hook | Locating scripts; selecting the Claude output shape |
| `CURSOR_PLUGIN_ROOT` | Cursor, when the same plugin runs there | Selecting Cursor's output shape |
| `COPILOT_CLI` | GitHub Copilot CLI | Selecting the generic output shape |

The script uses `set -euo pipefail` and wraps every git call so that a failure exits 0; a hook that exits non-zero would surface an error to the user on every turn.
