# feature-dev-documentalist

Automatically documents feature development phases by analyzing git diffs. Invoke it as each phase completes — it detects what you've built and writes a structured markdown document to a per-feature folder.

## What It Does

Generates phase documentation in `docs/features/YYYY-MM-DD-<branch-name>/`:

| Phase | File | Covers |
|---|---|---|
| Spec | `spec.md` | Problem statement, user stories, acceptance criteria, out of scope |
| Design | `design.md` | Design decisions, component design, data flow, alternatives rejected |
| Implementation | `implementation.md` | What was built, key files, patterns used, API changes, tech debt |
| Deployment | `deployment.md` | Env vars, infra changes, feature flags, migrations, rollback plan |
| Integration Testing | `testing.md` | Test strategy, how to run tests, integration setup, coverage gaps |


What already happens here: The agents share state through the feature folder on disk. Each agent's prompt tells it to read "Any existing phase docs in FEATURE_FOLDER" before writing. So:
    - impl-documenter reads spec.md and design.md
    - deploy-documenter reads spec.md and implementation.md
    - testing-documenter reads spec.md for acceptance criteria to cross-reference

This is the practical sharing mechanism: earlier phase docs become inputs to later ones. It's asynchronous (whatever's been written so far) rather than live coordination.


## Usage

Invoke the skill at any point during feature development:

```
document this phase
document the implementation
capture what I built before committing
write the feature doc
run the documentalist
```

The skill reads `git status` and `git diff` to detect which phase you're in, then dispatches the appropriate agent to generate the doc. If the phase is ambiguous, it asks you to choose.

You can also force a specific phase:

```
/document-phase design
/document-phase deployment
```

### Stop Hook

The plugin registers a Stop hook that reminds you to document after each Claude turn when:
- You're on a feature branch (not main/master/develop)
- There are uncommitted changes
- No feature docs folder exists for the branch yet

## Components

| Component | Type | Role |
|---|---|---|
| `document-phase` | Skill | Detects phase and dispatches the right agent |
| `spec-documenter` | Agent | Writes `spec.md` |
| `architect-documenter` | Agent | Writes `design.md` |
| `impl-documenter` | Agent | Writes `implementation.md` |
| `deploy-documenter` | Agent | Writes `deployment.md` |
| `testing-documenter` | Agent | Writes `testing.md` |
| `check-undocumented` | Hook (Stop) | Nudges you to document before committing |

## Model Configuration

Each agent picks its own model via the `model:` field in its frontmatter
(`agents/<name>.md`). The reasoning-heavy phases run on a stronger model; the
extraction-heavy phases run on the fast, cheap one:

| Agent | Default model | Why |
|---|---|---|
| `spec-documenter` | `sonnet` | Inferring problem/intent needs judgment |
| `architect-documenter` | `sonnet` | Design rationale + rejected alternatives need judgment |
| `impl-documenter` | `haiku` | Mostly mechanical extraction from the diff |
| `deploy-documenter` | `haiku` | Mostly mechanical extraction from config |
| `testing-documenter` | `haiku` | Mostly mechanical extraction from tests |

To change a model, edit the `model:` value in that agent's frontmatter (e.g. bump
`impl-documenter` to `sonnet` for richer summaries, or drop `spec-documenter` to `haiku`
to cut cost).

## Output Structure

```
docs/
└── features/
    └── 2026-06-18-my-feature-branch/
        ├── spec.md
        ├── design.md
        ├── implementation.md
        ├── deployment.md
        └── testing.md
```

Each file is generated independently as you complete each phase. You don't need to do all phases — generate only what's relevant.

## Phase Detection

The skill classifies the phase from changed file paths:

| File patterns | Detected phase |
|---|---|
| `*test*`, `*spec*`, `e2e/`, `*.test.*` | Integration Testing |
| `helm/`, `k8s/`, `*docker*`, `Dockerfile*`, `*.env*`, `.github/workflows/`, `Jenkinsfile`, `ci/`, `infra/` | Deployment |
| `src/`, `lib/`, `app/`, `pkg/`, `internal/` (source, no tests) | Implementation |
| Design docs, ADRs, `*.drawio`, `*.puml` | Design |
| No code / requirements files only | Spec |

If changes span multiple categories, the skill asks you which phase to document.

## Installation

Add to your Claude Code plugin registry and reload:

```
/reload-plugins
```

