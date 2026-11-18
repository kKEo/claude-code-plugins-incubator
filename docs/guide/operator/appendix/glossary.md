# Glossary

This page defines the terms this guide uses in a narrower sense than everyday English.

**Agent.** A Markdown file under `agents/` with a frontmatter and a system prompt; dispatched by Claude through the `Agent` tool and run in its own context.

**Alias.** A folder name the validator maps to a role (`internals` → operator). Defined in `assets/template.json`, extendable per project.

**Atom.** A named reference to one value in a mod's session state, made with `atom(ref, initial)` and used with `read` and `update`.

**Band.** The area above the prompt where each mod may draw one row, through a `ui.render` hook for `AbovePrompt`.

**Budget.** The time one hook may spend on its own code in one dispatch: ten seconds. Time inside `next(e)` or a `$` call does not count.

**Chain.** All the hooks of one event, from every loaded mod, lined up from the outermost tier to the engine's own behaviour.

**`CLAUDE_PLUGIN_ROOT`.** Environment variable Claude Code sets to the installed plugin directory while running one of its hooks.

**Command hook.** A shell command bound to a Claude Code event in `hooks/hooks.json` under a `hooks` key. Run as a new process each time.

**Component.** A skill, agent, hook, command, MCP server or hooks module inside a plugin.

**Core.** The innermost link of every chain: the engine's own behaviour, such as the permission prompt and the tool itself.

**Dispatch.** One raising of one event, travelling down the chain and back.

**Docs root.** The directory holding `index.html` and the three book folders; `docs/guide/` here.

**Engine.** Claude Code's core as a mod sees it: the thing that raises events and answers calls on `$`.

**Engine interface.** `$`, the first parameter of every hook. Every effect a mod has outside itself goes through it.

**Eval.** A test case in `evals/evals.json`: a prompt, expected output and assertions, run against a skill with and without the skill loaded.

**Feature folder.** `docs/features/<date>-<branch>/`, where the documentalist writes phase documents.

**Fixture.** A sample documentation tree under `evals/fixtures/` with known, seeded faults.

**Function hook.** A function `($, e, next)` a mod adds to an engine event with `on`. The official name for what a mod is made of.

**Hook.** Either a command hook or a function hook. Both are declared in `hooks/hooks.json`.

**Hooks module.** The TypeScript or JavaScript file a mod's `hooks/hooks.json` names under `modules`. It exports `register(on, options)`.

**Manifest.** Either `.claude-plugin/marketplace.json` (the registry) or `plugins/<name>/.claude-plugin/plugin.json` (one plugin).

**Marketplace.** A git repository with a marketplace manifest; `km-plugin-registry` is this one.

**Matcher.** The optional second argument of `on`: an object the event's input must match for the hook to run, such as `{ tool: 'Bash' }`.

**Mod.** A plugin built on function hooks: a hooks module the engine loads into the session. plan-progress, session-cost, prompt-coach and instances-monitor are mods.

**Pane.** A framed region beside or above the chat that one mod opens with `$.ui.open` and draws with a `ui.render` hook.

**Phase.** One of spec, design, implementation, deployment, integration testing.

**Polyglot wrapper.** `run-hook.cmd`, a file that is a valid batch script on Windows and a valid shell script on Unix.

**Role.** One of `user`, `operator`, `tester`: the reader a documentation book is written for.

**Skill.** `skills/<name>/SKILL.md`: a trigger description plus instructions Claude follows.

**Source.** The `source` field of a marketplace entry: where the plugin's files are.

**State contract.** `types/index.d.ts` in a mod: the declaration of every value it keeps in `$.state`, named in the manifest under `types`.

**Store.** `$.store`: JSON values a mod keeps across sessions, 4 MiB in all.

**Surface.** What draws the interface: `terminal`, `desktop`, `vscode` or `mobile`. Each has its own table of elements.

**Three-book template.** Landing page plus user, operator and tester books; the layout `gitbook-docs-validator` checks.

**Tier.** A mod's place in the chain: `prepend`, `user`, `append`, `builtin`, then `core`. Installed mods are in `user`.
