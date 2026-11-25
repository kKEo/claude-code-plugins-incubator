# Commands and flags

This page lists every slash command the plugins answer to and every flag of the validator script, so nothing is discoverable only from `--help`.

## Slash commands

| Command | Plugin | Arguments | Effect |
|---|---|---|---|
| `/document-phase [phase]` | feature-dev-documentalist | optional `spec`, `design`, `implementation`, `deployment`, `testing` | Detects (or forces) the phase and writes the matching file into the feature folder |
| `/frontend-scaffold:scaffold-frontend [description]` | frontend-scaffold | optional description of what the app manages | Asks for missing details, generates the project, installs and builds |
| `/gitbook-docs-validator [path]` | gitbook-docs-validator | optional docs root | Runs the checks and writes the report |
| `/gitbook-docs-validator:structure [path] [--repo-root DIR]` | gitbook-docs-validator | optional docs root | Runs only the `landing`, `files` and `summary` validators and prints a scoped report |
| `/gitbook-docs-validator:links [path]` | gitbook-docs-validator | optional docs root | Runs only the `links` validator: broken links, missing anchors, alt text, unused images |
| `/gitbook-docs-validator:content [path]` | gitbook-docs-validator | optional docs root | Runs `pages`, `readme` and `roles`, then reviews the worklist pages for audience and drift |
| `/gitbook-docs-validator:repo [path] [--repo-root DIR]` | gitbook-docs-validator | optional docs root and repo root (defaults to the git top level) | Runs only the `repo` validator |
| `/implementation-spec:write-implementation-spec [request]` | implementation-spec | the feature request, in a sentence or two | Explores the codebase, asks at most four questions, writes `docs/specs/<date>-<slug>.md` and runs a readiness review |
| `/rigorous-review [target] [--focus <area>]` | rigorous-review | optional PR number, branch or path, defaulting to the current diff; optional focus areas | Reviews the diff and reports findings; changes no file |
| `/session-cost-installer:install-session-cost [scope]` | session-cost-installer | optional `user` (the default), `project` or `local` | Adds the marketplace when missing, then installs or updates `session-cost@km-plugin-registry` and reports the version |
| `/session-cost [on\|off\|requests\|models\|history\|stats\|reset]` | session-cost | optional switch or view; `open` and `show` mean `on`, `close` and `hide` mean `off`, `toggle` is the same as no argument, `days` means `history`; `stats` needs the `stats` option | Toggles the cost pane, opens it on a view, or clears this session's totals |
| `/prompt-coach [on\|off\|prompts\|practice\|recheck\|clear]` | prompt-coach | optional switch, tab or action; `open` and `show` mean `on`, `close` and `hide` mean `off`, `list` means `prompts`, `game` means `practice`, `toggle` is the same as no argument | Toggles the prompt pane, opens it on a tab, rechecks failed prompts, or removes the collected prompts |
| `/instances` | instances-monitor | none | Opens the pane listing the Claude Code instances running on this machine |
| `/plan-progress [on\|off\|plan\|progress\|<path>]` | plan-progress | optional switch, view or plan file; `open`, `show` and `toggle` mean `on`, `close` and `hide` mean `off`; any other argument is read as a plan path | Toggles the plan pane, switches its view, or loads a plan file |

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

## Mod development commands

These run from a shell, outside a session. `<dir>` is a plugin folder such as `plugins/session-cost`.

| Command | Effect |
|---|---|
| `claude plugin validate <dir>` | Reads the manifest and the hooks module as the engine will, type-checks them, and lists the events hooked, the `$` calls made, the state keys read and written, and every gating hook with or without a `.catch`. Then prints the plugin directory's checks (README, LICENSE, icon) |
| `claude plugin validate <dir> --profile directory` | The same, failing on problems the plugin directory would refuse a submission for |
| `claude plugin test <dir>` | Runs the plugin's `*.test.ts` and `*.test.tsx` files against the engine |
| `claude --plugin-dir <dir>` | Starts a session with the plugin loaded from that folder, for that session only; repeat the flag for several. In an interactive session the folder is watched and a saved file reloads the module |
| `claude --debug` | Writes a line for every skipped hook and every result the engine refused; see [Logs and debug output](../monitoring/logs.md) |

The environment variable `CLAUDE_CODE_PLUGIN_DIRS` names the same folders where no flag can be given, for example a session the desktop app starts: absolute paths separated by the platform's path-list separator.

