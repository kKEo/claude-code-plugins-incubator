# Continuous integration

> Draft.

This chapter lists every check that runs on a pull request, what it catches and the command that reproduces it locally. One fact is missing: whether a failed check blocks the merge. That is a branch-protection setting of the hosted repository and is not stored in the repository files, so a maintainer has to confirm it.

## Checks

| Workflow and job | Step | Catches | Reproduce locally | Blocks the merge |
|---|---|---|---|---|
| `ci` / `test` | `make lint` | Code that breaks ruff's rules | `make lint` | Not confirmed |
| `ci` / `test` | `make test` | A failing unit test | `make test` | Not confirmed |
| `docs` / `build` | `make docs` | Broken links in the books, reference pages that miss a setting, command, flag or metric, a book that does not build | `make docs` | Not confirmed |

## The ci workflow

`.github/workflows/ci.yml` runs on every pull request and on every push to `main`. Its one job, `test`, runs twice, on Python 3.9 and on Python 3.12, so a pull request shows two results. Each run does three things in order:

```bash
pip install -e . pytest ruff
make lint
make test
```

A step that fails stops the run, so a lint finding hides the test result of that run.

> **Note.** `pytest` and `ruff` are installed without a pinned version, and the repository has no ruff configuration. The rule set is whatever the installed ruff release enables by default, so a new release can report findings on code that did not change. When `make lint` fails on a pull request that did not touch the reported lines, compare the ruff version in the job log with the one on your machine.

To reproduce a result for one Python version, create the virtual environment with that interpreter and run the three commands above.

## The docs workflow

`.github/workflows/docs.yml` runs on a pull request only when it changes `docs/guide/`, `scripts/docs-check.sh`, the `Makefile` or the workflow itself. It installs mdBook and runs `make docs`, which is `make docs-check` followed by a build of every book. On a push to `main` it also publishes the site.

`make docs-check` runs `scripts/docs-check.sh`. It fails when a relative link in a book does not resolve, and when the code contains an environment variable, a command, a flag or a metric that the operator guide's reference pages do not list.

## What no check covers

Nothing in CI starts the dashboard, makes an HTTP request or measures coverage. [What is tested where](../start/map.md) lists the areas without tests.
