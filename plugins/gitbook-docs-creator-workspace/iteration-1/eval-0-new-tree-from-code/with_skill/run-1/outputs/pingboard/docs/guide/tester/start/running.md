# Running the tests

This page shows how to run the whole test suite once, and then one file or one test. Setting up takes about five minutes; the suite itself runs in under a second.

## Before you start

- Python 3.9 or newer, `git` and `make`.
- A clone of <https://github.com/example/pingboard>.

The tests need no network access and do not touch your own target list: they use temporary directories.

## Set up

1. From the root of the clone, create a virtual environment and activate it. The `Makefile` calls `python`, and the virtual environment provides that command.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   ```

2. Install pingboard and the two tools, with the same command that CI uses (`.github/workflows/ci.yml`).

   ```bash
   pip install -e . pytest ruff
   ```

## Run the whole suite

```bash
make test
```

`make test` runs `python -m pytest -q` (`Makefile`). A pass looks like this, and `make` exits with status 0:

```text
.....                                                                    [100%]
5 passed in 0.06s
```

Each dot is one passed test.

## Read a failure

A failed test shows as `F` in the first line. pytest then prints the test, the line that failed and the two values it compared, and a summary:

```text
.F...                                                                    [100%]
=================================== FAILURES ===================================
________________________________ test_defaults _________________________________
...
>       assert (cfg.port, cfg.interval, cfg.timeout) == (8081, 60, 5.0)
E       assert (8080, 60, 5.0) == (8081, 60, 5.0)

tests/test_config.py:9: AssertionError
=========================== short test summary info ============================
FAILED tests/test_config.py::test_defaults - assert (8080, 60, 5.0) == (8081,...
1 failed, 4 passed in 0.06s
make: *** [test] Error 1
```

The line that starts with `FAILED` gives the name of the test; use it to run that test alone.

## Run one file or one test

```bash
# One file.
python -m pytest -q tests/test_store.py

# One test.
python -m pytest -q tests/test_config.py::test_interval_floor
```

## Run the linter

```bash
make lint
```

`make lint` runs `python -m ruff check pingboard tests`. It prints `All checks passed!` or a list of findings with file and line, and exits with a status other than 0 when there are findings. [Continuous integration](../gates/ci.md#lint) explains why the result can differ between two machines.

## Next

- [What is tested where](map.md) to find the tests for the code you are changing.
- [Continuous integration](../gates/ci.md) to see what runs on a pull request.
- [Adding tests](../contributing/adding-tests.md) when a change needs a new test.
