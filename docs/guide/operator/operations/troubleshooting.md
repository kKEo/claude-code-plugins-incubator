# Troubleshooting runbook

This page lists every failure seen so far as symptom, cause and fix. Start with the symptom closest to yours.

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
