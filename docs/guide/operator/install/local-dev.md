# Local development

This page shows how to run a plugin from your checkout so that every edit is live after a reload. It takes about two minutes to set up. Use option A for any plugin, and option B when you want to walk the same path a user takes.

## Option A: load the folder for one session

```bash
git clone https://github.com/kKEo/claude-code-plugins-incubator
cd claude-code-plugins-incubator
claude --plugin-dir plugins/session-cost
```

`--plugin-dir` loads the plugin from disk for that session only; repeat the flag for several plugins. Nothing is installed and nothing is copied.

For a mod this is the development loop. In an interactive session the folder is watched: save a file and the hooks module reloads by itself, `register` and `session.start` run again, and session state is kept. A reload that fails keeps the previous version running and names the reason in the transcript. See [State, lifecycle and reloads](../mods/state-lifecycle.md).

The first load also writes `.claude-plugin/types/` beside the mod, the API declarations your editor reads. That folder ignores itself in git.

## Option B: add the checkout as a marketplace

In Claude Code:

```
/plugin marketplace add ./claude-code-plugins-incubator
/plugin install feature-dev-documentalist@km-plugin-registry
/reload-plugins
```

This exercises the same path a user takes. Because the marketplace is a folder and each entry's `source` is a relative path, Claude Code reads the plugin from your checkout, not from a copy: edit a file, run `/reload-plugins`, and the reload names the plugin and the folder it re-read. `claude plugin list` shows the folder on a `Read from:` line.

A marketplace added from GitHub behaves differently: the plugin runs from the copy made at install time, and an edit reaches a session only as a new commit, through `/plugin update <name>` and `/reload-plugins`.

> **Warning.** A plugin loaded twice, once with `--plugin-dir` and once from a marketplace, gives Claude two skills with the same description and two copies of every hook. Keep one or the other.

> **Note.** Earlier versions of this page recommended a symlink from `~/.claude/plugins/<name>` to the checkout. That route was not re-checked against Claude Code 2.1.326; prefer the two options above.

## Editing loop for skills, agents and command hooks

1. Edit `SKILL.md`, an agent file or a hook script.
2. `/reload-plugins`. An edit to `hooks.json` itself needs a new session, because command hooks are registered at start-up.
3. Trigger the skill with a prompt from its description, or run the hook script by hand:

```bash
cd some-repo-on-a-feature-branch
CLAUDE_PLUGIN_ROOT=$PWD/../claude-code-plugins-incubator/plugins/feature-dev-documentalist \
  bash ../claude-code-plugins-incubator/plugins/feature-dev-documentalist/hooks/check-undocumented
```

The script prints the JSON it would hand to Claude Code, or nothing when the nudge conditions are not met.

## Editing loop for a mod

1. Start `claude --plugin-dir plugins/<name>`, with `--debug` while something is wrong.
2. Edit the module and save. Watch for a dim line in the transcript: it names a hook that was skipped or a module that did not load.
3. Check and test from a second shell:

```bash
claude plugin validate plugins/session-cost   # manifest, types, what it hooks and calls
claude plugin test plugins/session-cost       # its *.test.ts files against the engine
```

`validate` type-checks the module and its tests, so it catches most mistakes before a session does. [Your first mod](../mods/first-mod.md) walks through the whole loop on a twelve-line mod.

## Validating the scripts without Claude

The validator's Python script runs standalone:

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root .
```

And the hook scripts parse with `bash -n`:

```bash
bash -n plugins/feature-dev-documentalist/hooks/check-undocumented
```
