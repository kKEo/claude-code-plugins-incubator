# Permission rules

Fine-grained rules live in `settings.json`. Order of evaluation: **deny, then ask, then allow**.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm tsc --noEmit)", "Bash(npm run *)"],
    "ask":   ["Bash(git push *)"],
    "deny":  ["Read(./.env)"]
  }
}
```

| File | Scope |
|---|---|
| `~/.claude/settings.json` | You, everywhere |
| `.claude/settings.json` | The team (committed) |
| `.claude/settings.local.json` | You, this project |

A Bash rule matches command **text**, not the program. For a hard boundary use the OS-level sandbox: `/sandbox`.

<small>Source: [Permissions](https://code.claude.com/docs/en/permissions)</small>
