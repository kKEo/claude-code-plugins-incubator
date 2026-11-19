# Subagents

A second Claude with its **own context window**, system prompt and tools. Only its summary returns.

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

- Lives in `.claude/agents/` (project) or `~/.claude/agents/` (you)
- Built in: **Explore** (read-only search), **Plan**, **general-purpose**
- Use it to keep a noisy search out of your main context, or to restrict tools
- Each one makes its own model requests: it costs tokens

<small>Source: [Subagents](https://code.claude.com/docs/en/sub-agents)</small>
