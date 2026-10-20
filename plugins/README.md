# Available Plugins

This directory contains all plugins available in the Claude Plugins Marketplace.

## Currently Available

### Frontend Development
- **[frontend-scaffold](frontend-scaffold/)** - Scaffold production-grade Vue 3 frontend applications with shadcn/ui patterns, Pinia stores, and API client

### Development
- **[feature-dev-documentalist](feature-dev-documentalist/)** - Auto-document feature development phases from git diff
- **[gitbook-docs-validator](gitbook-docs-validator/)** - Validate GitBook/mdBook docs against the three-book template (user, operator, tester guides)

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
