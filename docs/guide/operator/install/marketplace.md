# Installing from the marketplace

This page describes the install path users take and what each step does, so you can reproduce a user's state when debugging.

## Commands

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install <name>@km-plugin-registry
/reload-plugins
```

`<name>` is one of `frontend-scaffold`, `feature-dev-documentalist`, `gitbook-docs-validator`. The suffix `@km-plugin-registry` is the `name` field of `.claude-plugin/marketplace.json` and disambiguates when several marketplaces offer the same plugin name.

## What happens

| Step | Effect |
|---|---|
| `marketplace add` | Clones the repository into Claude Code's cache and parses `.claude-plugin/marketplace.json`. A GitHub `owner/repo` shorthand, a full git URL or a local path are all accepted. |
| `install` | Copies the directory named by the plugin's `source` into the installed plugins area and records the plugin in the user's settings. |
| `reload-plugins` | Rescans installed plugins and registers skills, agents and hooks. |
| `marketplace update` | Pulls the clone; installed plugins are updated with `/plugin update <name>`. |
| `uninstall` | Removes the copy and the settings entry. Files a plugin wrote into user projects (feature docs, scaffolded apps) are untouched. |

## Scope

Plugins installed this way are user-scoped: they apply in every project the user opens. A project can also list plugins in its own settings so that every contributor gets them; see the Claude Code documentation linked in [Further reading](../appendix/further-reading.md).

## Verifying

`/plugin` lists marketplaces and installed plugins. A skill that loaded appears in Claude's available-skills list; a hook that registered appears in `claude --debug` output at start-up. See [Health checks](../monitoring/health.md).
