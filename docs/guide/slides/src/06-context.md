# The context window

Everything Claude knows in a session sits in one finite buffer:

- your conversation, file contents it read, command output
- `CLAUDE.md`, loaded skills, system instructions

When it fills up, older content is **compacted** into a summary. Details get lost.

| Command | Use |
|---|---|
| `/context` | See what is using the space |
| `/compact focus on the API changes` | Summarize now, keeping what matters |
| `/clear` | Start fresh between unrelated tasks |

**Context is the resource you manage**, the way you manage memory in a hot loop.

<small>Source: [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)</small>
