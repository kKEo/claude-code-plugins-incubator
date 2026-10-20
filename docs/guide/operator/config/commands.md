# Commands and flags

This page lists every slash command the plugins answer to and every flag of the validator script, so nothing is discoverable only from `--help`.

## Slash commands

| Command | Plugin | Arguments | Effect |
|---|---|---|---|
| `/document-phase [phase]` | feature-dev-documentalist | optional `spec`, `design`, `implementation`, `deployment`, `testing` | Detects (or forces) the phase and writes the matching file into the feature folder |
| `/frontend-scaffold:scaffold-frontend [description]` | frontend-scaffold | optional description of what the app manages | Asks for missing details, generates the project, installs and builds |
| `/gitbook-docs-validator [path]` | gitbook-docs-validator | optional docs root | Runs the checks and writes the report |

Plugin management commands, built into Claude Code:

| Command | Effect |
|---|---|
| `/plugin marketplace add kKEo/claude-code-plugins-incubator` | Register this marketplace |
| `/plugin marketplace update km-plugin-registry` | Pull the latest manifest and sources |
| `/plugin install <name>@km-plugin-registry` | Install one plugin |
| `/plugin update <name>` | Update an installed plugin to the marketplace's current version |
| `/plugin uninstall <name>` | Remove it |
| `/plugin` | List marketplaces and installed plugins |
| `/reload-plugins` | Rescan installed plugins in the current session |

## validate_docs.py

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py <docs-root> [--repo-root DIR] [--template FILE] [--json] [--quiet]
```

| Argument | Default | Meaning |
|---|---|---|
| `docs_root` | required | Directory holding `index.html` and the book folders, usually `docs/guide` |
| `--repo-root DIR` | none | Enables the repository checks: root README links every book, `docs/README.md` index, `Makefile` targets `docs`, `docs-check`, `docs-serve`, a docs workflow under `.github/workflows/`, a `scripts/docs-check*` script |
| `--template FILE` | `../assets/template.json` next to the script | Role definitions: aliases, required pages, page rules |
| `--json` | off | Emit the report as JSON (`docs_root`, `books`, `findings[]` with `severity`, `check`, `message`, `file`, `line`) |
| `--quiet` | off | Hide INFO findings in text output |

Exit status is 1 when at least one ERROR was found, 0 otherwise. Requires Python 3.8 or newer; no third-party packages.

### Per-project override

A file `<docs-root>/.docs-template.json` with the same shape as `assets/template.json` is merged role by role over the defaults. The common use is extra folder aliases:

```json
{
  "roles": {
    "user": { "aliases": ["handbook"] },
    "operator": { "aliases": ["runbook"] }
  }
}
```

### Check names

Findings are tagged with one of `landing`, `book-files`, `summary`, `page`, `link`, `image`, `readme`, `role`, `repo`. Use the tag to filter JSON output:

```bash
python3 …/validate_docs.py docs/guide --json | jq '.findings[] | select(.check == "summary")'
```
