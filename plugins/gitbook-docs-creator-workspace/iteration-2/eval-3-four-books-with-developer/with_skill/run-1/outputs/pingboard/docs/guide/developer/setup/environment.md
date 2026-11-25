# Development environment

This chapter takes you from a fresh checkout to a passing test run and a dashboard running from your working tree. It takes about five minutes.

## Before you start

| Tool | Needed for | Notes |
|---|---|---|
| Python 3.9 or newer, with `pip` | Everything | `requires-python` in `pyproject.toml`; CI runs 3.9 and 3.12 |
| `git` | Fetching the source | |
| `make` | The `test`, `lint`, `run` and docs targets | Each target is one command you can also type yourself |
| `pytest` and `ruff` | Tests and lint | Installed in step 2; the project does not pin their versions |
| `mdbook` | Building the documentation | Only for `make docs`; a single binary |

pingboard has no run-time dependencies and no lock file.

## Set up

1. Fetch the source.

   ```bash
   git clone https://github.com/example/pingboard.git
   cd pingboard
   ```

2. Create a virtual environment and install the package with the test tools. This is the command CI uses.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -e . pytest ruff
   ```

   The install is editable: the `pingboard` command runs the code in your working tree, so an edit takes effect at the next run.

3. Run the tests.

   ```bash
   make test
   ```

   It runs `python -m pytest -q` and ends with a line like:

   ```text
   5 passed in 0.08s
   ```

4. Run the linter.

   ```bash
   make lint
   ```

   It runs `python -m ruff check pingboard tests`. The Makefile calls `python`, not `python3`, so the virtual environment has to be active.

## Run from the working tree

Keep your development targets away from your real list by pointing `PINGBOARD_DATA` at a scratch file.

```bash
export PINGBOARD_DATA=/tmp/pingboard-dev.json
pingboard add https://example.org
make run
```

`make run` runs `python -m pingboard.cli serve`. It logs a line that ends with `INFO listening on http://127.0.0.1:8080` and keeps running; open that address in a browser and stop the process with Ctrl+C. To see a result sooner while you work, set `PINGBOARD_INTERVAL=5`, the smallest value allowed.

## Build the documentation

```bash
make docs-check   # links, and the reference pages against the code
make docs         # the check, then all books into site/
make docs-site    # build and serve the whole site locally
```

`make docs-check` fails when the code has a setting, command, flag or metric that the operator guide's reference pages do not list.

## Next

- [Conventions and pull requests](../contributing/conventions.md) before you open a pull request.
- [Running the tests](../../tester/start/running.md) in the tester guide, for running a single test.
