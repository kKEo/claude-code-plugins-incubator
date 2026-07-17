---
name: document-phase
description: "Use when you want to document a feature development phase before committing. Detects the current phase (spec, design, implementation, deployment, or integration testing) from git diff analysis and generates the appropriate markdown document in docs/features/<date>-<branch-name>/. Triggers when the user says: document this phase, capture what I built, document before committing, write the feature doc, run the documentalist, document the spec, document the design, document the architecture, document the implementation, document the deployment, or document the tests."
argument-hint: "[optional: phase name to force a specific phase, e.g. 'design']"
allowed-tools: ["Bash", "Read", "Agent"]
---

Document the current feature development phase by analyzing git changes and generating a structured markdown file.

## Workflow

### Step 1: Resolve Feature Folder

Get the current branch name and locate (or create) the feature folder:

```bash
git branch --show-current
```

Compute the feature folder path:
- Search for an existing folder matching `docs/features/*<branch-name>*`
- If found, reuse that folder path
- If not found, use `docs/features/YYYY-MM-DD-<branch-name>/` where YYYY-MM-DD is today's date

### Step 2: Determine the Phase

If the user passed a phase name as an argument (e.g. "architecture"), use it directly and skip detection.

Otherwise, run:

```bash
git status --short
git diff HEAD
```

If HEAD fails (first commit with no parent), fall back to:

```bash
git diff --staged
```

Classify the phase by examining changed file paths using these rules (apply in order — first match wins):

| File path pattern | Phase |
|---|---|
| `*test*`, `*spec*`, `e2e/`, `*_test.*`, `*.test.*`, `*.spec.*` | Integration Testing |
| `helm/`, `k8s/`, `*docker*`, `Dockerfile*`, `*.env*`, `config/`, `.github/workflows/`, `Jenkinsfile`, `ci/`, `infra/` | Deployment |
| `src/`, `lib/`, `app/`, `pkg/`, `internal/` (source code, no test files) | Implementation |
| `docs/` (outside the feature folder), `*.drawio`, `*.puml`, `*adr*`, `*design*` | Design |
| No code changes, only requirements/spec files, or very few files on a fresh branch | Spec |

**If changed files span multiple categories:** Ask the user which phase they are documenting right now (show a short numbered list). Do not guess.

**If there are no changed files:** Tell the user there is nothing to document yet and exit.

### Step 3: Check for Existing Phase Doc

Map the phase to its output file using the table in Step 4. Check if
`<feature-folder>/<file>` already exists. If it does, ask the user:
> "A `<file>` already exists in `<feature-folder>/`. Overwrite it?"

Proceed only if confirmed.

### Step 4: Dispatch the Phase Agent

Create the feature folder if it does not exist yet, then dispatch the appropriate agent with this context:

```
FEATURE_FOLDER: <resolved folder path>
BRANCH_NAME: <current branch>
CHANGED_FILES: <list of changed file paths from git status/diff>
```

| Phase | Agent to dispatch | File written |
|---|---|---|
| Spec | `spec-documenter` | `spec.md` |
| Design | `architect-documenter` | `design.md` |
| Implementation | `impl-documenter` | `implementation.md` |
| Deployment | `deploy-documenter` | `deployment.md` |
| Integration Testing | `testing-documenter` | `testing.md` |

After the agent completes, confirm to the user which file was written.
