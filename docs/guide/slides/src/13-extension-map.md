# The extension map

| You want | Use | Analogy |
|---|---|---|
| Standing project knowledge | `CLAUDE.md` | README |
| A repeatable procedure | **Skill** | runbook, `make` target |
| A specialist with its own context | **Subagent** | worker process |
| A rule that always holds | **Hook** | git hook |
| Access to an external system | **MCP server** | driver, LSP for tools |
| All of that, shareable | **Plugin** | package |

**Guidance or enforcement?** `CLAUDE.md`, prompts and skills are guidance Claude may decide to skip. Hooks, deny rules and managed settings are enforced by the harness every time.

<small>Source: [Best practices](https://code.claude.com/docs/en/best-practices)</small>
