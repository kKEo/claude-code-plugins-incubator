# Continuous integration

> Draft.

This page lists every check that runs automatically on a pull request, with the command that reproduces it locally. One fact is missing: whether a failing check blocks the merge. That is decided by the branch protection rules of the repository, which are not in the code, so the last column of the table is open.

## The checks

The checks are defined in `.github/workflows/ci.yml`, workflow `ci`, job `test`. The workflow runs on every pull request and on every push to `main`. The job runs twice, on Python 3.9 and on Python 3.12, on `ubuntu-latest`.

| Check | What it catches | Reproduce locally | Blocks the merge |
|---|---|---|---|
| Install | A package that no longer installs | `pip install -e . pytest ruff` | Not known |
| Lint | Code that breaks ruff's default rules | `make lint` | Not known |
| Tests | A failing unit test | `make test` | Not known |

The steps run in this order, and a failing step stops the job: when lint fails, the tests do not run in that job.

A second workflow, `.github/workflows/docs.yml`, runs `make docs` on pull requests that change `docs/guide/`, the docs check script, the Makefile or the workflow itself. It checks the links in these books and builds them.

## Lint

`make lint` runs `python -m ruff check pingboard tests`. Two things make its result depend on the day it runs:

- CI installs ruff without a pinned version, so every run uses the newest release.
- The repository has no ruff configuration, so the rule set is whatever that release enables by default.

> **Warning.** When this page was written, `make lint` with a freshly installed ruff reported six findings in the current code (rules `BLE001`, `UP006`, `UP035` and `I001`, in `pingboard/check.py`, `pingboard/store.py`, `tests/test_cli.py` and `tests/test_config.py`) and exited with an error. Run it before you rely on a green lint step, and expect the result to differ from an older CI run.

## Tests

`make test` runs `python -m pytest -q` over `tests/`. The suite has five tests and needs no network. [What is tested where](../start/map.md) lists them.

To reproduce a failure that shows on one Python version only, create the virtual environment with that version:

```bash
python3.9 -m venv .venv39
. .venv39/bin/activate
pip install -e . pytest ruff
make test
```

## What CI does not check

- Nothing starts `pingboard serve` or sends a request, so the check loop, the HTTP routes and `pingboard check` are never exercised.
- There is no coverage measurement and no type check.

[Exploring by hand](../explore/by-hand.md) covers the first gap.
