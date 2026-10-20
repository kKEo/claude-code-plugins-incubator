# plugin.json

This page lists every field of a plugin's `.claude-plugin/plugin.json`.

```json
{
  "name": "feature-dev-documentalist",
  "version": "0.1.3",
  "description": "Document feature development phases (specification, design, implementation, deployment, testing) based on current branch changeset analysis",
  "author": { "name": "Krzysztof Maziarz" },
  "keywords": ["documentation", "feature", "spec", "design", "deployment", "testing"]
}
```

| Field | Required | Default | Meaning |
|---|---|---|---|
| `name` | yes | none | Kebab-case id; equals the directory name and the marketplace entry. Used as the prefix in `/<name>:<skill>` when a skill name is ambiguous |
| `version` | yes | none | Semantic version; bump per [Releasing](../install/release.md) |
| `description` | yes | none | One line shown in `/plugin` listings |
| `author.name` | yes | none | Display name |
| `author.email`, `author.url` | no | none | Optional contact fields |
| `keywords` | no | `[]` | Search tags |
| `homepage`, `repository`, `license` | no | none | Optional metadata; the `LICENSE` file is what `CONTRIBUTING.md` requires |

Claude Code discovers `skills/`, `agents/`, `hooks/` and `commands/` by directory, so the manifest does not list components. Optional keys `skills`, `agents`, `hooks`, `commands` can point at non-default locations; none of the three plugins uses them.
