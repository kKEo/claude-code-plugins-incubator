# Troubleshooting runbook

This page lists every failure seen so far as symptom, cause and fix. Start with the symptom closest to yours. The first sections are about skills and command hooks, the middle ones about mods, the rest about single plugins.

## Skill does not trigger

**Symptom.** A prompt that should invoke a skill gets a plain answer.

**Causes and fixes.**

1. Plugin not loaded. Run `/plugin`; if missing, install and `/reload-plugins`.
2. Prompt does not match the description. Call the skill by name (`/document-phase`) to confirm it is there, then add the missing phrase to the `description` in `SKILL.md`.
3. Two plugins expose a skill with the same name. Use the qualified form `/<plugin>:<skill>` and rename one of them.

## Hook never fires

**Symptom.** No tip line on a feature branch with changes.

**Causes and fixes.**

1. Hooks are registered at session start. Start a new session after installing.
2. One of the four conditions fails: protected branch name, clean tree, detached HEAD, or an existing `docs/features/*<branch>*` directory. Run the script by hand with `CLAUDE_PLUGIN_ROOT` set and look at the output.
3. On Windows, no bash found. Install Git for Windows; the wrapper looks in the two standard paths and then on `PATH`.
4. The command string in `hooks.json` lost its quotes around `${CLAUDE_PLUGIN_ROOT}`; a path with a space then splits. Keep the quotes.

## Hook shows an error on every turn

**Symptom.** A red hook error after each turn.

**Cause.** The script exited non-zero. `set -euo pipefail` turns any unguarded failing command into an exit. **Fix.** Guard the command with `|| true` or an explicit `exit 0`, as the shipped script does for every git call.

## A mod does not load

**Symptom.** The mod's slash command does not complete, and no pane, band or status line appears.

**Causes and fixes.**

1. The module does not compile or type-check. Run `claude plugin validate plugins/<name>`; it reports the file, the line and the reason.
2. `hooks/hooks.json` names a file that is not there, or lists more than one. It takes one path, relative to that file.
3. The module uses something the sandbox does not have: `require`, a Node built-in, dynamic `import()`. Reach the outside through `$`; see [Behaviour and limitations](../mods/limits.md).
4. A helper that is handed `$` is declared inside `register`. Move it to the top level of the module.
5. The session was started with `--safe-mode` or `--bare`, or managed settings allow managed hooks only. A person's own mods are off there by design.
6. The copy is older than your edit. A plugin installed from a git marketplace runs the copy made at install time: `/plugin update <name>`, then `/reload-plugins`.

Start a session with `claude --debug` and search the log for the plugin's name to see which of these it is.

## A mod's hook is skipped

**Symptom.** One feature of a mod stops working while the rest carries on; the debug log has `<plugin>: <event> hook skipped`.

**Causes and fixes.**

1. The hook threw. Read the reason on the line, and guard the failing call: a missing file, a command that is not installed, JSON that did not parse.
2. It returned a shape the event refuses, most often a `ui.render` tree with an element or prop the surface does not have. The line says which. Build the tree from `$.ui.resolve(e)` and check `e.surface` before using an element only one surface draws.
3. It ran out of time. A hook has ten seconds of its own code per dispatch. Move long work to a timer started in `session.start`.
4. It wrote state while drawing. `$.state.set` inside a `ui.render` hook is denied; write from an event or from a handler such as `onPress`.

## A guard mod let the call through

**Symptom.** A mod that should refuse a tool call did not.

**Causes and fixes.**

1. The guard failed and had no `.catch`, so it was skipped and the call went on. Add `.catch(($, e, next) => next.called ? next(e) : { deny: '…' })`. `claude plugin validate` lists it under `gating hook without .catch`.
2. The matcher names the wrong tool. A tool another mod or an MCP server provides is `mcp__<server>__<name>`.
3. The path or command was spelled a way the guard does not recognise: a symbolic link, `..`, a shell redirect. Resolve the path with `$.fs.stat(path, { resolve: true })` and allow-list on `realPath`.

## A pane does not open

**Symptom.** A mod's pane is missing at session start, but its command works.

**Cause.** A pane a mod opens by itself is seated only in a wide terminal, and waits below that width. A pane the user asks for with the command is seated at any width. **Fix.** Run the command, or widen the terminal. In a headless run (`claude -p`) no pane is ever placed.

## A mod shows stale or broken data after an update

**Symptom.** After a new version, a pane draws nothing, or draws old values wrongly.

**Cause.** `$.state` outlives a reload and `$.store` outlives the session, so new code read values the old code wrote. **Fix.** Change the atom's `shape` tag when a state value's fields change, and pass what `$.store.get` returns through a type guard. session-cost falls back to its Requests view when it finds a view name an older version stored.

## A mod's change to the system prompt does not arrive

**Symptom.** A `prompt.compose` or `tool.describe` hook returns new text, and the model still acts on the old.

**Cause.** What a conversation has already sent is fixed; a changed section or description waits for a new thread or a compaction. **Fix.** Start a new session to see the change. For context that changes during a conversation, attach it on `prompt.submit` instead; see [Behaviour and limitations](../mods/limits.md).

## Phase detection asks every time

**Symptom.** `document-phase` always asks which phase.

**Cause.** The branch mixes categories (for example tests and source in one change set). **Fix.** Pass the phase: `/document-phase implementation`. To change the rules, edit the classification table in `skills/document-phase/SKILL.md`; the first matching row wins.

## Documentalist writes into a new folder each time

**Symptom.** Several `docs/features/<date>-<branch>/` folders for one branch.

**Cause.** The lookup is `docs/features/*<branch>*`; a branch renamed mid-way, or a slash in the branch name that became a subdirectory. **Fix.** Merge the folders by hand and keep the one whose name contains the current branch name.

## Validator reports a missing role

**Symptom.** "no book for role operator" although the folder exists.

**Cause.** Folder name not in the alias list (`user`/`getting-started`/`guide`/…, `operator`/`internals`/`deploy`/`developer`/…, `tester`/`qa`/`testing`/…). **Fix.** Rename the folder or add `<docs-root>/.docs-template.json` with extra aliases; see [Commands and flags](../config/commands.md).

## Validator false positives

Known cases, from `references/template.md` §9:

- `# comment` lines inside fenced code blocks are not H1s; the script strips fences, so if you see this, the fence is unbalanced.
- Generated pages may repeat `##` headings.
- Anchors like `#gap-15` may point at generated HTML ids; verify against the heading slug before fixing.

## Scaffold build fails

**Symptom.** `npm run build` errors after generation.

**Causes and fixes.** Node older than 18 (upgrade); offline `npm install` (retry with network); a type mismatch between the entity fields you gave and the generated `src/api/types.ts` (fix the type and rebuild, then run the `frontend-validator` agent).

## CI did not run on my marketplace change

**Cause.** `.github/workflows/validate.yml` triggers on `marketplace.json` at the repository root and checks fields the current manifest does not have. See the [tester guide](../../tester/gates/ci.md) for the state of that gate.
