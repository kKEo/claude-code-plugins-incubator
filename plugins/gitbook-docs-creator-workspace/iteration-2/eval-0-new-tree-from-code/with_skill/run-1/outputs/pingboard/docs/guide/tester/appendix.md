# Appendix: words and commands

The testing words this guide uses, in alphabetical order, followed by every test command in one table.

## Words

**CI.** Continuous integration: the workflow in `.github/workflows/ci.yml` that runs the checks on every pull request and on every push to `main`.

**Fixture.** Something pytest hands to a test that asks for it by name. The tests here use `tmp_path`, an empty temporary directory, and `monkeypatch`, which sets or removes environment variables for one test.

**Gate.** A check that runs automatically on a pull request.

**Lint.** A check of the source text for rule violations, without running it. Here it is done by ruff.

**Matrix.** The list of Python versions the CI job is repeated on: 3.9 and 3.12.

**Sandbox.** A pingboard that uses a throwaway targets file and a spare port, so that trying things cannot change a real list.

**Unit test.** A test that calls one module directly. All tests in `tests/` are unit tests.

## Commands

| Command | What it runs |
|---|---|
| `pip install -e . pytest ruff` | Installs pingboard and the test tools, as CI does. |
| `make test` | `python -m pytest -q`: the whole suite. |
| `make lint` | `python -m ruff check pingboard tests`: the linter. |
| `python -m pytest -q tests/test_store.py` | The tests in one file. |
| `python -m pytest -q tests/test_config.py::test_interval_floor` | One test. |
| `python -m pytest -q -k store` | Every test whose name contains `store`. |
| `make docs-check` | The link check and the code reconciliation of these books. |
| `make docs` | `docs-check`, then a build of all books. |
