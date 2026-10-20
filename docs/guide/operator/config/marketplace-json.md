# marketplace.json

This page lists every field of `.claude-plugin/marketplace.json`, the file Claude Code reads when a marketplace is added.

## Shape

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "km-plugin-registry",
  "description": "KM Plugin Registry - A community registry of plugins",
  "owner": { "name": "Krzysztof Maziarz" },
  "plugins": [
    {
      "name": "frontend-scaffold",
      "description": "Scaffold production-grade Vue 3 frontend applications …",
      "source": "./plugins/frontend-scaffold",
      "category": "Frontend"
    }
  ]
}
```

## Top level

| Field | Required | Value here | Meaning |
|---|---|---|---|
| `$schema` | no | Anthropic's marketplace schema URL | Editor validation only |
| `name` | yes | `km-plugin-registry` | The marketplace id; users write `<plugin>@km-plugin-registry` |
| `description` | no | one line | Shown in `/plugin` listings |
| `owner.name` | yes | author name | Shown in listings |
| `plugins` | yes | array | One entry per installable plugin |

## Plugin entry

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Must equal the directory name and `plugin.json` `name` |
| `description` | yes | One line; keep it identical to the manifest's |
| `source` | yes | Path relative to the repository root, `./plugins/<name>`. Claude Code also accepts a git URL or a `{ "source": "github", "repo": "owner/name" }` object for plugins hosted elsewhere |
| `category` | no | Free text; this repository uses `Frontend` and `Development` |

## The legacy schema

`schema.json` at the repository root describes an older, flat `marketplace.json` with `id`, `repository`, `install` and `license` fields and a top-level `version` and `updated`. Nothing in the repository uses that format any more; `.github/workflows/validate.yml` still checks for it, which is why that workflow never matches a real change (see the [tester guide](../../tester/gates/ci.md)). Treat `schema.json` as historical.
