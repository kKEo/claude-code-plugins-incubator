# Logs and debug output

This page says where each kind of plugin activity is visible. Plugins have no log files of their own; everything surfaces through Claude Code.

## Skills and agents

A skill's actions appear in the conversation as tool calls (file reads, `Bash` runs, agent dispatches). An agent's work runs in its own context; the dispatch and the returned summary are visible, the intermediate steps are not. To see an agent's full transcript, run the same prompt in a fresh session with `claude --debug`.

## Hooks

Hook stdout is parsed by Claude Code; stderr is shown to the user only when the hook exits non-zero. The `check-undocumented` hook always exits 0, so its only visible effect is the tip line in the conversation. To see what it would print:

```bash
CLAUDE_PLUGIN_ROOT=/path/to/plugins/feature-dev-documentalist \
  bash /path/to/plugins/feature-dev-documentalist/hooks/check-undocumented; echo "exit $?"
```

An empty output with `exit 0` means one of the four nudge conditions failed; see [Hooks](../config/hooks.md).

## Mods

A mod has four ways to say something, and the engine has two ways to say something about a mod.

| Where | What appears | Who writes it |
|---|---|---|
| Transcript, one dim line | `<plugin>: <event> hook skipped: <reason>`, or a module that did not load | The engine, but only while the mod loads from a watched folder (`--plugin-dir`, or a mod Claude wrote in the session) |
| Debug log, `claude --debug` | The same line for every occurrence, every result the engine refused, and `bypassed by <plugin>` when a mod further out continued past a hook | The engine, in every session |
| Status line, toast, notification | `$.ui.status`, `$.ui.toast`, `$.ui.notify` | The mod |
| Debug log | `$.ui.log(text, { to: 'debug' })`, as instances-monitor does for a failed scan | The mod |

For an installed mod, which is not watched, the debug log is the only place a skipped hook is reported. A mod that seems to do nothing has usually been told why there.

A skipped hook's line in the debug log carries the error's name and the length of its message, not its text. The text of the first failure is on the transcript line.

What a mod spends on model calls is counted in the session's cost total, and `/usage` says how much of the total came from mods.

## Start-up

```bash
claude --debug
```

prints, among other things, each plugin directory scanned, each skill and agent registered, and each hook bound to its event. Grep for the plugin name.

## The validator script

Text output is one finding per line: severity, check tag, message, `[file:line]`. With `--json` the same findings are a JSON array; with `--quiet` INFO lines are hidden. Exit 1 means at least one ERROR.

```bash
python3 plugins/gitbook-docs/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . --quiet
```

## Scaffold builds

`npm install` and `npm run build` output appears in the conversation when the skill runs them. For a scaffolded project that misbehaves later, run `npm run build` in the project directory; the TypeScript errors there are the ground truth.
