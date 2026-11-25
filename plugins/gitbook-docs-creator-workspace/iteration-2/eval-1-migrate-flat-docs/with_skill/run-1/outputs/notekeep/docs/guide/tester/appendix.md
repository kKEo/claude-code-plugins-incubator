# Appendix: words and commands

The testing words this guide uses, then every test command in one table.

## Words

**Check.** One job that GitHub Actions runs on a pull request, such as `test`.

**Gate.** A check that has to pass before a change is merged.

**Sandbox.** A throwaway server with its own database and port, used for exploring by hand.

**Suite.** Everything `./run-tests.sh` runs: the pytest tests and the compile check.

**Temporary database.** The database file a test creates in pytest's `tmp_path` directory
and names in `NOTEKEEP_DB`. It is removed by pytest, not by notekeep.

## Commands

| Command | What it runs |
|---|---|
| `./run-tests.sh` | The whole suite: all tests, then the compile check |
| `python3 -m pytest -q tests` | All tests |
| `python3 -m pytest -q tests/test_api.py` | The tests for defaults and the schema |
| `python3 -m pytest -q tests/test_cli.py` | The tests for the commands |
| `python3 -m pytest -q <file>::<test>` | One test |
| `python3 -m py_compile notekeep.py` | The compile check |
| `make docs-check` | Links in the books, and the operator reference against the code |
| `make docs` | `make docs-check`, then a build of every book (needs mdBook) |