## validate_docs.py

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py <docs-root> [--repo-root DIR] [--template FILE] [--only CHECKS | --skip CHECKS] [--list-checks] [--format text|md|json] [--json] [--worklist] [--quiet]
```

| Argument | Default | Meaning |
|---|---|---|
| `docs_root` | required (not with `--list-checks`) | Directory holding `index.html` and the book folders, usually `docs/guide` |
| `--repo-root DIR` | none | Enables the repository checks: root README links every book, `docs/README.md` index, `Makefile` targets `docs`, `docs-check`, `docs-serve` and `docs-site` (which must start a local web server and have the landing page in the built site), a docs workflow under `.github/workflows/`, a `scripts/docs-check*` script |
| `--template FILE` | `../assets/template.json` next to the script | Role definitions: aliases, required pages, page rules |
| `--only CHECKS` | all | Comma-separated validators to run, for example `--only links,summary`; `books` always runs. `--only repo` needs `--repo-root` |
| `--skip CHECKS` | none | Comma-separated validators to leave out; cannot be combined with `--only` |
| `--list-checks` | off | Print the validators with a one-line description and exit |
| `--format {text,md,json}` | `text` | `text` lists the findings, `md` writes a report skeleton, `json` emits the report as JSON |
| `--json` | off | Same as `--format json`: `docs_root`, `books`, `checks_run`, `findings[]` with `severity`, `check`, `message`, `file`, `line` |
| `--worklist` | off | Also list the files to read for the qualitative pass |
| `--quiet` | off | Hide INFO findings in text output |

Exit status is 1 when at least one ERROR was found, 2 on invalid arguments, 0 otherwise. Requires Python 3.8 or newer; no third-party packages.

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

### Validators

The script is a set of validators, one module each under `scripts/gbv/checks/`. They run in this order:

| Validator | Checks | Finding tags |
|---|---|---|
| `books` | Maps book folders to roles: user and operator are required, tester and developer are optional; always runs | `books` |
| `landing` | `index.html`: title, description, one link per book, links resolve | `landing` |
| `files` | Per book: `README.md`, `SUMMARY.md`, `.gitbook.yaml`, `book.toml` | `book-files` |
| `summary` | README first, orphan pages, missing or duplicate entries, Part numbering, part READMEs | `summary` |
| `pages` | One H1 on line one, no skipped heading levels, drafts, stub pages | `page`, `stub` |
| `links` | Relative links and anchors, image alt text, unused images | `link`, `image` |
| `readme` | Book READMEs: audience, reading-map table, sibling-book links | `readme` |
| `roles` | Required pages per role, timed quick start | `role` |
| `repo` | Repository integration; only with `--repo-root` | `repo` |

When only some validators ran, the Markdown title reads `Documentation check (<validators>)` and the "Not checked" section lists the ones that did not run, so a partial PASS is never mistaken for a full one.

### Check names

Findings are tagged with one of `books`, `landing`, `book-files`, `summary`, `page`, `stub`, `link`, `image`, `readme`, `role`, `repo`. Use the tag to filter JSON output:

```bash
python3 …/validate_docs.py docs/guide --json | jq '.findings[] | select(.check == "summary")'
```

## scaffold_docs.py

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-creator/scripts/scaffold_docs.py <docs-root> [--repo-root DIR] [--name NAME] [--repo-url URL] [--lede TEXT] [--books ROLES] [--folders ROLE=FOLDER,...] [--repo-files] [--template FILE] [--dry-run]
```

The script behind the `gitbook-docs-creator` skill. It writes the landing page and, for each book, the configuration files and one stub page per required page of the template. It never overwrites or edits an existing file, and it prints the edits it left to the author.

| Argument | Default | Meaning |
|---|---|---|
| `docs_root` | required | Directory for `index.html` and the book folders, usually `docs/guide` |
| `--repo-root DIR` | the git top level above the docs root, else the current directory | Repository root; `book.toml` build directories and the repository files are placed relative to it |
| `--name NAME` | the repository folder name | Project name used in titles and on the landing page |
| `--repo-url URL` | the `origin` remote | Source repository link for the landing page footer and `book.toml` |
| `--lede TEXT` | a visible TODO | The one-sentence claim on the landing page |
| `--books ROLES` | the required roles `user,operator`, plus optional books that exist | Comma-separated roles to scaffold; name `tester` and `developer` to add the optional books |
| `--folders ROLE=FOLDER,...` | an existing book folder, else the role name | Folder name per role; it has to match one of the role's aliases |
| `--repo-files` | off | Also adds `Makefile`, `.github/workflows/docs.yml`, `scripts/docs-check.sh` and the docs index, each only when the repository has none |
| `--template FILE` | the validator's `assets/template.json` | Role definitions; `<docs-root>/.docs-template.json` is merged over it |
| `--dry-run` | off | Prints what would be written and writes nothing |

Exit status is 0 on success and 2 on invalid arguments.

