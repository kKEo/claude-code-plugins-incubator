# Plugins and marketplaces

A **plugin** packages skills, agents, hooks and MCP servers under one manifest.

```text
my-plugin/
├── .claude-plugin/plugin.json    # manifest: name, description, version
├── skills/<name>/SKILL.md
├── agents/<name>.md
├── hooks/hooks.json
└── .mcp.json
```

A **marketplace** is a repository with a `.claude-plugin/marketplace.json` that lists plugins.

```text
/plugin marketplace add anthropics/claude-plugins-official
/plugin install commit-commands@claude-plugins-official
/reload-plugins
```

Plugin skills are namespaced: `/plugin-name:skill-name`.

<small>Source: [Create plugins](https://code.claude.com/docs/en/plugins/create), [Install plugins](https://code.claude.com/docs/en/plugins/install)</small>
