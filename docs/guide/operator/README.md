# Plugin author guide

This guide is for people who author, maintain or publish plugins in the `km-plugin-registry` marketplace. It assumes you can use git, run commands in a shell, and have used Claude Code as a user. It explains how the marketplace and its three plugins are wired, how to develop and release one, and every field of every manifest.

The marketplace is one git repository. The manifest `.claude-plugin/marketplace.json` lists plugins by a relative `source` path; each plugin is a directory under `plugins/` with its own manifest, skills, agents and hooks. There is no build step, no package registry and no server: Claude Code reads the files straight from the clone.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand how Claude Code discovers a marketplace, loads a plugin and runs its skills, agents and hooks |
| [II. Install and deploy](install/README.md) | Develop a plugin locally, install from the marketplace, publish a new plugin, cut a release |
| [III. Configuration reference](config/README.md) | Look up a field of `marketplace.json`, `plugin.json`, a skill or agent frontmatter, `hooks.json`, or a command flag |
| [IV. Monitoring and logs](monitoring/README.md) | See what a plugin is doing, read hook output, confirm a plugin loaded |
| [V. Operations](operations/README.md) | Upgrade, troubleshoot a plugin that does not fire, retire a plugin |
| [Appendix](appendix/README.md) | Glossary and further reading |

## Conventions

- Paths are relative to the repository root unless they start with `~` or `/`.
- Slash commands are shown as typed in Claude Code: `/plugin install <name>@km-plugin-registry`.
- `${CLAUDE_PLUGIN_ROOT}` is the environment variable Claude Code sets to the installed plugin's directory; hook commands use it to find their scripts.
- Defaults quoted here are the values in the repository at the time of writing. The manifests themselves are the source of truth; when in doubt, read the file.

## Deeper references

- [CONTRIBUTING.md](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/CONTRIBUTING.md): submission rules in brief.
- [The three-book documentation template](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/gitbook-docs-validator/skills/gitbook-docs-validator/references/template.md): the rules this documentation follows.
- [Plugin slides](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/feature-dev-documentalist/slides.md): a presentation of the documentalist plugin with a critique.

> **Looking for the non-technical introduction?** See the [user guide](../user/).
> **Looking for how a change is checked before merge?** See the [tester guide](../tester/).
