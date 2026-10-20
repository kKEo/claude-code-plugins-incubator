# implementation-spec

Writes a spec *before* any code exists — complete enough to hand straight to an orchestrator agent. The test of a good spec here is that the implementing agent asks the user nothing further (except, when it applies, one flagged security decision).

## What It Does

Generates `docs/specs/<YYYY-MM-DD>-<slug>.md` with nine sections:

| Section | Answers | Why an orchestrator needs it |
|---|---|---|
| Summary | Goal, problem, non-goals, implementation stance | Sanity-checks scope; bans invented abstractions up front |
| Decisions | Every multi-option question, already answered | Stops the agent re-litigating a choice mid-build |
| Requirements | Numbered, individually testable behaviors | The only thing steps and tests can reference by ID |
| Existing Code To Reuse | Real, verified paths and utilities | Prevents rewriting something that already exists |
| Contracts | Exact data shapes, endpoints, error codes, config | Removes prose hand-waving from the interface |
| Implementation Steps | Ordered, per-step files + "done when" | The actual build list |
| Tests | Happy paths and error handling, cross-referenced to requirements | The objective completion signal |
| Security | Decided items, plus the one sanctioned halt channel | The only place the agent is allowed to stop and ask |
| Definition of Done | Self-checkable completion checklist | Lets the agent verify its own work |

Output guarantees: no placeholders (`TBD`, `TODO`, "consider", open alternatives) survive review; every requirement is implemented by a step and covered by a test; every file path cited is verified to exist (or explicitly marked new).

## Usage

Invoke the skill with a feature request:

```
write a spec for a new feature
spec this out before we write any code
prepare an implementation spec for CSV export of invoice history
plan this feature so an agent can build it
```

Or explicitly:

```
/implementation-spec:write-implementation-spec let users export their invoice history as CSV
```

The skill explores the codebase, asks at most 4 questions it genuinely can't answer on its own, writes the spec, and runs a readiness review before handing it back. Once it reports back, hand the result to an orchestrator agent with:

```
Implement docs/specs/<file> exactly as written.
```

## Not To Be Confused With

| | This plugin | `feature-dev-documentalist` (`document-phase`) |
|---|---|---|
| Direction | Forward — before any code exists | Backward — reconstructed from a git diff after code exists |
| Input | A feature request | Changed files on the current branch |
| Output | `docs/specs/<date>-<slug>.md` | `docs/features/<date>-<branch>/spec.md` |
| Unresolved items | Not allowed (except a flagged `HALT`) | `[to be confirmed]` placeholders are expected |

## Components

| Component | Type | Role |
|---|---|---|
| `write-implementation-spec` | Skill | Explores, interviews, writes the spec, dispatches the review |
| `spec-context-explorer` | Agent | Maps real files and utilities in the repo; writes nothing |
| `spec-readiness-reviewer` | Agent | Audits the spec for anything an orchestrator would have to guess; writes nothing |

## Model Configuration

| Agent | Default model | Why |
|---|---|---|
| `spec-context-explorer` | `sonnet` | A fabricated file path poisons the spec, and then the implementation |
| `spec-readiness-reviewer` | `sonnet` | Adversarial reading of a document against a live codebase is judgment work, not extraction |

To change a model, edit the `model:` value in that agent's frontmatter (`agents/<name>.md`).

## Output Structure

```
docs/
└── specs/
    ├── 2026-09-07-invoice-csv-export.md
    └── 2026-09-12-public-api-rate-limiting.md
```

One flat, dated file per spec. Re-running the skill for the same feature updates that file in place rather than creating a second one.

## Installation

Add to your Claude Code plugin registry and reload:

```
/reload-plugins
```
