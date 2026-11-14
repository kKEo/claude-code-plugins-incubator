# instances-monitor

A Claude Code mod that shows every Claude Code instance running on this machine in a pane beside the chat, so you can monitor several sessions from one place. The pane opens when a session starts and refreshes every 3 seconds.

## What it shows

- **Header**: how many instances are running, how many are busy, and their total memory.
- **One entry per instance**: its name (or the project folder), a status dot (green busy, grey idle, yellow anything else), the status and how long it has held it, the working directory, the PID, the kind (interactive or not), the Claude Code version, the uptime, the CPU share and the memory.
- Instances whose process has ended are dropped from the list.

## Use

```
/plugin install instances-monitor@km-plugin-registry
/instances
```

`/instances` opens the pane again if you closed it. The pane needs a terminal at least 110 columns wide.

## How it works

Every 3 seconds the mod lists `~/.claude/sessions/*.json`, the files Claude Code keeps for each running session, and parses them. It then runs one `ps -o pid=,pcpu=,rss= -p <pids>` to find which processes are alive and read their CPU and memory. Nothing is sent over the network, and no file other than those session files is read.

## Files

- `hooks/register.tsx` — the module: polling, the `/instances` command and the pane.
- `types/index.d.ts` — the contract for the mod's session state.

Check it with `claude plugin validate plugins/instances-monitor`.
