# Agent frontmatter

This page lists the YAML fields at the top of an `agents/<name>.md`, with the values the shipped agents use.

```yaml
---
name: spec-documenter
description: |
  Documents the spec phase … Dispatched by the document-phase skill when the spec phase is detected.

  <example>
  Context: User is at the start of a feature, capturing requirements
  user: "document the spec phase"
  assistant: "I'll use the spec-documenter to generate the spec document."
  </example>
model: haiku
color: blue
tools:
  - Read
  - Bash
  - Write
  - Grep
  - Glob
---
```

| Field | Required | Meaning | Shipped values |
|---|---|---|---|
| `name` | yes | Agent id used by the `Agent` tool | `spec-documenter`, `architect-documenter`, `impl-documenter`, `deploy-documenter`, `testing-documenter`, `frontend-validator` |
| `description` | yes | When to dispatch; `<example>` blocks with `Context`, `user`, `assistant` lines teach the match | two examples each |
| `model` | no | `haiku`, `sonnet`, `opus` or inherit | documentalist agents: `haiku`; `frontend-validator`: `sonnet` |
| `color` | no | Colour of the agent's label in the terminal | blue, magenta, green, yellow, cyan |
| `tools` | no | Tools the agent may call; omit for all | documentalists: Read, Bash, Write, Grep, Glob; `frontend-validator`: Read, Bash, Grep, Glob (no Write: it reports, it does not fix) |

## Inputs

The documentalist agents expect three values in the dispatch prompt: `FEATURE_FOLDER`, `BRANCH_NAME`, `CHANGED_FILES`. The `document-phase` skill supplies them. `frontend-validator` expects a project path.

## Model choice

The documentalists were moved to `haiku` to keep a per-phase document cheap; they read a diff and fill a fixed outline. The validator agent stays on `sonnet` because it judges code quality across a whole project and runs a build.
