# Trust and privacy

This page says what each plugin reads, what it writes and what it runs without being asked, so you know what you can rely on.

## What runs on its own

Several plugins act without a prompt. Each is listed here with what it does and, where one exists, the switch that turns it off.

- **feature-dev-documentalist** registers a small script that runs at the end of each Claude turn. The script asks git for the branch name and whether there are uncommitted changes, and looks for a folder under `docs/features/`. If you are on a feature branch with changes and no folder, it adds a one-line tip to the conversation. It does not read file contents, write files or send anything anywhere. On `main`, `master`, `develop`, `development` and `trunk` it does nothing.
- **memors-hooks** runs at the start of a session, before each Bash command, after web fetches, at the end of each turn and, if enabled, on each prompt. At the start of a session it adds an index of the knowledge base (titles and addresses, no passage text) to the conversation. It can block a Bash command that changes trust or writes to the knowledge base. It can point at a page already stored after a web fetch, and add one reminder at the end of a turn. With `MEMORS_HOOK_RECALL=1` it adds up to three matching addresses to a prompt; that hook is off by default. The others have no switch and stop only when the plugin is uninstalled. Its hooks never write to the knowledge base.
- **session-cost** records every model request as its response ends, with its token counts and cost. Its summary under the prompt and its chip are on by default, and both can be switched off in `/config`. It opens its pane by itself only when *Open pane at start* is on, which it is not by default.
- **prompt-coach** saves every prompt you type and sends each one once to a small model (`haiku` by default) to be proofread, through the session's own connection. *Collect prompts* in `/config` switches both off. It opens its pane by itself only when *Open pane at start* is on, which it is not by default.
- **plan-progress** opens its pane by itself in a wide fullscreen terminal, unless *Open pane at start* is switched off in `/config`. Once you approve a plan, it asks Claude to report progress through its `mark_step` tool.

The other plugins (frontend-scaffold, gitbook-docs-validator and implementation-spec) act only when you ask.

## What is written to disk

| Plugin | Writes |
|---|---|
| frontend-scaffold | A new project folder at the location you choose (default: a folder named after the project in the current directory). It also runs `npm install` and `npm run build` there. |
| feature-dev-documentalist | Markdown files under `docs/features/<date>-<branch>/` in the current repository. It asks before overwriting an existing file. |
| gitbook-docs-validator | Nothing, unless you ask it to fix findings or to save a report to a file. |
| implementation-spec | A spec file, `docs/specs/<date>-<slug>.md`, in the current repository. Asking again for the same feature updates that file. |
| memors-hooks | A log of web fetches, empty searches and write-backs in the system's temporary folder (`$TMPDIR/memors-hooks/`), read by the end-of-turn reminder. The hooks write nothing to the knowledge base. The `memors` server writes to its own store (`~/.memors-mcp` by default) only when Claude records or ingests something. |
| session-cost | Per-session totals, split by day, in the plugin's store. Days older than *History days* (30 by default) are removed. Nothing is written into your project. |
| prompt-coach | The prompts you typed, each with its corrected form and your practice answers, in the plugin's store: at most 400, the oldest dropped first. `/prompt-coach clear` removes them all. Nothing is written into your project. |
| plan-progress | Nothing on disk. Its state lives in the session, and it reads the plan file without changing it. |

## What is read

frontend-scaffold, feature-dev-documentalist, gitbook-docs-validator and implementation-spec read files in the current project through Claude, in the same way Claude reads files when you ask it a question. **gitbook-docs-validator** also runs a Python script that reads the documentation folder and, when asked, the repository's README, Makefile and workflow files. **session-cost** reads the session's `/cost` total and each request's token counts and model name, never file contents. **plan-progress** reads the plan file and the task and todo lists Claude keeps. **memors-hooks** reads the knowledge base's titles, addresses and trust levels. Its `guard-cli` hook reads the text of every Bash command Claude runs, to decide whether to block it, and keeps nothing. With `MEMORS_HOOK_RECALL=1`, its `recall` hook reads each prompt of 20 characters or more and runs a local keyword search on it, keeping nothing. Its `track` hook writes the URLs Claude fetches and the search terms it uses to the session log described above. Of your project's files it reads one, `.memors-kb` (looked for in the working directory and its parents), to learn the knowledge base's name.

## Where data goes

Nothing in these plugins talks to a network service of its own. session-cost's price table is built into the plugin, so its estimates need no lookup. Files that Claude reads are sent to the model as part of the conversation, exactly as they are when you work without plugins. The plugins' own network activity is `npm install` in a scaffolded project, which fetches packages from the npm registry.

The `memors` server that memors-hooks starts is a separate program, `memors-mcp`, started for the knowledge base the project's `.memors-kb` names. It talks to Claude Code over stdio and keeps its data under `~/.memors-mcp`. It can also fetch embedding models (`memors-mcp model pull`); run `memors-mcp model ls` to see which are installed. The plugin's hooks never load a model, because they search with `--no-model`.

> **Note.** The validator's Python script needs only Python 3 and its standard library. It installs nothing.
