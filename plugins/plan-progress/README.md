# plan-progress

A Claude Code mod that keeps the current plan and its progress in a pane beside the chat.

## What it shows

- A progress bar with the share of done items, the item being worked on now, and the plan file name.
- **Progress view**: the plan's phases and steps (parsed from the plan markdown written in plan mode), each step with its id (`2.3`) and a glyph: `✓` done, `▶` in progress, `·` pending. Tasks that match no plan step are listed below.
- What counts, first match wins:
  1. the session's tasks (TaskCreate / TaskUpdate / TaskList),
  2. its todos (TodoWrite),
  3. the plan's steps: its checkboxes (`- [ ]` / `- [x]`) when it has any, else every step.

  Plan steps are ticked by the model through the mod's own tool, `mcp__plan-progress__mark_step` (`steps: ["2"]` for all of phase 2, `["2.3"]` for one step, `status: in_progress | completed | pending`). When a plan is approved with `ExitPlanMode`, the mod adds a note with the step outline and asks the model to report on it. Without this, a session that has no task or todo tools would always show 0%.

## How the plan is split

- When some heading names a unit of work (`Phase 2: …`, `Stage`, `Milestone`, `Step 3`, `1. Setup`), only those headings open phases; deeper headings inside a phase fold into it, and other sections (Context, Verification, …) are not counted.
- Otherwise every heading opens a phase, except note sections such as Context, Background, Goals, Notes, Open questions, Risks.
- A step is a bullet at the section's outermost indent; nested bullets are details of it. Bullets inside code fences are ignored.
- Marks are kept by step text, so editing the plan keeps them; loading a different plan file clears them.
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

- `hooks/register.tsx`: the hooks module (session start, command, the `mark_step` tool, plan and task collection, the pane).
- `hooks/progress.ts`: the pure plan parser and progress computation.
- `types/index.d.ts`: the state contract (`plan`, `tasks`, `todos`, `view`, `marks`).
- `hooks/*.test.ts(x)`: run with `claude plugin test plugins/plan-progress`.
