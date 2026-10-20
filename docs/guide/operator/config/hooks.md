# Hooks

This page documents `hooks/hooks.json`, the one shipped hook, its script wrapper and the environment it runs in.

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
