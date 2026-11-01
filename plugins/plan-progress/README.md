# plan-progress

A Claude Code mod that keeps the current plan and its progress in a pane beside the chat.

## What it shows

- A progress bar with the share of done items, the item being worked on now, and the plan file name.
- **Progress view**: the plan's phases and steps (parsed from the plan markdown written in plan mode) with a glyph per step: `✓` done, `▶` in progress, `·` pending. Steps are marked from the session's tasks (TaskCreate / TaskUpdate / TaskList) or todos (TodoWrite); plan checkboxes (`- [ ]` / `- [x]`) count when there are no tasks. Tasks that match no plan step are listed below.
- **Plan view**: the plan markdown itself.
- A status-line entry under the prompt: `plan 3/5 ✓ · Running tests`.

The pane opens by itself in a fullscreen terminal wide enough to dock it, and follows plan mode: the plan file is picked up from the plan-mode reminders and from `ExitPlanMode`, and re-read whenever the model edits it.

## Command

```
/plan-progress            toggle the pane: open it (loading the newest ~/.claude/plans/*.md when none is known) or close it
/plan-progress on|off     open or close it explicitly
/plan-progress plan       open it on the plan view
/plan-progress progress   open it on the progress view
/plan-progress <path>     load a specific plan file
```

The pane's own close mark (or ctrl+x x while it holds the keyboard) closes it too.

## Settings

Two switches, shown in `/config` under the plugin and stored in `pluginConfigs["plan-progress"].options`:

| Field | Default | Meaning |
|---|---|---|
| `autoOpen` | `true` | Open the pane by itself when a session starts. Off, the pane only opens with `/plan-progress`. |
| `statusLine` | `true` | Show the `plan 3/5 ✓ · …` summary under the prompt. |

A change in `/config` reloads the mod with the new values.

In the pane, `g` and `p` switch the views while it holds the keyboard (ctrl+x tab).

## Install

At the prompt of a terminal session:

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install plan-progress@km-plugin-registry
```

For development, run a session with the folder loaded and hot-reloaded:

```
claude --plugin-dir plugins/plan-progress
```

## Files

- `hooks/register.tsx`: the hooks module (session start, command, plan and task collection, the pane).
- `hooks/progress.ts`: the pure plan parser and progress computation.
- `types/index.d.ts`: the state contract (`plan`, `tasks`, `todos`, `view`).
- `hooks/*.test.ts(x)`: run with `claude plugin test plugins/plan-progress`.
