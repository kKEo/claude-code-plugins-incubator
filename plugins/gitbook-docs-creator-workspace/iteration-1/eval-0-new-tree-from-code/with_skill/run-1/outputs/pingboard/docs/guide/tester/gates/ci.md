# Continuous integration

> Draft.

This page lists every check that runs on a pull request, what it catches and how to repeat it locally. Two facts are still missing, because they are not recorded in the repository: whether a branch rule makes these checks required before a merge, and whether the lint check currently passes on CI (see [Lint](#lint)).

## The checks

| Check | Workflow and job | What it catches | Run it locally | Blocks the merge |
|---|---|---|---|---|
| Lint | `ci` / `test` | Mistakes that ruff finds by reading the code in `pingboard` and `tests`. | `make lint` | Not recorded in the repository |
| Unit tests | `ci` / `test` | A change that breaks the behaviour the tests in `tests/` describe. | `make test` | Not recorded in the repository |
| Documentation | `docs` / `build` | Broken links in the books, a reference page that misses a name from the code, a book that does not build. | `make docs` | Not recorded in the repository |

A failing step turns the check on the pull request red. Whether a red check stops the merge depends on the branch rules of the repository, which are set on GitHub and not in a file.

## The ci workflow

Defined in `.github/workflows/ci.yml`.

- It runs on every pull request, and on every push to `main`.
- The job `test` runs twice, once on Python 3.9 and once on Python 3.12, on `ubuntu-latest`. A pull request therefore shows two results.
- Each run does three things in order: `pip install -e . pytest ruff`, `make lint`, `make test`. When `make lint` fails, `make test` does not run in that job.

To repeat one run locally:

```bash
pip install -e . pytest ruff
make lint
make test
```

To repeat both, do the same in a virtual environment of each Python release.

### Lint

`make lint` runs `python -m ruff check pingboard tests` (`Makefile`).

The repository has no ruff configuration, and the workflow installs ruff without naming a release. The set of rules is therefore the default of whichever ruff release gets installed, and it can change from one day to the next without a change in the repository.

When this page was written, the newest ruff release reported six findings on the unchanged code with its default rules: one in `pingboard/check.py` (`BLE001`), three in `pingboard/store.py` (`UP035` and two `UP006`), and one each in `tests/test_cli.py` and `tests/test_config.py` (`I001`). With only the rule families `E4`, `E7`, `E9` and `F`, which were ruff's defaults for a long time, the code passes:

```bash
python -m ruff check --select E4,E7,E9,F pingboard tests
# All checks passed!
```

If `make lint` fails for you on code you did not touch, compare your ruff release with the one in the log of the last green CI run before you look for a cause in your change.

### Unit tests

`make test` runs `python -m pytest -q`. There is no pytest configuration, no coverage measurement and no minimum number of tests. [What is tested where](../start/map.md) lists what the suite covers.

## The docs workflow

Defined in `.github/workflows/docs.yml`.

- It runs on a pull request that changes `docs/guide/`, `scripts/docs-check*`, the `Makefile` or the workflow itself, and on a push to `main` that does.
- The job `build` runs `make docs`: first `./scripts/docs-check.sh`, then a build of the three books with mdBook.
- On `main`, a second job, `deploy`, publishes the built site to GitHub Pages. It does not run on pull requests.

`scripts/docs-check.sh` fails when a relative link in a book points to nothing or leaves `docs/guide/`, and when an environment variable, a command, a flag, a route or a metric exists in the code but is missing from its reference page in the operator guide. So a pull request that adds a setting has to document it.

```bash
# Only the check, without building. Needs no extra tools.
make docs-check

# Check and build. Needs mdbook.
make docs
```

## What no check covers

- The check itself, the check loop and the HTTP server: they have no tests. See [What is tested where](../start/map.md#what-has-no-test).
- Formatting: no formatter runs.
- Types: no type checker runs.
