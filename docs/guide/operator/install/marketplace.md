# Installing from the marketplace

This page describes the install path users take and what each step does, so you can reproduce a user's state when debugging.

## Commands

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install <name>@km-plugin-registry
/reload-plugins
```

`<name>` is one of the ten plugins listed in `.claude-plugin/marketplace.json`; [Inside the plugins](../intro/components.md) describes each. The suffix `@km-plugin-registry` is the `name` field of `.claude-plugin/marketplace.json` and disambiguates when several marketplaces offer the same plugin name.

## What happens

| Step | Effect |
|---|---|
| `marketplace add` | Clones the repository into Claude Code's cache and parses `.claude-plugin/marketplace.json`. A GitHub `owner/repo` shorthand, a full git URL or a local path are all accepted. |
| `install` | Copies the directory named by the plugin's `source` into the installed plugins area and records the plugin in the user's settings. |
| `reload-plugins` | Rescans installed plugins and registers skills, agents and hooks. A plugin that is a hooks module alone is active as soon as it is installed, with no reload. |
| `marketplace update` | Pulls the clone; installed plugins are updated with `/plugin update <name>`. |
| `uninstall` | Removes the copy and the settings entry. Files a plugin wrote into user projects (feature docs, scaffolded apps) are untouched. |

## Scope

Plugins installed this way are user-scoped: they apply in every project the user opens. A project can also list plugins in its own settings so that every contributor gets them; see the Claude Code documentation linked in [Further reading](../appendix/further-reading.md).

## Verifying

`/plugin` lists marketplaces and installed plugins. A skill that loaded appears in Claude's available-skills list; a hook that registered appears in `claude --debug` output at start-up; a mod's slash command completes at the prompt. See [Health checks](../monitoring/health.md).

## What a user is agreeing to

A skill is text Claude reads. A mod is code that runs in every session once installed: it can read files, run commands and call a model through the engine interface. `claude plugin validate plugins/<name>` prints exactly which events a mod hooks and which calls it makes, and is the quickest way to answer a user who asks what a mod does on their machine. The user guide's [trust page](../../user/trust.md) lists, per plugin, what it reads, writes and runs on its own.
