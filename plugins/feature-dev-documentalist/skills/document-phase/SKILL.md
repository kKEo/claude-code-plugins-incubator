---
name: document-phase
description: "Use when you want to document a feature development phase before committing. Detects the current phase (spec, design, implementation, deployment, or integration testing) from git diff analysis and generates the appropriate markdown document in docs/features/<date>-<branch-name>/. This skill documents work that already exists in the git diff; to write a forward-looking spec for a feature that has not been built yet, use the write-implementation-spec skill instead. Triggers when the user says: document this phase, capture what I built, document before committing, write the feature doc, run the documentalist, document the spec, document the design, document the architecture, document the implementation, document the deployment, or document the tests."
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

Otherwise, determine the **full feature changeset** — everything on this branch since it
diverged from its base, committed *and* uncommitted. Do NOT rely on `git diff HEAD`
alone; on a branch where you commit as you go it would miss all committed work.

Resolve the base branch and merge-base, then diff against it:

```bash
# Resolve the base branch (first that resolves): origin's default, then common names
base_branch=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')
for c in "$base_branch" main master develop; do
  [ -n "$c" ] && git rev-parse --verify --quiet "$c" >/dev/null 2>&1 && base_branch="$c" && break
done

# Merge-base = point where this branch diverged from the base
base=$(git merge-base "$base_branch" HEAD 2>/dev/null)

git status --short                    # includes untracked files
git diff --name-only "$base"          # committed + uncommitted changes since divergence
```

If the merge-base cannot be resolved (e.g. first commit with no parent, or the branch
*is* the base), fall back to:

```bash
git diff --name-only HEAD   # or: git diff --name-only --staged   (if HEAD has no parent)
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
`<feature-folder>/<file>` already exists.

- If it does **not** exist, the agent creates it from the template.
- If it **does** exist, the agent runs in **update mode**: it reads the current file and
  merges in new findings while **preserving human edits**, rather than overwriting it. No
  overwrite confirmation is needed — existing content is retained and refreshed in place.

If the user explicitly wants a clean regeneration from scratch, tell them to delete the
file first, then re-run.

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
