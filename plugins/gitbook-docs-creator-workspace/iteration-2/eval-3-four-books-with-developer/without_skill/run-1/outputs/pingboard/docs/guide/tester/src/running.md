# Running the tests

## Set up

From the root of a clone, in a virtual environment:

```
python -m venv .venv
. .venv/bin/activate
pip install -e . pytest ruff
```

This is the same install line that continuous integration uses. `pytest` and `ruff` are not declared in `pyproject.toml`, so you install them by name.

## Run everything

```
make lint
make test
```

Expected output of `make test`:

```
.....                                                                    [100%]
5 passed in 0.03s
```

`make lint` prints `All checks passed!` when the code is clean.

> **Note:** the result of `make lint` depends on the ruff version, because the project uses ruff's default rules and does not pin ruff. With ruff 0.14.0 the code of version 0.6.0 is clean. With ruff 0.16.0 and 0.17.6, whose default rule set is larger, the same code has six findings: `BLE001` in `pingboard/check.py`, `UP035` and `UP006` in `pingboard/store.py`, and `I001` in `tests/test_cli.py` and `tests/test_config.py`. Check your version with `python -m ruff --version`. Until the project fixes the findings or pins ruff, judge your change by whether it adds findings to these six.

The whole suite runs in well under a second. It needs no network and does not touch your own target list, because every test that needs a data file points `PINGBOARD_DATA` at a temporary folder.

## Run a part

`make test` is `python -m pytest -q`. Call pytest directly for anything more specific:

| Goal | Command |
| --- | --- |
| One file | `python -m pytest tests/test_store.py` |
| One test | `python -m pytest tests/test_config.py::test_interval_floor` |
| Tests whose name matches a word | `python -m pytest -k interval` |
| Stop at the first failure | `python -m pytest -x` |
| Show test names and full differences | `python -m pytest -vv` |
| Show the output of `print` | `python -m pytest -s` |

## Run on another Python version

Continuous integration runs Python 3.9 and 3.12. To reproduce a failure that appears on only one of them, create a virtual environment with that interpreter:

```
python3.9 -m venv .venv39
. .venv39/bin/activate
pip install -e . pytest ruff
make lint test
```

The code must run on Python 3.9. Syntax and library features from later versions, such as `match` statements or `list[str] | None` in annotations that are evaluated at run time, fail there.

## Measure coverage

Coverage is not measured in continuous integration. To measure it locally:

```
pip install pytest-cov
python -m pytest --cov=pingboard --cov-report=term-missing
```

The report lists, per module, the lines that no test executes.

## Your environment and the tests

`test_defaults` removes `PINGBOARD_PORT`, `PINGBOARD_INTERVAL` and `PINGBOARD_TIMEOUT` from the environment before it runs, so these variables do not disturb it. `test_add_rejects_non_http`, however, loads the full configuration: if your shell has an invalid value in a `PINGBOARD_*` variable, unset it before you run the tests.

## Clean up

The tools leave caches behind: `.pytest_cache/`, `.ruff_cache/`, `__pycache__/` and `pingboard.egg-info/`. They are safe to delete.
