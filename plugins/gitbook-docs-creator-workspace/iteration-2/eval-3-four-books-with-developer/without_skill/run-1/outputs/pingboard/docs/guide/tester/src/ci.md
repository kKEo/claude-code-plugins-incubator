# Continuous integration

Continuous integration runs on GitHub Actions. The workflow is the file `.github/workflows/ci.yml`.

## When it runs

* On every pull request.
* On every push to the `main` branch.

## What it runs

One job, `test`, runs twice: once on Python 3.9 and once on Python 3.12, both on Ubuntu.

| Step | Command | Fails when |
| --- | --- | --- |
| Install | `pip install -e . pytest ruff` | The package cannot be installed |
| Lint | `make lint` | ruff reports a finding in `pingboard/` or `tests/` |
| Test | `make test` | A test fails or cannot be collected |

A pull request is ready for review when both runs are green.

## Reading a failure

Open the **Checks** tab of the pull request, select the failed run and expand the red step.

| Failed step | Usual cause | What to do |
| --- | --- | --- |
| Lint | An unused import or variable, or a syntax error | Run `make lint` locally. `python -m ruff check --fix pingboard tests` repairs many findings |
| Test, on both versions | The change broke a behaviour, or a test is wrong | Run the named test locally with `python -m pytest <file>::<test> -vv` |
| Test, on 3.9 only | A feature of a newer Python version is used | Reproduce with a Python 3.9 environment, see [Running the tests](running.md) |
| Install | A mistake in `pyproject.toml` | Run `pip install -e .` in a fresh virtual environment |

The tools are not pinned to a version: continuous integration installs the newest ruff and pytest. If a run fails on code that you did not touch, a new ruff release with new default rules is a likely cause. Report it in an issue instead of working around it in an unrelated pull request.

This is the case at the time of writing: ruff 0.16.0 and later report six findings on the code of version 0.6.0, so the lint step fails until they are fixed or ruff is pinned. [Running the tests](running.md) lists the findings.

## What it does not run

* No tests on macOS or Windows.
* No tests on Python 3.10, 3.11 or 3.13.
* No coverage measurement and no coverage threshold.
* No formatting check; only `ruff check` runs, not `ruff format`.
* No build of the documentation.
* Nothing from the [manual test plan](manual.md).

A green run therefore means "lint is clean and the five unit tests pass", not "the version works". For changes to the check, the command output or the server, run the manual test plan as well and say so in the pull request.
