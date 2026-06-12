# Claude Code Plugins Marketplace

A community-curated registry of Claude Code plugins. Browse, discover, and install plugins to extend Claude's capabilities.

## What is this?

This repository maintains `marketplace.json` — a structured registry of Claude Code plugins. Each plugin is hosted in its own repository and can be installed by cloning to `~/.claude/plugins/`.

## Browse Plugins

See `marketplace.json` for the complete list, or browse via:

```bash
# View all plugins
cat marketplace.json | jq '.plugins[]'

# Search by keyword
cat marketplace.json | jq '.plugins[] | select(.keywords[] | contains("frontend"))'

# List by category
cat marketplace.json | jq '.plugins[] | select(.category == "Frontend")'
```

## Install a Plugin

Each plugin entry includes an `install` command. For example:

```bash
git clone https://github.com/kmaziarz/claude-plugin-frontend-scaffold ~/.claude/plugins/frontend-scaffold
```

Then restart Claude Code.

## Submit Your Plugin

1. **Create your plugin** in its own repository with:
   - `.claude-plugin/plugin.json` (manifest)
   - `README.md` (documentation)
   - `LICENSE` file
   - Your plugin components (commands, skills, agents, hooks)

2. **Fork this repository** and add an entry to `marketplace.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "What it does",
  "author": "Your Name",
  "version": "1.0.0",
  "repository": "https://github.com/username/my-plugin",
  "keywords": ["tag1", "tag2"],
  "category": "Development",
  "license": "MIT",
  "install": "git clone https://github.com/username/my-plugin ~/.claude/plugins/my-plugin"
}
```

3. **Open a pull request**

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

## Resources

- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Example Plugin](plugins/frontend-scaffold/) (reference implementation)

## License

This registry is MIT licensed. Individual plugins have their own licenses.
