# Ways to extend Claude Code

This page is the gentle start: it names the six mechanisms a plugin can use to extend Claude Code and helps you pick one before you write anything. It takes five minutes to read.

A plugin is only a folder with a manifest. What it does depends on which of these six things you put inside it, and a plugin may hold any mix of them.

![Six ways to extend Claude Code. A skill is instructions Claude reads when a prompt matches its description. An agent is a helper with its own context window. A slash command is a prompt you run by name. A command hook is a shell command the engine runs at an event. An MCP server is a separate process that gives the model new tools. A mod is TypeScript loaded into the session that hooks engine events and draws in the interface](../images/extension-points.svg)

## The six mechanisms

| Mechanism | File in the plugin | Who starts it | Where it runs | Shipped example |
|---|---|---|---|---|
| Skill | `skills/<name>/SKILL.md` | Claude, when a prompt matches the description; or you, with `/<name>` | In the conversation, with Claude's tools | `document-phase`, `rigorous-review` |
| Agent | `agents/<name>.md` | Claude, through the `Agent` tool, usually from a skill | In its own context window, with its own model and tool list | `spec-context-explorer` |
| Slash command | `commands/<name>.md` | You, by typing its name | In the conversation | `/gitbook-docs-validator:links` |
| Command hook | `hooks/hooks.json` with a `hooks` key, plus a script | The engine, at one of a fixed list of events | A new process each time | memors-hooks, feature-dev-documentalist |
| MCP server | `.mcp.json` | The model, by calling one of its tools | A separate long-lived process | memors-hooks |
| Mod | `hooks/hooks.json` with a `modules` key, plus a TypeScript module | The engine, at any of its events | Inside the session, in a sandbox | plan-progress, session-cost, prompt-coach, instances-monitor |

The first three are Markdown. They change what Claude knows and does. The last three are code. They change what the session around Claude does.

## How to choose

Ask who should start the work.

1. **Claude should do something in a fixed way when asked.** Write a skill. If part of the job is long, noisy or needs a cheaper model, move that part into an agent the skill dispatches.
2. **You want a short, explicit action with arguments.** Write a slash command, or give a skill a `name` so that `/<name>` calls it.
3. **Something should happen at an event, and a shell script can do it.** Write a command hook: add a tip at the end of a turn, block one kind of `Bash` call, inject context at session start.
4. **The model needs a tool that reaches outside the session.** Ship an MCP server.
5. **You want to change the interface, or to sit in the path of what flows through a session.** Write a mod. A pane beside the chat, a row above the prompt, a status line, a tool the model calls that updates a drawing, a guard that rewrites a command before the permission prompt sees it: these need a mod.

> **Tip.** Start with the least powerful mechanism that does the job. A skill is a text file anyone can review in a minute. A mod is code that runs inside every session of the person who installs it.

## What changes when you pick a mod

| Question | Skill, agent, command | Command hook | Mod |
|---|---|---|---|
| Language | Markdown | Any; shell here | TypeScript or JavaScript |
| Can it draw in the interface? | No | No | Yes |
| Can it change a tool's input or result? | No | Block or add context | Rewrite both |
| Does it keep state between events? | No | Only in files it writes | Yes, in the session and across sessions |
| How stable is the interface it builds on? | Stable | Stable | Early access; it moves between releases |
| How is it tested? | Evals, by hand | Run the script by hand | `claude plugin test` against the engine |

The rest of Part I describes the marketplace and the files of a plugin. [Part II](../mods/README.md) is about mods only.
