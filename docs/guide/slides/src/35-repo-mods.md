# This repo: mods

A **mod** is a plugin whose hooks module draws into Claude Code's own interface: a pane beside the chat, a status line, a toast.

| Mod | Command | Shows |
|---|---|---|
| `session-cost` | `/session-cost` | Every model request with tokens and cost |
| `plan-progress` | `/plan-progress` | The current plan and how far it has got |
| `prompt-coach` | `/prompt-coach` | A language correction for each prompt you type |
| `instances-monitor` | `/instances` | Every Claude Code instance on this machine |

![Workflow of session-cost: a model request ends, the mod records its tokens, costs it and adds it to the totals](../user/images/workflow-session-cost.svg)

The mod API is early access. The plugin author guide teaches it with five worked examples.

<small>More: [Writing mods](../operator/mods/index.html) in the plugin author guide</small>
