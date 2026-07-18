# Claude Code Plugins Marketplace

A community-curated registry of Claude Code plugins. Browse, discover, and install plugins to extend Claude's capabilities.

## What is this?

This repository maintains `.claude-plugin/marketplace.json`, the native Claude
Code marketplace manifest. Plugins may live in this repository or in a
version-pinned external GitHub repository.

## Browse Plugins

See `.claude-plugin/marketplace.json` for the complete list, or browse via:

```bash
# View all plugins
cat .claude-plugin/marketplace.json | jq '.plugins[]'

# Search by keyword
cat .claude-plugin/marketplace.json | jq '.plugins[] | select(.name | contains("frontend"))'

# List by category
cat .claude-plugin/marketplace.json | jq '.plugins[] | select(.category == "Frontend")'
```

## Install a Plugin

Add this marketplace, then install a plugin by name:

```bash
claude plugin marketplace add kKEo/claude-code-plugins-incubator
claude plugin install frontend-scaffold@km-plugin-registry
```

Then restart Claude Code.

## Submit Your Plugin

1. **Create your plugin** in its own repository with:
   - `.claude-plugin/plugin.json` (manifest)
   - `README.md` (documentation)
   - `LICENSE` file
   - Your plugin components (commands, skills, agents, hooks)

2. **Fork this repository** and add an entry to
   `.claude-plugin/marketplace.json`:

```json
{
  "name": "my-plugin",
  "description": "What it does",
  "source": {
    "source": "github",
    "repo": "username/my-plugin",
    "ref": "v1.0.0"
  },
  "category": "Development"
}
```

3. Run `claude plugin validate .`, then open a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

## Resources

- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Example Plugin](plugins/frontend-scaffold/) (reference implementation)

## License

This registry is MIT licensed. Individual plugins have their own licenses.
