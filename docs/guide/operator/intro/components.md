# Inside the three plugins

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

## The workspace directory

`plugins/gitbook-docs-validator-workspace/` has no `plugin.json` and is not listed in the marketplace. It holds eval iterations (`iteration-1/`) and fixture trees used while tuning the validator. Claude Code ignores it; so should new plugins.
