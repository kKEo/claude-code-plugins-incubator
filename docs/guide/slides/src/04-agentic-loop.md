# The agentic loop

```text
        ┌──────────────────┐
        │  gather context  │  read files, search, inspect git
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │   take action    │  edit files, run commands
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │  verify results  │  run tests, read errors ─► loop again
        └──────────────────┘
```

- The phases blend; one prompt may take dozens of tool calls
- You can interrupt at any point: `Esc` stops it, a typed correction is queued
- Think of it as a junior-to-senior colleague with a shell, not a function call

<small>Source: [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)</small>
