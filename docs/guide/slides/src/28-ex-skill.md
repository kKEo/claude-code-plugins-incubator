# Intermediate: your first skill

`.claude/skills/risk-summary/SKILL.md`, committed, so the whole team has it:

```markdown
---
name: risk-summary
description: Summarizes uncommitted changes and flags anything risky.
---
## Current changes
!`git diff HEAD`

Summarize the diff above in three bullets, then list anything risky:
migrations, deleted tests, changed public interfaces, secrets.
```

- The `` !`command` `` line runs first; its output is injected into the skill
- Type `/risk-summary`, or just ask "anything risky in my changes?"
- One file, no code: the cheapest way to make a team procedure repeatable

<small>Source: [Skills](https://code.claude.com/docs/en/skills)</small>
