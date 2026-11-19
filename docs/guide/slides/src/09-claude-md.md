# CLAUDE.md: project memory

A markdown file loaded into every session. The README you write for the agent.

| Scope | Path |
|---|---|
| You, every project | `~/.claude/CLAUDE.md` |
| The team | `./CLAUDE.md` (committed) |
| You, this project | `./CLAUDE.local.md` (gitignored) |

```markdown
# Commands
- Run one test file: pnpm vitest run path/to/file.test.ts
# Gotchas
- Never edit files under gen/, they are generated
```

- `/init` writes a starter file; keep it **under 200 lines**
- Only write what Claude cannot find by reading the repository
- It is guidance, not enforcement. For "always", use a hook

<small>Source: [Memory](https://code.claude.com/docs/en/memory)</small>
