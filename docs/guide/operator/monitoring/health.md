# Health checks

This page is a five-minute checklist for confirming that a plugin is installed and every component registered.

## 1. The plugin is installed

```
/plugin
```

`km-plugin-registry` appears under marketplaces; the plugin appears under installed plugins with its version from `plugin.json`.

## 2. Skills registered

Type the first letters of a skill as a slash command (`/docu`) and check the completion offers it, or ask Claude "which skills do you have?" and look for the skill's name. The nine shipped skills are `document-phase`, `scaffold-frontend`, `gitbook-docs-validator`, `gitbook-docs-creator`, `write-implementation-spec`, `rigorous-review`, `memors-mcp`, `memors-learn-repo` and `install-session-cost`.

## 3. Agents registered

Ask Claude "list the agent types you can launch". The documentalist contributes `feature-dev-documentalist:spec-documenter` and four siblings; the scaffold contributes `frontend-scaffold:frontend-validator`; implementation-spec contributes `implementation-spec:spec-context-explorer` and `implementation-spec:spec-readiness-reviewer`; memors-hooks contributes `memors-hooks:repo-learner`.

## 4. Hook bound

In a throwaway repository:

```bash
git init t && cd t && git commit --allow-empty -m init -q && git checkout -q -b feature/x && touch a
```

Open Claude Code there, send any prompt, and wait for the turn to end. The tip line about uncommitted changes appears. If it does not, run the script by hand as in [Logs and debug output](logs.md) and then check `claude --debug` for the `Stop` registration.

## 5. The validator script runs

```bash
python3 plugins/gitbook-docs/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . --quiet; echo "exit $?"
```

Exit 0 on this repository's own documentation.

## 6. A mod loaded

```bash
claude plugin validate plugins/session-cost
```

Its `hooks:` line lists the events the module will hook, and the command's last line reads `Validation passed`, with or without warnings. Then, in a session:

| Check | Expected |
|---|---|
| Type the first letters of the mod's command (`/sess`, `/plan`, `/prom`, `/inst`) | The completion offers it. The command is registered in `session.start`, so this proves the module loaded and that hook ran |
| Run the command | The pane opens, or the command answers with a line of text |
| `claude --debug`, then search the log for the mod's name | No `hook skipped` and no `did not load` line |
| `claude plugin test plugins/<name>` | Every test passes. instances-monitor has none |

A mod whose command is missing did not load. [Troubleshooting](../operations/troubleshooting.md#a-mod-does-not-load) has the causes.

## What there is no check for

There is no uptime, no metrics endpoint and no scheduled job: plugins are files read at session start and code run on demand. The signals above are the whole surface.
