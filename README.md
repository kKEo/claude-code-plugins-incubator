# Claude Code Plugins Marketplace

A small registry of Claude Code plugins (`km-plugin-registry`). Add the marketplace once, then install any plugin with a slash command.

## What is this?

This repository is a Claude Code plugin marketplace. The manifest `.claude-plugin/marketplace.json` lists the plugins; each plugin lives under `plugins/<name>/` with its own manifest, skills, agents and hooks.

## Documentation

The full documentation is under `docs/guide/` as one landing page and three books:

- [User guide](docs/guide/user/README.md): install a plugin and use it; quick start, everyday prompts, FAQ.
- [Plugin author guide](docs/guide/operator/README.md): how plugins are wired, local development, publishing, releases, configuration reference, troubleshooting.
- [Tester guide](docs/guide/tester/README.md): how a change is checked before merge; running the checks, gates, adding tests, exploratory sessions.

The landing page is `docs/guide/index.html`; `docs/README.md` indexes everything. `make docs-check` validates the docs; `make docs` also builds them with mdBook.

## Install a plugin

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install gitbook-docs-validator@km-plugin-registry
/reload-plugins
```

Replace the plugin name with `frontend-scaffold` or `feature-dev-documentalist` as needed.

## Browse Plugins

See [plugins/README.md](plugins/README.md) for the list by category, or:

```bash
jq '.plugins[] | {name, category, description}' .claude-plugin/marketplace.json
```

## Submit Your Plugin

1. **Create your plugin** under `plugins/<name>/` with:
   - `.claude-plugin/plugin.json` (manifest)
   - `README.md` (documentation)
   - `LICENSE` file
   - Your plugin components (skills, agents, hooks)

2. **Add an entry** to `.claude-plugin/marketplace.json`:

```json
{
  "name": "my-plugin",
  "description": "What it does",
  "source": "./plugins/my-plugin",
  "category": "Development"
}
```

3. **Open a pull request** and walk the [pull-request checklist](docs/guide/tester/gates/pr-checklist.md).

The step-by-step version is [Publishing a plugin](docs/guide/operator/install/publish.md); [CONTRIBUTING.md](CONTRIBUTING.md) has the general rules.

## Resources

- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Example Plugin](plugins/frontend-scaffold/) (reference implementation)

## License

This registry is MIT licensed. Individual plugins have their own licenses.
