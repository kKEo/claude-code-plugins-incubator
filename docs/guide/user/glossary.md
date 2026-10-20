# Glossary

This page defines the words this guide uses, in the sense they have here.

**Agent.** A specialised helper inside a plugin that Claude hands a task to. For example, the documentalist has one agent per phase; each writes one file.

**Claude Code.** Anthropic's command-line tool for working with Claude inside a project.

**Feature folder.** The folder `docs/features/<date>-<branch>/` where the documentalist writes one file per phase.

**Hook.** A small script that Claude Code runs on its own at a fixed moment, such as the end of a turn. The documentalist uses one to show a reminder.

**Marketplace.** A list of plugins that Claude Code can install from. This repository is one marketplace, named `km-plugin-registry`.

**Phase.** One stage of building a feature: specification, design, implementation, deployment or testing.

**Plugin.** A folder of skills, agents and hooks that extends what Claude can do. You install a plugin from a marketplace.

**Reload.** Telling Claude Code to notice newly installed plugins, with `/reload-plugins` or a new session.

**Scaffold.** To generate the starting structure of a project, with all files in place and building, before any application-specific logic is written.

**Skill.** A set of instructions inside a plugin that Claude follows when your prompt matches its purpose. Skills can also be called by name with a slash, such as `/document-phase`.

**Slash command.** A prompt that starts with `/` and calls a skill or a built-in action directly, such as `/plugin install …`.

**Three-book template.** The documentation layout the validator checks for: one landing page plus a user guide, an operator or developer guide and a tester guide.
