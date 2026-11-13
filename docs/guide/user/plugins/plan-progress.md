# plan-progress

Keeps the current plan and its progress in a pane beside the chat. When Claude plans in plan mode, the pane picks up the plan file and shows it as a document (the **Plan** view) and as phases and steps with a glyph per step (the **Progress** view): done, in progress or pending. The steps are ticked from the tasks and todos Claude creates while it works, from the plan's own checkboxes, or, when neither exists, by Claude itself: once you approve a plan, Claude is asked to mark each phase or step as it starts and finishes it through the mod's `mark_step` tool. A progress bar with a count sits above them; a short summary such as `plan 3/5 ✓ · Running tests` also appears under the prompt.

![Workflow of plan-progress: Claude writes a plan, the mod picks it up, Claude works and marks steps, and the mod shows progress](../images/workflow-plan-progress.svg)

## What to type

Plan in plan mode as usual; the pane fills by itself. To open or close it, or to switch between the plan text and the step list:

```
/plan-progress
/plan-progress plan
/plan-progress progress
```

`/plan-progress <path>` loads a plan file by hand.

## How it works

![How plan-progress works: Claude writes a plan file, the mod picks it up, Claude works through it with tasks, todos and the mark_step tool, and the mod works out each step state for the pane, the progress bar and the status line](../images/how-plan-progress.svg)

The numbers match the picture.

1. **Claude writes the plan** in plan mode: a plan file with phases and steps.
2. **The mod picks it up** and reads the phases and steps from the plan's markdown.
3. **Claude works through it,** creating tasks and todos, or ticking the plan's own checkboxes.
4. **Claude marks steps** through the mod's `mark_step` tool when there are no tasks or checkboxes to follow.
5. **The mod works out each step's state** (done, in progress or pending) and draws it in the pane, the progress bar and the status line.

## Details

The pane opens by itself in a fullscreen terminal wide enough to dock it; `/plan-progress` toggles it open or closed at any time (`on` and `off` do so explicitly), `/plan-progress plan` or `/plan-progress progress` switches the view, and `/plan-progress <path>` loads a plan file by hand. Two switches in `/config`, "Open pane at start" and "Plan status line", turn the automatic opening and the summary under the prompt off. Unlike the other plugins this one is a *mod*: a small TypeScript module that draws into the Claude Code interface instead of adding skills or agents.

## What it reads and writes

Nothing on disk. Its state lives in the session, and it reads the plan file without changing it. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install plan-progress@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
