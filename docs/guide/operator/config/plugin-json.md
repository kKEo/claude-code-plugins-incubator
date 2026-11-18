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

Claude Code discovers `skills/`, `agents/`, `hooks/` and `commands/` by directory, so the manifest does not list components. Optional keys `skills`, `agents`, `hooks`, `commands` can point at non-default locations; none of the shipped plugins uses them.

## Fields a mod adds

| Field | Meaning | Shipped use |
|---|---|---|
| `types` | Path to the state contract, a `.d.ts` that declares every value the mod keeps in `$.state`. `claude plugin validate` holds the module to it | All four mods: `./types/index.d.ts` |
| `userConfig` | Options the user sets in `/config`. Each field has a `type` (`boolean`, `number` or `string`), a `title`, a `description` and a `default`; a `string` field may list `options`, which makes it a picker | plan-progress (2 fields), session-cost (7), prompt-coach (4), memors-hooks |
| `dependencies` | Other plugins whose additions to `$` this mod uses; their type contracts are laid beside the mod | none |
| `engines["claude-code"]` | The range of Claude Code versions the mod runs on. Outside it the plugin is off | none |

A mod reads its options as the second argument of `register(on, options)`; a change in `/config` reloads the module with the new values. A command hook reads the same options from the environment, as `CLAUDE_PLUGIN_OPTION_<KEY>`. memors-hooks has one switch per hook, one for its MCP server (off by default) and the index size limit.

## Listing metadata

session-cost ships a listing icon at `.claude-plugin/icon.png`, a square PNG of 512 to 2048 px under 2 MB; that path is found without an `icon` key. The plugin directory takes the icon only on the first submission, so it must be final before then. session-cost also sets `homepage`, `repository`, `license`, `documentationUrl`, `supportUrl` and `privacyPolicyUrl`, which the plugin directory shows on its listing.
