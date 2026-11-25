# Conventions and pull requests

This chapter lists the rules a change to pingboard follows. It states only what the repository shows: the tools it configures, what CI runs and the patterns the existing code keeps.

## What CI checks

The workflow `.github/workflows/ci.yml` runs on every pull request and on every push to `main`. On Python 3.9 and on Python 3.12 it runs `make lint` and then `make test`. Run both before you push. The tester guide's [Continuous integration](../../tester/gates/ci.md) describes each step.

A pull request that touches `docs/guide/`, `scripts/docs-check.sh` or the `Makefile` also runs the `docs` workflow, which runs `make docs`.

## Code style

- **Linter.** `ruff check`, through `make lint`. The repository has no ruff configuration, so ruff's default rules apply, and the version is not pinned.
- **Formatter.** None is configured. Match the surrounding code.
- **Python version.** Code has to run on Python 3.9, the lower end of the CI matrix.
- **Dependencies.** The package uses only the standard library, and `pyproject.toml` declares no dependencies.

## Patterns the code keeps

| Pattern | Where to see it |
|---|---|
| Each module starts with a one-line docstring that says what it owns | The first line of every file in `pingboard/` |
| Settings are named `PINGBOARD_<NAME>` and are read only in `config.load()` | `pingboard/config.py` |
| Functions take the values they need as arguments; they do not read the environment or global settings | `store.read(path)`, `check.check(url, timeout)` |
| An error the user can cause ends the command with `sys.exit("pingboard: <message>")`, which prints the message to standard error and exits with status 1 | `cli.main()`, `config.load()` |
| Log lines use `key=value` pairs after a short message | `log.warning("target down url=%s status=%s error=%s", …)` in `server.py` |
| Tests are named `tests/test_<module>.py` | `tests/` |

## What a change needs

| If you change… | Also change… |
|---|---|
| A setting, command, flag or metric | The operator guide's reference page for it; `make docs-check` fails until you do |
| An error message | The pages that quote it: the user guide's questions page and the operator guide's troubleshooting runbook |
| Behaviour that a test covers, or new behaviour | A test, as described in [Adding tests](../../tester/contributing/adding-tests.md) |
| The fields of `Result` | The field tables in the operator guide; the JSON outputs change with it |

## Commit messages and review

The repository contains no contributing file, commit-message rule, pull-request template or code-owners file, so this guide states none. Open pull requests against `main` at <https://github.com/example/pingboard/pulls>.
