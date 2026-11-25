# What is tested where

This page maps each area of the product to the tests that cover it, so that you can find the tests for a change and see where there are none. All automated tests are unit tests in `tests/`, run with `make test`.

## Areas and their tests

| Area | Code | Tests | Kind |
|---|---|---|---|
| Settings | `pingboard/config.py` | `tests/test_config.py` | unit |
| Target list on disk | `pingboard/store.py` | `tests/test_store.py` | unit |
| Command line | `pingboard/cli.py` | `tests/test_cli.py` | unit |
| One check | `pingboard/check.py` | none | by hand |
| Check loop and HTTP routes | `pingboard/server.py` | none | by hand |

## What each test checks

| Test | What it proves |
|---|---|
| `tests/test_config.py::test_defaults` | Without the variables set, the port is 8080, the interval 60 and the timeout 5.0. |
| `tests/test_config.py::test_interval_floor` | `PINGBOARD_INTERVAL=2` makes `config.load()` exit. |
| `tests/test_store.py::test_roundtrip_sorted_unique` | A written list is read back sorted and without duplicates. |
| `tests/test_store.py::test_missing_file_is_empty` | Reading a data file that does not exist gives an empty list. |
| `tests/test_cli.py::test_add_rejects_non_http` | `pingboard add ftp://example.org` exits instead of adding the target. |

Run one of them with its name:

```bash
python -m pytest -q tests/test_store.py::test_roundtrip_sorted_unique
```

## What has no test

A change in one of these places is not caught by `make test`. Check it by hand ([Exploring by hand](../explore/by-hand.md)) or add a test with the change ([Adding tests](../contributing/adding-tests.md)).

| Area | Not covered |
|---|---|
| `pingboard/check.py` | Everything: the rule that a status below 400 is up, the status `0` for a failure without a response, the timeout. |
| `pingboard/server.py` | Everything: the check loop, the four routes, the metrics, the log lines. |
| `pingboard/cli.py` | `remove`, `list`, `check` with `--json` and `--fail-fast`, the exit status of `check`, `serve --port`, and adding a valid target. |
| `pingboard/config.py` | The defaults of `PINGBOARD_BIND`, `PINGBOARD_DATA` and `PINGBOARD_LOG_LEVEL`, and values that are not numbers. |
| `pingboard/store.py` | Two writes at the same time, and a data file that is not valid JSON. |

> **Note.** The two tests that expect an exit use `pytest.raises(SystemExit)` and do not look at the message or the exit status. They pass for any exit, also one caused by something else than the rule they are named after.
