# Running the tests

This chapter shows how to run the whole test suite once, what a pass and a failure look like, and how to run one file or one test. The suite finishes in under a second.

## Before you start

- Python 3.9 or newer and a checkout of the repository.
- The package and the test tools, installed with the command CI uses:

  ```bash
  python3 -m venv .venv
  . .venv/bin/activate
  pip install -e . pytest ruff
  ```

The tests need no network access and no running dashboard. They write only into temporary directories that pytest creates and never touch `~/.pingboard`.

## Run everything

```bash
make test
```

`make test` runs `python -m pytest -q` from the repository root. A pass prints one dot per test and a summary:

```text
.....                                                                    [100%]
5 passed in 0.08s
```

A failure prints an `F` in place of the dot, then the failing assertion with the values compared, and a summary line that names each failed test as `FAILED tests/<file>::<test>`. `make` then ends with an error, which is what makes the CI job fail.

## Run the linter

```bash
make lint
```

`make lint` runs `python -m ruff check pingboard tests`. It prints `All checks passed!` or one block per finding with the file, the line and the rule.

## Run one file or one test

```bash
# One file
python -m pytest -q tests/test_config.py

# One test
python -m pytest -q tests/test_config.py::test_interval_floor

# Every test whose name contains a word
python -m pytest -q -k store
```

Use `python -m pytest` as the Makefile does; it puts the repository root on the import path.

## Next

- [What is tested where](map.md) to find the tests for an area.
- [Continuous integration](../gates/ci.md) to see what runs on a pull request.
