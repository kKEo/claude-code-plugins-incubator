# Appendix: words and commands

This appendix defines the testing words this guide uses and lists every test command in one table.

## Words

| Word | Meaning |
|---|---|
| Fixture | Something pytest prepares for a test and cleans up afterwards. The suite uses two built-in ones: `monkeypatch` and `tmp_path`. |
| Gate | A check that runs automatically on a pull request. |
| Lint | A check of the source text for rule violations, without running it. Here: `ruff check`. |
| Matrix | The list of variants a CI job runs in. Here: Python 3.9 and Python 3.12. |
| `monkeypatch` | The pytest fixture that sets or deletes environment variables for one test and restores them afterwards. |
| Sandbox | A targets file and a port used only for testing, set through `PINGBOARD_DATA` and `PINGBOARD_PORT`. |
| `tmp_path` | The pytest fixture that gives a test its own empty temporary directory. |
| Unit test | A test that calls one function or command directly, without a network or a running dashboard. All current tests are unit tests. |

## Commands

| Command | What it runs |
|---|---|
| `make test` | `python -m pytest -q`: the whole suite |
| `make lint` | `python -m ruff check pingboard tests`: the linter |
| `python -m pytest -q tests/test_config.py` | The tests of one file |
| `python -m pytest -q tests/test_config.py::test_interval_floor` | One test |
| `python -m pytest -q -k store` | Every test whose name contains `store` |
| `make docs-check` | `scripts/docs-check.sh`: links in the books and the reference pages against the code |
| `make docs` | `make docs-check`, then a build of every book with mdBook |
