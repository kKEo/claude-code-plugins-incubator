# Upgrading

This page covers upgrades from both sides: a user taking a new version, and a maintainer shipping one that changes behaviour.

## As a user

```
/plugin marketplace update km-plugin-registry
/plugin update <name>
/reload-plugins
```

Hooks are re-read on the next session, not on reload.

## As a maintainer

Follow [Releasing a new version](../install/release.md). Before a major bump, write down in the plugin README:

- what the old and new behaviour are,
- what a user must do (rename a folder, re-run a skill),
- what happens to files written by the old version.

Files written by a plugin into a user's project are never migrated automatically. The documentalist's feature folder name (`docs/features/<date>-<branch>/`) and file names (`spec.md` … `testing.md`) are therefore a compatibility contract; changing them is a major bump.

## Claude Code upgrades

Plugins depend on three Claude Code behaviours: skill discovery under `skills/*/SKILL.md`, agent discovery under `agents/*.md`, and the hook JSON protocol. After a Claude Code release, run the [health checks](../monitoring/health.md) once. The hook's output shape is selected by environment variable so that the same script also runs under Cursor and Copilot CLI.

## Python and Node

The validator needs Python 3.8+ and nothing else. Scaffolded projects need Node 18+ and npm; the generated `package.json` pins the Vue, Vite and Tailwind versions, so an upgrade of those is a change to `references/project-config.md` and a minor bump of `frontend-scaffold`.
