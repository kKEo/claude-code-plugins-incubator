# What is in the marketplace

This page describes each plugin in one screen, so you can decide which to install.

## frontend-scaffold

Builds a complete, ready-to-run Vue 3 web application from a description such as "a dashboard for managing deployments". The result is a folder with a login page, a list page with filters, a multi-step create form and a detail page, plus the small building blocks (buttons, tables, dialogs) they are made of. The generated application talks to any REST API; you point it at your own backend afterwards.

![Workflow of frontend-scaffold: you describe the app, the skill clarifies and generates the project, the validator agent checks it on request](images/workflow-frontend-scaffold.svg)

It also includes a checker that reads a generated project and reports whether it still follows the expected patterns, whether it compiles, and whether basic security and accessibility rules hold.

## feature-dev-documentalist

Keeps a written record of a feature while you build it. When you say "document this phase", it looks at what changed in git, works out whether you are writing a specification, designing, implementing, deploying or testing, and writes the matching document into a folder named after your branch under `docs/features/`.

![Workflow of feature-dev-documentalist: a hook reminds you, you ask, the skill detects the phase and an agent writes the document](images/workflow-feature-dev-documentalist.svg)

It also reminds you. When you are on a feature branch with unsaved changes and no document yet, a short tip appears at the end of a Claude turn suggesting that you document before committing.

## gitbook-docs-validator

Checks a documentation folder against a fixed layout: one landing page plus three books, one each for users, for people who run or develop the system, and for testers. It reports missing books, missing required pages, pages nobody can reach, broken links and images without descriptions, and then writes a short report with a verdict. This very documentation was written to pass it.

![Workflow of gitbook-docs-validator: you ask for a check, the skill locates the docs, a script runs the mechanical checks and the skill reviews the rest](images/workflow-gitbook-docs-validator.svg)

## plan-progress

Keeps the current plan and its progress in a pane beside the chat. When Claude plans in plan mode, the pane picks up the plan file and shows it as a document (the **Plan** view) and as phases and steps with a glyph per step (the **Progress** view): done, in progress or pending. The steps are ticked from the tasks and todos Claude creates while it works, from the plan's own checkboxes, or, when neither exists, by Claude itself: once you approve a plan, Claude is asked to mark each phase or step as it starts and finishes it through the mod's `mark_step` tool. A progress bar with a count sits above them; a short summary such as `plan 3/5 ✓ · Running tests` also appears under the prompt.

![Workflow of plan-progress: Claude writes a plan, the mod picks it up, Claude works and marks steps, and the mod shows progress](images/workflow-plan-progress.svg)

The pane opens by itself in a fullscreen terminal wide enough to dock it; `/plan-progress` toggles it open or closed at any time (`on` and `off` do so explicitly), `/plan-progress plan` or `/plan-progress progress` switches the view, and `/plan-progress <path>` loads a plan file by hand. Two switches in `/config`, "Open pane at start" and "Plan status line", turn the automatic opening and the summary under the prompt off. Unlike the other plugins this one is a *mod*: a small TypeScript module that draws into the Claude Code interface instead of adding skills or agents.

## session-cost

Lists the session's model requests, newest first, in a pane beside the chat, with the tokens and cost of each. Every request is recorded the whole time, whether the pane is open or not; the pane draws the newest 300, and the totals count all of them. Each entry shows the model, whether it came from the main conversation, a subagent or a compaction, how long it took, written on a short bar that compares it to the slowest request on the list, the input, output and cache token counts, and two costs: the request's share of the `/cost` total and an estimate from list prices. The header sums the session. A **Models** view breaks the totals down by model, a **History** view shows today, the last 7 days, the last 30 days by default and recent sessions, and a **Days** view splits spend by calendar day: this session beside all sessions, so a session left open for several days is counted on the days it actually spent. A short summary such as `$0.544 · 3 req · 130k tok` appears under the prompt and in a chip above it.

![Workflow of session-cost: a model request ends, the mod records its tokens, costs it and adds it to the totals](images/workflow-session-cost.svg)

`/session-cost` toggles the pane (`on` and `off` do so explicitly), `/session-cost requests`, `models`, `history` or `days` opens it on that view, and `/session-cost reset` clears this session's requests, totals and day split, and the history entry saved for it. To toggle it from the keyboard, bind a chord to the `app:toggleReplTab` action in `~/.claude/keybindings.json` (for example `ctrl+x c` in the `Global` context). The chord works only while the chip is shown and no dialog is open, so keep the chip on. The chip's button performs the same toggle. If `app:toggleReplTab` already does something in your setup, choose another action under *Toggle key action* in `/config` and bind that one instead.

Five switches in `/config` change the mod. *Open pane at start* (off by default) opens the pane when a session starts. *Cost status line* and *Cost chip above the prompt* (both on by default) show the summary under the prompt and the chip; switch either off to hide it. *Toggle key action* picks the action the keyboard toggle uses. *History days* (30) sets how many days of totals are kept. Like plan-progress, this is a *mod*.

## implementation-spec

Writes a specification for a feature that does not exist yet, complete enough to hand to an agent that will build it. Ask Claude to write a spec for a feature, or to spec it out before any code is written, and it explores the repository, asks at most four questions it cannot answer itself, and writes `docs/specs/<date>-<slug>.md`. The spec has numbered requirements, exact contracts, ordered steps, tests and a security section. A readiness reviewer then checks it before it is handed back. Running it again for the same feature updates the same file. It is the forward counterpart of feature-dev-documentalist, which documents work after the code exists.

![Workflow of implementation-spec: you request a spec, an agent explores the codebase, the skill interviews and writes, and a reviewer agent audits the result](images/workflow-implementation-spec.svg)

## memors-hooks

Runs the memors-mcp knowledge base alongside Claude. The plugin starts the `memors` server, whose tools search, read and record facts in the knowledge base, and it adds five hooks. At the start of a session it adds an index of what the knowledge base holds. Before a Bash command it can block one that changes trust or writes to the knowledge base from the command line. After a web fetch it can point at a page already stored. At the end of a turn it can remind Claude, once, to record what it found. The prompt hook that matches addresses to each prompt is off until you set `MEMORS_HOOK_RECALL=1`. The hooks never write to the knowledge base, and if `memors-mcp` or `jq` is missing they do nothing. Set `MEMORS_KB` per project so the hooks read the knowledge base the server writes.

![Workflow of memors-hooks: hooks orient the session, guard the knowledge base, point at stored pages and remind Claude to record findings](images/workflow-memors-hooks.svg)

## rigorous-review

A strict pre-merge review. Ask Claude to do a rigorous review, review this diff, or stress-test a change before it ships, and it reads the diff against the default branch (or the PR, branch or path you name) and the code around each hunk. It checks logic and edge cases, concurrency and state, security and data integrity, performance and scale, and over-engineering. Every finding gets a severity, a `file:line`, the failure mode and a minimal fix. It does not praise, does not pad the report with style nitpicks, and replies `No critical issues found.` when the change is clean. It only reads; it never edits files.

## Not a plugin

The repository also contains a folder named `gitbook-docs-validator-workspace`. It holds test runs and sample documentation used while developing the validator. It cannot be installed and you can ignore it.
