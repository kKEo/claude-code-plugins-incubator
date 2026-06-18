# feature-dev-documentalist

Automatically documents feature development phases by analyzing git diffs. Invoke it as each phase completes — it detects what you've built and writes a structured markdown document to a per-feature folder.

## What It Does

Generates phase documentation in `docs/features/YYYY-MM-DD-<branch>/`:

| Phase | File | Covers |
|---|---|---|
| Spec | `spec.md` | Problem statement, user stories, acceptance criteria, out of scope |
| Architecture | `architecture.md` | Design decisions, component design, data flow, alternatives rejected |
| Implementation | `implementation.md` | What was built, key files, patterns used, API changes, tech debt |
| Deployment | `deployment.md` | Env vars, infra changes, feature flags, migrations, rollback plan |
| Integration Testing | `testing.md` | Test strategy, how to run tests, integration setup, coverage gaps |

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
/document-phase architecture
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
| `architect-documenter` | Agent | Writes `architecture.md` |
| `impl-documenter` | Agent | Writes `implementation.md` |
| `deploy-documenter` | Agent | Writes `deployment.md` |
| `testing-documenter` | Agent | Writes `testing.md` |
| `check-undocumented` | Hook (Stop) | Nudges you to document before committing |

## Output Structure

```
docs/
└── features/
    └── 2026-06-18-my-feature-branch/
        ├── spec.md
        ├── architecture.md
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
| `helm/`, `k8s/`, `*docker*`, `Dockerfile*`, `*.env*`, `ci/`, `infra/` | Deployment |
| `src/`, `lib/`, `app/`, `pkg/`, `internal/` (source, no tests) | Implementation |
| Design docs, ADRs, `*.drawio`, `*.puml` | Architecture |
| No code / requirements files only | Spec |

If changes span multiple categories, the skill asks you which phase to document.

## Installation

Add to your Claude Code plugin registry and reload:

```
/reload-plugins
```

## License

MIT
