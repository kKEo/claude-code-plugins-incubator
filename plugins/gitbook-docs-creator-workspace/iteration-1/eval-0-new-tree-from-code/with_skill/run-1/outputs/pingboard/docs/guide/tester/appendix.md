# Appendix: words and commands

The testing words this guide uses, and every command that runs a check.

## Words

**CI (continuous integration).** The checks that GitHub runs by itself on every pull request, defined in `.github/workflows/`.

**Exploratory testing.** Trying the product by hand to find what the automated tests do not ask about.

**Fixture.** Something pytest prepares for a test and hands to it as an argument. The tests here use two built-in ones, `monkeypatch` and `tmp_path`.

**Gate.** A check that runs on a pull request.

**Linter.** A tool that reads code for mistakes without running it. Here: ruff.

**Matrix.** One CI job run several times with one value changed. Here: the job `test` on Python 3.9 and 3.12.

**`monkeypatch`.** The pytest fixture that changes an environment variable for one test and restores it afterwards.

**Sandbox.** A pingboard with its own data file and port, set up so that tests by hand cannot touch real data.

**`tmp_path`.** The pytest fixture that gives each test its own empty temporary directory.

**Unit test.** A test of one function or module on its own, without network or other processes.

## Commands

| Command | What it runs | Defined in |
|---|---|---|
| `make test` | `python -m pytest -q`: all unit tests. | `Makefile` |
| `make lint` | `python -m ruff check pingboard tests`: the linter. | `Makefile` |
| `make run` | `python -m pingboard.cli serve`: the server, for testing by hand. | `Makefile` |
| `make docs-check` | `./scripts/docs-check.sh`: links in the books, and reference pages against the code. | `Makefile` |
| `make docs` | `make docs-check`, then a build of the three books with mdBook. | `Makefile` |
| `python -m pytest -q tests/test_store.py` | The tests of one file. | pytest |
| `python -m pytest -q tests/test_config.py::test_interval_floor` | One test. | pytest |
| `pingboard check` | One check of every target; exit status 1 when one is down. | `pingboard/cli.py` |
