# Marketplace overview

This page explains how a prompt in Claude Code ends up running code from this repository.

## The pieces

```
claude-code-plugins-incubator/
├── .claude-plugin/marketplace.json   # the registry: name, owner, plugin list
├── plugins/
│   ├── frontend-scaffold/            # one directory per plugin
│   ├── feature-dev-documentalist/
│   ├── gitbook-docs-validator/
│   └── gitbook-docs-validator-workspace/   # eval workspace, not a plugin
├── docs/guide/                        # this documentation
├── .github/workflows/validate.yml     # CI for the manifest
├── CONTRIBUTING.md
└── README.md
```

The marketplace manifest names the registry (`km-plugin-registry`) and lists each plugin with a `source` path relative to the repository root. Everything a plugin needs lives under its own directory. See [marketplace.json](../config/marketplace-json.md) for every field.

## How Claude Code finds a plugin

1. `/plugin marketplace add kKEo/claude-code-plugins-incubator` clones the repository into Claude Code's plugin cache and reads `.claude-plugin/marketplace.json`.
2. `/plugin install <name>@km-plugin-registry` copies the plugin's `source` directory into the installed set and records it in the user's settings.
3. On the next session or `/reload-plugins`, Claude Code scans each installed plugin for `skills/*/SKILL.md`, `agents/*.md` and `hooks/hooks.json`.
4. Skill descriptions are placed in Claude's context so it can match a prompt to a skill. Agents become available to the `Agent` tool. Hooks are registered for their events.

Nothing runs at install time. A plugin has no install script and cannot execute code until a skill is invoked or a hook event fires.

## How a skill runs

A skill is a Markdown file whose frontmatter carries the trigger description and whose body is the instruction set. When a prompt matches, Claude reads the body and follows it, using only the tools the frontmatter allows. The `document-phase` skill, for example, runs `git status --short` and `git diff HEAD`, classifies the result and dispatches an agent. Skills can be called by name: `/document-phase design`.

## How an agent runs

An agent is a Markdown file with a frontmatter (model, colour, tools) and a system prompt. Claude dispatches it with a task description; the agent works in its own context and returns a result. The documentalist's five agents each write one file; the scaffold's validator agent reads a generated project and reports.

## How a hook runs

A hook is a shell command registered for an event in `hooks/hooks.json`. Claude Code runs it with the event's JSON on stdin and reads JSON from stdout. The documentalist registers one `Stop` hook that may add a line of context to the conversation. See [Hooks](../config/hooks.md).

## Where things are on disk

| What | Where |
|---|---|
| Marketplace clone | Claude Code's plugin cache under `~/.claude/` |
| Installed plugin | A copy of the plugin directory in the same cache; `${CLAUDE_PLUGIN_ROOT}` points at it while a hook runs |
| Local development link | `~/.claude/plugins/<name>` as a symlink to your checkout (see [Local development](../install/local-dev.md)) |
