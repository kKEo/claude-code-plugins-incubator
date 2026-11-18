# Upgrading

This page covers upgrades from both sides: a user taking a new version, and a maintainer shipping one that changes behaviour.

## As a user

```
/plugin marketplace update km-plugin-registry
/plugin update <name>
/reload-plugins
```

Command hooks are re-read on the next session, not on reload. A mod's module is replaced by `/reload-plugins`: its `register` and `session.start` run again, its session state is kept, and its timers start afresh.

## As a maintainer

Follow [Releasing a new version](../install/release.md). Before a major bump, write down in the plugin README:

- what the old and new behaviour are,
- what a user must do (rename a folder, re-run a skill),
- what happens to files written by the old version.

Files written by a plugin into a user's project are never migrated automatically. The documentalist's feature folder name (`docs/features/<date>-<branch>/`) and file names (`spec.md` … `testing.md`) are therefore a compatibility contract; changing them is a major bump.

## Claude Code upgrades

Skill, agent and command-hook plugins depend on three stable Claude Code behaviours: skill discovery under `skills/*/SKILL.md`, agent discovery under `agents/*.md`, and the hook JSON protocol. After a Claude Code release, run the [health checks](../monitoring/health.md) once. The hook's output shape is selected by environment variable so that the same script also runs under Cursor and Copilot CLI.

The four mods depend on the function-hooks API, which is early access and may change in any release. After a Claude Code update:

```bash
for m in plan-progress session-cost prompt-coach instances-monitor; do
  claude plugin validate plugins/$m && claude plugin test plugins/$m
done
```

`validate` type-checks each module against the new build's declarations, so a renamed event or a changed result shape shows up as a type error with a line number. A hook that the new build refuses at run time is skipped by itself and the rest of the mod keeps working; the debug log names it.

## Stored data of a mod

Values a mod kept in `$.store` survive an upgrade of the mod. Treat their shape as a compatibility contract in the same way as file names: session-cost's `session:<id>` keys and prompt-coach's entries are read by every later version. A version that changes a shape reads the old one and converts it, or ignores it; it never assumes the store is empty.

## Python and Node

The validator needs Python 3.8+ and nothing else. Scaffolded projects need Node 18+ and npm; the generated `package.json` pins the Vue, Vite and Tailwind versions, so an upgrade of those is a change to `references/project-config.md` and a minor bump of `frontend-scaffold`.
