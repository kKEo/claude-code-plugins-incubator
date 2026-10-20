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

## Start-up

```bash
claude --debug
```

prints, among other things, each plugin directory scanned, each skill and agent registered, and each hook bound to its event. Grep for the plugin name.

## The validator script

Text output is one finding per line: severity, check tag, message, `[file:line]`. With `--json` the same findings are a JSON array; with `--quiet` INFO lines are hidden. Exit 1 means at least one ERROR.

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . --quiet
```

## Scaffold builds

`npm install` and `npm run build` output appears in the conversation when the skill runs them. For a scaffolded project that misbehaves later, run `npm run build` in the project directory; the TypeScript errors there are the ground truth.
