# Available Plugins

This directory contains all plugins available in the Claude Plugins Marketplace.

## Currently Available

### Frontend Development
- **[frontend-scaffold](frontend-scaffold/)** - Scaffold production-grade Vue 3 frontend applications with shadcn/ui patterns, Pinia stores, and API client

### Development
- **[feature-dev-documentalist](feature-dev-documentalist/)** - Auto-document feature development phases from git diff
- **[gitbook-docs-validator](gitbook-docs-validator/)** - Validate GitBook/mdBook docs against the three-book template (user, operator, tester guides)
- **[feature-dev-documentalist](feature-dev-documentalist/)** - Auto-document feature development phases from git diff — spec, architecture, implementation, deployment, and testing
- **[implementation-spec](implementation-spec/)** - Write implementation-ready feature specs — explored from the codebase, interviewed once, and audited so an orchestrator agent can build the whole thing with no further input
- **[memors-hooks](memors-hooks/)** - Hooks that run the memors-mcp knowledge-base loop for the agent — orient at session start, flag already-stored sources, nudge to record findings, and keep trust changes human-only
- **[rigorous-review](rigorous-review/)** - A strict, pre-merge code review skill that reports bugs, concurrency issues, security holes, performance traps and over-engineering, each with a minimal fix
- **[plan-progress](plan-progress/)** - A pane beside the chat showing the current plan and its progress (a mod: a hooks module drawing into the interface)
- **[session-cost](session-cost/)** - A pane beside the chat listing every model request with its tokens and cost, with session totals and history (a mod)
- **[instances-monitor](instances-monitor/)** - A pane beside the chat listing every Claude Code instance running on this machine, with status, CPU, memory and uptime (a mod)

### Productivity
- **[prompt-coach](prompt-coach/)** - Collects the prompts you type, shows a language correction for each in a pane beside the chat, and has a practice game built from your own mistakes (a mod)

## Plugin Structure

Each plugin follows this structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                # Slash commands (optional)
├── skills/                  # Skills (optional)
├── agents/                  # Agents (optional)
├── hooks/                   # Hooks (optional)
├── README.md               # Documentation
└── LICENSE                 # License file
```

## Installation

To install a plugin:

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/claude-plugins
cd claude-plugins

# Link the plugin
ln -s "$(pwd)/plugins/PLUGIN_NAME" ~/.claude/plugins/PLUGIN_NAME
```

## Contributing

Want to add your plugin? See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
