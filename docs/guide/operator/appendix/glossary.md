# Glossary

This page defines the terms this guide uses in a narrower sense than everyday English.

**Agent.** A Markdown file under `agents/` with a frontmatter and a system prompt; dispatched by Claude through the `Agent` tool and run in its own context.

**Alias.** A folder name the validator maps to a role (`internals` → operator). Defined in `assets/template.json`, extendable per project.

**`CLAUDE_PLUGIN_ROOT`.** Environment variable Claude Code sets to the installed plugin directory while running one of its hooks.

**Component.** A skill, agent, hook or command inside a plugin.

**Docs root.** The directory holding `index.html` and the three book folders; `docs/guide/` here.

**Eval.** A test case in `evals/evals.json`: a prompt, expected output and assertions, run against a skill with and without the skill loaded.

**Feature folder.** `docs/features/<date>-<branch>/`, where the documentalist writes phase documents.

**Fixture.** A sample documentation tree under `evals/fixtures/` with known, seeded faults.

**Hook.** A command bound to a Claude Code event in `hooks/hooks.json`.

**Manifest.** Either `.claude-plugin/marketplace.json` (the registry) or `plugins/<name>/.claude-plugin/plugin.json` (one plugin).

**Marketplace.** A git repository with a marketplace manifest; `km-plugin-registry` is this one.

**Phase.** One of spec, design, implementation, deployment, integration testing.

**Polyglot wrapper.** `run-hook.cmd`, a file that is a valid batch script on Windows and a valid shell script on Unix.

**Role.** One of `user`, `operator`, `tester`: the reader a documentation book is written for.

**Skill.** `skills/<name>/SKILL.md`: a trigger description plus instructions Claude follows.

**Source.** The `source` field of a marketplace entry: where the plugin's files are.

**Three-book template.** Landing page plus user, operator and tester books; the layout `gitbook-docs-validator` checks.
