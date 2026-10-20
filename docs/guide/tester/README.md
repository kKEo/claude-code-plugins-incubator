# Tester guide

This guide is for people who check that a change to this marketplace is safe to merge: reviewers, maintainers and anyone adding a test. It assumes you can run commands in a shell, use git and read a diff. It names a command and a file on every page.

There is no unit-test suite. The plugins are Markdown instructions, one Python script and two shell scripts, so checking a change means: running the deterministic checks that exist, running each skill once by hand, and reading the diff for what no script can catch.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run every check once, and find which asset tests which part of the project |
| [II. Gates and CI](gates/README.md) | Know what blocks a merge today, what the docs gate checks, and the pull-request checklist |
| [III. Adding tests](contributing/README.md) | Add an eval case, a fixture with seeded faults, or a manual smoke step for a new plugin |
| [IV. Exploratory testing](explore/README.md) | Probe a plugin by hand for what the scripts miss |
| [Appendix](appendix/README.md) | Testing vocabulary and pointers |

## Conventions

- Commands run from the repository root unless a `cd` is shown.
- `validate_docs.py` means `plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py`.
- "Fixture" means a sample documentation tree with known faults; "eval" means a prompt plus assertions in `evals.json`.
- Exit codes are quoted where they matter; a check without an exit code is a judgement call and says so.

> **Looking for what the plugins do and what to type?** See the [user guide](../user/).
> **Looking for how plugins are built, configured and released?** See the [plugin author guide](../operator/).
