# Inside the plugins

This page shows how each shipped plugin is assembled, so you can change one or model a new plugin on it.

## frontend-scaffold

| Component | File | Role |
|---|---|---|
| Skill `scaffold-frontend` | `skills/scaffold-frontend/SKILL.md` | Asks eight questions (project name, primary entity, fields, status enum, API base path, views, features, target directory), then generates the project in a fixed order |
| References | `skills/scaffold-frontend/references/*.md` | Eight files of code patterns: `project-config`, `app-bootstrap`, `ui-components`, `api-client`, `stores`, `router`, `views`, `app-components` |
| Agent `frontend-validator` | `agents/frontend-validator.md` | Model `sonnet`; checks structure, pattern conformance, TypeScript, security, accessibility and runs the build |

Generation order matters: config first, then bootstrap, all UI components, API layer, stores, router, views, app components. After generation the skill runs `npm install` and `npm run build` and fixes type errors before reporting. The skill's `allowed-tools` are `Read`, `Write`, `Edit`, `Bash`, `Agent`.

## feature-dev-documentalist

| Component | File | Role |
|---|---|---|
| Skill `document-phase` | `skills/document-phase/SKILL.md` | Resolves the feature folder, classifies the phase from changed paths, checks for an existing file, dispatches one agent |
| Agents | `agents/{spec,architect,impl,deploy,testing}-documenter.md` | Model `haiku`; each writes one file: `spec.md`, `design.md`, `implementation.md`, `deployment.md`, `testing.md` |
| Hook | `hooks/hooks.json`, `hooks/check-undocumented`, `hooks/run-hook.cmd` | `Stop` event, async; nudges when on a feature branch with changes and no feature folder |

Phase classification applies these rules in order, first match wins:

| Changed path pattern | Phase | Agent |
|---|---|---|
| `*test*`, `*spec*`, `e2e/`, `*_test.*`, `*.test.*`, `*.spec.*` | Integration Testing | `testing-documenter` |
| `helm/`, `k8s/`, `*docker*`, `Dockerfile*`, `*.env*`, `config/`, `.github/workflows/`, `Jenkinsfile`, `ci/`, `infra/` | Deployment | `deploy-documenter` |
| `src/`, `lib/`, `app/`, `pkg/`, `internal/` | Implementation | `impl-documenter` |
| `docs/` outside the feature folder, `*.drawio`, `*.puml`, `*adr*`, `*design*` | Design | `architect-documenter` |
| No code, requirements files only | Spec | `spec-documenter` |

When paths span several categories the skill asks the user rather than guessing. Agents share state through the feature folder: each agent's prompt tells it to read the phase documents already there, so `impl-documenter` reads `spec.md` and `design.md`, `deploy-documenter` reads `spec.md` and `implementation.md`, and `testing-documenter` reads `spec.md` for acceptance criteria.

The feature folder is `docs/features/YYYY-MM-DD-<branch>/`; an existing folder whose name contains the branch name is reused.

## gitbook-docs-validator

| Component | File | Role |
|---|---|---|
| Skill `gitbook-docs-validator` | `skills/gitbook-docs-validator/SKILL.md` | Find the docs root, run the script, do the qualitative pass, write the report |
| Script | `skills/gitbook-docs-validator/scripts/validate_docs.py` | Deterministic checks; Python 3.8+, standard library only; exit 1 on any ERROR |
| Template | `skills/gitbook-docs-validator/references/template.md`, `assets/template.json` | The rules with their reasons, and the role/alias/required-page data the script reads |
| Evals | `skills/gitbook-docs-validator/evals/evals.json`, `evals/fixtures/` | Three cases with assertions; two fixture trees |

The script's checks are grouped by name (`landing`, `book-files`, `summary`, `page`, `link`, `image`, `readme`, `role`, `repo`); each finding carries a severity, a message and a `file:line`. The skill asks Claude to run the script first, then to read a sample of pages for what the script cannot measure, and to write a report in a fixed shape: verdict, structural failures, deviations, suggestions, not checked. See [Commands and flags](../config/commands.md) for the CLI.

## implementation-spec

