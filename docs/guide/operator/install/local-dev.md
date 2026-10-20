# Local development

This page shows how to run a plugin from your checkout so that every edit is live after a reload. It takes about two minutes to set up.

## Option A: add the checkout as a marketplace

```bash
git clone https://github.com/kKEo/claude-code-plugins-incubator
cd claude-code-plugins-incubator
```

In Claude Code:

```
/plugin marketplace add ./claude-code-plugins-incubator
/plugin install feature-dev-documentalist@km-plugin-registry
/reload-plugins
```

This exercises the same path a user takes. Claude Code copies the plugin at install time, so after an edit run `/plugin update feature-dev-documentalist` (or uninstall and install) and then `/reload-plugins`.

## Option B: symlink the plugin directory

```bash
ln -s "$(pwd)/plugins/feature-dev-documentalist" ~/.claude/plugins/feature-dev-documentalist
```

Then `/reload-plugins`. Edits to skills and agents are picked up on the next reload; edits to `hooks.json` need a new session because hooks are registered at start-up.

> **Warning.** A symlinked plugin and a marketplace-installed copy of the same name both load. Keep one or the other, or Claude will see two skills with the same description.

## Editing loop

1. Edit `SKILL.md`, an agent file or a hook script.
2. `/reload-plugins`.
3. Trigger the skill with a prompt from its description, or run the hook script by hand:

```bash
cd some-repo-on-a-feature-branch
CLAUDE_PLUGIN_ROOT=$PWD/../claude-code-plugins-incubator/plugins/feature-dev-documentalist \
  bash ../claude-code-plugins-incubator/plugins/feature-dev-documentalist/hooks/check-undocumented
```

The script prints the JSON it would hand to Claude Code, or nothing when the nudge conditions are not met.

## Validating the scripts without Claude

The validator's Python script runs standalone:

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root .
```

And the hook scripts parse with `bash -n`:

```bash
bash -n plugins/feature-dev-documentalist/hooks/check-undocumented
```
