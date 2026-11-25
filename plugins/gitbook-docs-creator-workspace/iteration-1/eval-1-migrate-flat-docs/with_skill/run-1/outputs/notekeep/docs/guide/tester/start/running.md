# Running the tests

This page takes you from a fresh copy of the repository to a full, passing test run. The
run itself takes less than a second.

## Before you start

- `python3`.
- pytest. CI installs it with the same command:

  ```bash
  pip install pytest
  ```

## Run everything

From the root of the repository:

```bash
./run-tests.sh
```

The script is `run-tests.sh`, and it does two things in order:

1. `python3 -m pytest -q tests` runs every test under `tests/`.
2. `python3 -m py_compile notekeep.py` checks that the program compiles.

A pass looks like this, and the script ends with status `0`:

```text
...                                                                      [100%]
3 passed in 0.03s
```

On a failure, pytest prints the name of the failing test and the assertion, and the script
stops there with a status that is not `0`: the compile step does not run.

The tests set `NOTEKEEP_DB` to a file in a temporary directory, so they never touch your
own notes.

## Run one file or one test

```bash
python3 -m pytest -q tests/test_cli.py
python3 -m pytest -q tests/test_api.py::test_default_port
python3 -m pytest -q tests -k schema
```

Run these from the root of the repository too: the tests import `notekeep` from the
current directory.

## Next

- [What is tested where](map.md) shows which file covers which area.
- [Continuous integration](../gates/ci.md) shows what runs on a pull request.
