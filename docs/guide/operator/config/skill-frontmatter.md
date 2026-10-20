# Skill frontmatter

This page lists the YAML fields at the top of a `skills/<name>/SKILL.md`, with the values the shipped skills use.

```yaml
---
name: document-phase
description: "Use when you want to document a feature development phase before committing. … Triggers when the user says: document this phase, capture what I built, …"
argument-hint: "[optional: phase name to force a specific phase, e.g. 'design']"
allowed-tools: ["Bash", "Read", "Agent"]
---
```

| Field | Required | Meaning | Shipped values |
|---|---|---|---|
| `name` | yes | Skill id; callable as `/<name>` | `document-phase`, `scaffold-frontend`, `gitbook-docs-validator` |
| `description` | yes | The trigger. Claude sees only this before deciding; list what the skill does and the phrases that should invoke it | All three list ten or more trigger phrases |
| `argument-hint` | no | Placeholder shown after the slash command | `document-phase`: phase name; `scaffold-frontend`: app description |
| `allowed-tools` | no | Tools the skill may use while running; omit for no restriction | `document-phase`: Bash, Read, Agent; `scaffold-frontend`: Read, Write, Edit, Bash, Agent; `gitbook-docs-validator`: unrestricted |

## Body conventions used here

- Numbered `### Step N` sections so Claude can report where it is.
- Tables for decision rules (phase classification, agent dispatch).
- Paths to `references/`, `scripts/` and `assets/` are relative to the skill directory; the skill text tells Claude when to open them.
- Questions to the user are explicit ("ask the user which phase"), and the skill says when not to guess.
