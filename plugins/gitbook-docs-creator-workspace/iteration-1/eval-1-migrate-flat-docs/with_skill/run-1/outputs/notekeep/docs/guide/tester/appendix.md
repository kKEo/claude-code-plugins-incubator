# Appendix: words and commands

This page defines the testing words this book uses and lists every test command.

## Words

**Compile check.** `python3 -m py_compile notekeep.py`: it fails when the file has a syntax
error, and runs no code.

**Gate.** A check that runs automatically on a pull request. See
[Continuous integration](gates/ci.md).

**Reload.** Importing `notekeep` again with `importlib.reload`, so that it reads the
environment variables a test has just set.

**Sandbox.** A server started with its own `NOTEKEEP_DB` and `NOTEKEEP_PORT` for testing by
hand.

**Suite.** Everything `./run-tests.sh` runs: the tests under `tests/` and the compile check.

**Temporary database.** A database file under pytest's `tmp_path`, which pytest creates
for one test.

## Commands

| Command | What it runs | Defined in |
|---|---|---|
| `./run-tests.sh` | The whole suite | `run-tests.sh` |
| `python3 -m pytest -q tests` | Every test, without the compile check | `run-tests.sh` |
| `python3 -m pytest -q tests/test_api.py` | The settings and schema tests | `tests/test_api.py` |
| `python3 -m pytest -q tests/test_cli.py` | The command line test | `tests/test_cli.py` |
| `python3 -m pytest -q tests -k schema` | The tests whose name contains `schema` | pytest |
| `python3 -m py_compile notekeep.py` | The compile check | `run-tests.sh` |
| `make docs-check` | Link check and reconciliation of the operator reference | `scripts/docs-check.sh` |
| `make docs` | `make docs-check`, then a build of the three books | `Makefile` |
