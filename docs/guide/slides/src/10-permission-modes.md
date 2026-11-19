# Permission modes

How much Claude may do without asking. Cycle with `Shift+Tab`.

| Mode | Behaviour |
|---|---|
| **Manual** | Only reads run without asking |
| **Accept edits** | File edits and simple filesystem commands run freely |
| **Plan** | Explore and propose; no edits until you approve |
| **Auto** | A classifier model reviews actions and blocks risky ones |
| **Don't ask** | Anything that would prompt is denied; for CI |
| **Bypass** | No prompts at all; isolated containers and VMs only |

```bash
claude --permission-mode plan
```

<small>Source: [Permission modes](https://code.claude.com/docs/en/permission-modes)</small>