| Component | File | Role |
|---|---|---|
| Skill `write-implementation-spec` | `skills/write-implementation-spec/SKILL.md` | Resolves the spec path, dispatches the explorer, asks at most four questions in one batch, writes the spec from its template, runs the reviewer at most twice, reports |
| Agent `spec-context-explorer` | `agents/spec-context-explorer.md` | Model `sonnet`; maps the stack, commands, closest precedent and reusable code; writes nothing |
| Agent `spec-readiness-reviewer` | `agents/spec-readiness-reviewer.md` | Model `sonnet`; audits the spec for placeholders, untestable requirements and invented paths; returns READY or NOT READY; writes nothing |

The output is one flat file per feature, `docs/specs/<YYYY-MM-DD>-<slug>.md`. A second run for the same slug updates that file and keeps its date and any IDs already referenced. Security decisions with no precedent in the repository become `HALT` items, the only point at which the implementing agent may stop and ask.

## memors-hooks

| Component | File | Role |
|---|---|---|
| MCP server | `.mcp.json`, `hooks/serve` | Starts the `memors` server (`memors-mcp serve`) for the knowledge base the project's `.memors-kb` marker names, which provides the knowledge-base tools |
| Hooks | `hooks/hooks.json` | `SessionStart`, `UserPromptSubmit`, `PreToolUse` (Bash), `PostToolUse` (WebFetch, WebSearch, memors tools), `Stop` |
| Hook scripts | `hooks/orient`, `recall`, `guard-cli`, `check-known-source`, `track`, `nudge-remember` | One script per job; `guard-cli` is the only one that can block |
| Shared code | `hooks/common.sh`, `hooks/lib.sh`, `hooks/run-hook.cmd` | Locating `memors-mcp` and the project's knowledge base (marker, `MEMORS_KB`, `default`); the per-session log; the Windows/Unix wrapper |
| Skill `memors-mcp` | `skills/memors-mcp/SKILL.md` | The upstream usage guide, plus a section on what the hooks already do |

Every hook fails open: if `memors-mcp` or `jq` is missing, or the knowledge base is absent or on an old schema, it exits 0. No hook writes to the knowledge base.

## plan-progress

| Component | File | Role |
|---|---|---|
| Module | `hooks/hooks.json`, `hooks/register.tsx` | A mod: registers `/plan-progress` and the `mark_step` tool, collects the plan, tasks and todos, draws the pane and the status line |
| Plan model | `hooks/progress.ts` | Parses phases and steps from the plan markdown and works out each step's state |
| State contract | `types/index.d.ts` | `plan`, `tasks`, `todos`, `view`, `marks` |
| Tests | `hooks/*.test.ts(x)` | Run with `claude plugin test plugins/plan-progress` |

## session-cost

| Component | File | Role |
|---|---|---|
| Module | `hooks/hooks.json`, `hooks/register.tsx` | A mod: records each request on `turn.step` and `session.compact`, reads the `/cost` ledger, saves history, registers `/session-cost`, draws the pane, chip and status line, runs the update check |
| Ledger | `hooks/ledger.ts` | Totals, the 1000-row cap, and splitting a `/cost` increase across overlapping requests |
| Days | `hooks/days.ts` | Local calendar-day buckets, backfill for older state, history windows |
| Version | `hooks/version.ts` | The published manifest's URL, version comparison, and when a check is a day old and runs again |
| Prices | `hooks/pricing.ts`, `hooks/format.ts` | The list-price table and the estimate; number, dollar and time formatting |
| State contract | `types/index.d.ts` | `requests`, `totals`, `ledger`, `view`, `days`, `update` |
| Tests | `hooks/*.test.ts(x)` | Run with `claude plugin test plugins/session-cost` |

The pane shows two costs per request: its share of the `/cost` total, which always adds up to `/cost`, and an estimate from the price table. Cross-session history lives in the plugin's store under `session:<id>` keys, pruned after `historyDays`. The Version view reads the installed version from the plugin's own `.claude-plugin/plugin.json` and the published one from the same file on the repository's `master` branch, through `raw.githubusercontent.com`. The result is kept in the `update` state, and the view checks again only when that is missing or more than a day old.

## The workspace directory

`plugins/gitbook-docs-validator-workspace/` has no `plugin.json` and is not listed in the marketplace. It holds eval iterations (`iteration-1/`) and fixture trees used while tuning the validator. Claude Code ignores it; so should new plugins.
