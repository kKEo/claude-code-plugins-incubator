# Working in parallel

One agent is a tool. Several are a team, if they do not share a working tree.

```bash
claude --worktree feature-auth     # isolated session on its own git worktree
```

| Tool | What it does |
|---|---|
| `--worktree` | A parallel session that cannot clash with your checkout |
| Subagents | Fan out research; keep only the conclusions |
| `/batch <instruction>` | Split a large change into units, one worktree each |
| `/loop 5m check if the deploy finished` | Repeat a prompt on an interval |
| `/schedule` | Run an agent in the cloud on a schedule |

Start with one session. Add parallelism when waiting becomes the bottleneck.

<small>Source: [Common workflows](https://code.claude.com/docs/en/common-workflows)</small>
