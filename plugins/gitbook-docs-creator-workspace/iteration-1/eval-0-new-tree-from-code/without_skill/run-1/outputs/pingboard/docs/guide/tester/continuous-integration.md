# Continuous integration

## What runs

The workflow is `.github/workflows/ci.yml`, named `ci`.

| Property | Value |
| --- | --- |
| Triggers | Every pull request; every push to `main` |
| Runner | `ubuntu-latest` |
| Python versions | 3.9 and 3.12, as a matrix |
| Job | `test` |

Steps of the job, for each Python version:

1. Check out the repository.
2. Set up Python.
3. `pip install -e . pytest ruff`
4. `make lint`
5. `make test`

The job fails when Ruff reports a problem or when a test fails. A pull request
is ready for review only when both matrix entries are green.

## Reproduce a CI failure locally

Use the Python version of the failing matrix entry and repeat the steps:

    python3.9 -m venv /tmp/ci-venv
    . /tmp/ci-venv/bin/activate
    pip install -e . pytest ruff
    make lint
    make test

The versions of `pytest` and `ruff` are not pinned. When CI fails on a change
that did not touch the code, compare the tool versions in the CI log with your
local ones (`python -m ruff --version`, `python -m pytest --version`).

## What CI does not do

- It does not run the manual test cases.
- It does not measure coverage.
- It does not test on macOS or Windows, or on Python 3.10, 3.11 and 3.13.
- It does not build or publish a release.
- It does not build this documentation.
