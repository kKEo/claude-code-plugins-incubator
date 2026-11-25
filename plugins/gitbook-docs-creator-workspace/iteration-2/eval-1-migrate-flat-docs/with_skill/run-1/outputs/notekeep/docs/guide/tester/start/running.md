# Running the tests

This page shows how to run the whole suite, which takes about a second, and how to run one
file or one test.

## Before you start

- Python 3 and a checkout of the repository.
- pytest, which is the only thing the suite needs beyond Python:

  ```bash
  pip install pytest
  ```

## Run everything

```bash
./run-tests.sh
```

The script, [`run-tests.sh`](https://github.com/example/notekeep/blob/HEAD/run-tests.sh),
does two things and stops at the first failure:

1. `python3 -m pytest -q tests` runs the tests.
2. `python3 -m py_compile notekeep.py` checks that the script compiles.

A pass looks like this, and the script exits with status 0:

```text
...                                                                      [100%]
3 passed in 0.05s
```

On a failure pytest prints the failing test and the assertion, and the script exits with a
status other than 0. When pytest is not installed, the script stops with
`No module named pytest`.

The tests point `NOTEKEEP_DB` at a temporary database, so they never touch your notes.

## Run one file or one test

```bash
# one file
python3 -m pytest -q tests/test_cli.py

# one test
python3 -m pytest -q tests/test_cli.py::test_show_missing_note_exits
```

## Next

- [What is tested where](map.md)
- [Continuous integration](../gates/ci.md)
