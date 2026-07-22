# Available Plugins

This directory contains all plugins available in the Claude Plugins Marketplace.

## Currently Available

### Frontend Development
- **[frontend-scaffold](frontend-scaffold/)** - Scaffold production-grade Vue 3 frontend applications with shadcn/ui patterns, Pinia stores, and API client

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
claude plugin marketplace add kKEo/claude-code-plugins-incubator
claude plugin install PLUGIN_NAME@km-plugin-registry
```

## Contributing

Want to add your plugin? See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
