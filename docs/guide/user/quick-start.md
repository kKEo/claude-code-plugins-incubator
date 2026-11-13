# Quick start

This page takes you from nothing to a working plugin. It takes about five minutes.

## 1. Add the marketplace

Open Claude Code in any project and type:

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
```

Claude Code fetches the registry and lists it under the name `km-plugin-registry`.

## 2. Install a plugin

Pick a plugin and install it:

```
/plugin install gitbook-docs-validator@km-plugin-registry
```

Replace the name with `frontend-scaffold`, `feature-dev-documentalist`, `implementation-spec`, `plan-progress`, `session-cost` or `memors-hooks` to install one of the others. [What is in the marketplace](plugins/README.md) describes each. You can install any combination; they do not interfere with each other. memors-hooks also needs `memors-mcp` and `jq` on your machine. Its bundled `memors` server is off until you turn on *Start the memors MCP server* in `/config`; leave it off if you registered memors yourself.

## 3. Reload

New plugins are picked up after a reload:

```
/reload-plugins
```

If the command is not available in your version, start a new Claude Code session instead.

## 4. Try it

Each plugin answers to plain prompts. Type one of these:

```
does our documentation follow the three-book template?
```

```
scaffold a Vue dashboard for managing deployments
```

```
document this phase
```

```
write a spec for CSV export of invoice history
```

The two mods answer to a slash command instead: `/session-cost` opens the cost pane, and `/plan-progress` opens the plan pane.

If Claude answers by running the plugin (you will see it read files or run a script), the installation worked. If it answers in general terms without using the plugin, see [FAQ and troubleshooting](faq.md).

> **Tip.** Installing a plugin from a local clone works too. Clone the repository and point Claude Code at the folder: `/plugin marketplace add ./claude-code-plugins-incubator`. The plugin author guide covers that flow in [local development](../operator/install/local-dev.md).
