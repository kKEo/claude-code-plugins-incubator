# Running the tests

This page takes you from a fresh checkout to a full test run, which takes about two minutes the first time and under a second after that. It then shows how to run one file or one test, and how to run the linter.

## Before you start

- Python 3.9 or newer. CI runs the suite on Python 3.9 and 3.12.
- A checkout of the repository, and a terminal in its root.
- `make`.

The tests need no network access and no running pingboard: they call the code directly and never send a request.

## Run everything once

1. Create a virtual environment and activate it. The Makefile calls `python`, and the virtual environment makes sure that name exists and has the tools.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   ```

2. Install pingboard and the two test tools. This is the same line CI runs, from `.github/workflows/ci.yml`.

   ```bash
   pip install -e . pytest ruff
   ```

3. Run the suite.

   ```bash
   make test
   ```

   `make test` runs `python -m pytest -q`. A pass looks like this:

   ```text
   .....                                                                    [100%]
   5 passed in 0.04s
   ```

A failing test shows as `F` in place of a dot, followed by the traceback of each failure, and `make` ends with an error.

## Run one file or one test

`make test` takes no arguments, so call pytest directly.

```bash
# One file
python -m pytest -q tests/test_store.py

# One test
python -m pytest -q tests/test_config.py::test_interval_floor

# Every test whose name contains a word
python -m pytest -q -k store
```

## Run the linter

```bash
make lint
```

`make lint` runs `python -m ruff check pingboard tests`. The repository has no ruff configuration, so ruff applies its default rules. [Continuous integration](../gates/ci.md) says what CI does with the result.

## Next

- [What is tested where](map.md) to find the tests for an area.
- [Continuous integration](../gates/ci.md) to see what runs on a pull request.
