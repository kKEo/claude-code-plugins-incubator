# instances-monitor

Lists every Claude Code instance running on your machine in a pane beside the chat, so you can monitor several sessions from one place. The pane refreshes every 3 seconds. The header counts the running instances, how many are busy, and their total memory. Each instance shows its name or project folder, a status dot (green busy, grey idle, yellow anything else) with how long it has held that status, its working directory, its process ID, whether it is interactive, its Claude Code version, its uptime, and its CPU and memory use. An instance that has ended drops off the list.

![Workflow of instances-monitor: Claude Code keeps a session file per instance, the mod lists them, checks which are alive and draws the pane](../images/workflow-instances-monitor.svg)

## What to type

The pane opens when a session starts. To open it again:

```
/instances
```

The pane needs a terminal at least 110 columns wide.

## How it works

![How instances-monitor works: the mod reads the session files and the process table every 3 seconds and draws the pane](../images/how-instances-monitor.svg)

The numbers match the picture.

1. **List** the session files Claude Code keeps in `~/.claude/sessions`, one per running instance.
2. **Check** which of those processes are alive, and read their CPU and memory, with a single `ps` call.
3. **Draw** the result in the pane, and repeat every 3 seconds. Like plan-progress and session-cost, this is a *mod*.

## What it reads and writes

It reads the small session files in `~/.claude/sessions` and the process table through `ps`. It reads no conversation content or project files, writes nothing to disk and makes no network request. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install instances-monitor@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
