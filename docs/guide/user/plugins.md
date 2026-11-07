# What is in the marketplace

This page describes each plugin in one screen, so you can decide which to install.

## frontend-scaffold

Builds a complete, ready-to-run Vue 3 web application from a description such as "a dashboard for managing deployments". The result is a folder with a login page, a list page with filters, a multi-step create form and a detail page, plus the small building blocks (buttons, tables, dialogs) they are made of. The generated application talks to any REST API; you point it at your own backend afterwards.

It also includes a checker that reads a generated project and reports whether it still follows the expected patterns, whether it compiles, and whether basic security and accessibility rules hold.

## feature-dev-documentalist

Keeps a written record of a feature while you build it. When you say "document this phase", it looks at what changed in git, works out whether you are writing a specification, designing, implementing, deploying or testing, and writes the matching document into a folder named after your branch under `docs/features/`.

It also reminds you. When you are on a feature branch with unsaved changes and no document yet, a short tip appears at the end of a Claude turn suggesting that you document before committing.

## gitbook-docs-validator

Checks a documentation folder against a fixed layout: one landing page plus three books, one each for users, for people who run or develop the system, and for testers. It reports missing books, missing required pages, pages nobody can reach, broken links and images without descriptions, and then writes a short report with a verdict. This very documentation was written to pass it.

## plan-progress

Keeps the current plan and its progress in a pane beside the chat. When Claude plans in plan mode, the pane picks up the plan file and shows it as a document (the **Plan** view) and as phases and steps with a glyph per step (the **Progress** view): done, in progress or pending. The steps are ticked from the tasks and todos Claude creates while it works, and a progress bar with a count sits above them; a short summary such as `plan 3/5 ✓ · Running tests` also appears under the prompt.

The pane opens by itself in a fullscreen terminal wide enough to dock it; `/plan-progress` toggles it open or closed at any time (`on` and `off` do so explicitly), `/plan-progress plan` or `/plan-progress progress` switches the view, and `/plan-progress <path>` loads a plan file by hand. Two switches in `/config`, "Open pane at start" and "Plan status line", turn the automatic opening and the summary under the prompt off. Unlike the other plugins this one is a *mod*: a small TypeScript module that draws into the Claude Code interface instead of adding skills or agents.

## session-cost

Lists every request Claude sends to the model in a pane beside the chat, with its tokens and cost, recorded the whole time whether the pane is open or not. Each entry shows the model, whether it came from the main conversation, a subagent or a compaction, the input, output and cache token counts, and two costs: the request's share of the `/cost` total and an estimate from list prices. The header sums the session. A **Models** view breaks the totals down by model, and a **History** view shows today, the last 7 days and recent sessions. A short summary such as `$0.54 · 3 req · 130k tok` appears under the prompt and in a chip above it.

`/session-cost` toggles the pane (`on` and `off` do so explicitly), `/session-cost requests`, `models` or `history` opens it on that view, and `/session-cost reset` clears the session's list. To toggle it from the keyboard, bind a chord to the `app:toggleReplTab` action in `~/.claude/keybindings.json` (for example `ctrl+x c` in the `Global` context). The chip's button then answers it. Like plan-progress, this is a *mod*.

## Not a plugin

The repository also contains a folder named `gitbook-docs-validator-workspace`. It holds test runs and sample documentation used while developing the validator. It cannot be installed and you can ignore it.
