# Hooks

This page documents `hooks/hooks.json` in its two forms: the shell-command hooks that feature-dev-documentalist and memors-hooks ship, and the TypeScript modules that the four mods use. It also covers the script wrapper and the environment command hooks run in.

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

memors-hooks uses the same form with five events: `SessionStart` (`orient`), `UserPromptSubmit` (`recall`, opt-in), `PreToolUse` on `Bash` (`guard-cli`, the only hook that can block), `PostToolUse` (`check-known-source` and `track`) and `Stop` (`nudge-remember`). Each sets its own `timeout`, and each runs through the same `run-hook.cmd` wrapper described below. hooks.json cannot depend on a setting, so every script checks its own `/config` option first: Claude Code exports each plugin option to hooks as `CLAUDE_PLUGIN_OPTION_<KEY>` (key uppercased), and the script exits 0 when its option is off.

## Hooks modules (mods)

The four mods ship a different kind of `hooks/hooks.json`:

```json
{ "modules": ["./register.tsx"] }
```

| Field | Meaning |
|---|---|
| `modules` | A list with one path, relative to `hooks.json`, to a TypeScript or JavaScript module that exports `register(on, options)` |

Instead of shell commands keyed by event, the module adds function hooks to engine events with `on(event, matcher?, hook)`, and `options` holds the plugin's `/config` values. [Part II](../mods/README.md) explains the model; this section records what each shipped mod hooks and calls.

| Mod | Events hooked | Engine calls | Registers |
|---|---|---|---|
| plan-progress | `session.start`, `command.run`, `tool.call` (seven matchers, among them `ExitPlanMode`, `TaskCreate`, `TaskUpdate` and its own tool), `prompt.attachment`, `ui.render` | `$.fs` to read the plan file, `$.env`, `$.ui.open`, `$.ui.status` | `/plan-progress`; the tool `mcp__plan-progress__mark_step`, which the model calls to mark plan steps |
| session-cost | `session.start`, `turn.step`, `session.compact`, `turn.complete`, `session.end`, `command.run`, `ui.render` (pane and band) | `$.session.usage` for the `/cost` ledger, `$.store` for history, `$.fs.read` for its own manifest and, with `cacheTtlSplit`, the transcript files, `$.ui.status` | `/session-cost`. No tool |
| prompt-coach | `session.start`, `prompt.submit`, `command.run`, `ui.render` | `$.model.complete` to check a prompt's language, `$.store` for the corpus, `$.clock.after`, `$.ui.toast` | `/prompt-coach`. No tool |
| instances-monitor | `session.start`, `command.run`, `ui.render` | `$.clock.every`, `$.fs.list` and `$.fs.read` on `~/.claude/sessions`, `$.process.run` for `ps`, `$.ui.log` | `/instances`. No tool |

Two details of session-cost are worth copying. Its band button borrows an engine keybinding action (the `toggleAction` option), so a user's chord can toggle the pane. While the band is collapsed (`isCollapsed`), the band's hook skips its state reads and draws only that button, because the chord works only while the button is mounted.

A hooks module has no `hooks` key, so the reconciliation in `scripts/docs-check` skips it. Each mod is checked with `claude plugin validate plugins/<name>`, which lists the events it hooks and the `$` calls it makes, and tested with `claude plugin test plugins/<name>`; `claude --plugin-dir plugins/<name>` runs it with hot reload while developing.

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
