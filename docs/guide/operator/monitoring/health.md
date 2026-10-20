# Health checks

This page is a three-minute checklist for confirming that a plugin is installed and every component registered.

## 1. The plugin is installed

```
/plugin
```

`km-plugin-registry` appears under marketplaces; the plugin appears under installed plugins with its version from `plugin.json`.

## 2. Skills registered

Type the first letters of a skill as a slash command (`/docu`) and check the completion offers it, or ask Claude "which skills do you have?" and look for the three names: `document-phase`, `scaffold-frontend`, `gitbook-docs-validator`.

## 3. Agents registered

Ask Claude "list the agent types you can launch". The documentalist contributes `feature-dev-documentalist:spec-documenter` and four siblings; the scaffold contributes `frontend-scaffold:frontend-validator`.

## 4. Hook bound

In a throwaway repository:

```bash
git init t && cd t && git commit --allow-empty -m init -q && git checkout -q -b feature/x && touch a
```

Open Claude Code there, send any prompt, and wait for the turn to end. The tip line about uncommitted changes appears. If it does not, run the script by hand as in [Logs and debug output](logs.md) and then check `claude --debug` for the `Stop` registration.

## 5. The validator script runs

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . --quiet; echo "exit $?"
```

Exit 0 on this repository's own documentation.

## What there is no check for

There is no uptime, no metrics endpoint and no scheduled job: plugins are files read at session start and code run on demand. The signals above are the whole surface.
