# Hooks

Your code, run by the harness at fixed points. Deterministic, like git hooks.

| Cadence | Events |
|---|---|
| Per session | `SessionStart`, `SessionEnd` |
| Per turn | `UserPromptSubmit`, `Stop` |
| Per tool call | `PreToolUse`, `PostToolUse` |

```json
{ "hooks": { "PostToolUse": [ {
    "matcher": "Write|Edit",
    "hooks": [ { "type": "command",
                 "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-style.sh" } ]
} ] } }
```

- A hook can add context, block a tool call, or keep Claude working
- Exit code `2` blocks, and stderr goes back to Claude as the reason
- Configured in `settings.json`; `/hooks` shows what is active

<small>Source: [Hooks reference](https://code.claude.com/docs/en/hooks)</small>
