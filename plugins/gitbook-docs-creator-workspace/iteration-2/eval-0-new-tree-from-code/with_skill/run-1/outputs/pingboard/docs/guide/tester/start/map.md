# What is tested where

This page maps each area of pingboard to the tests that cover it, so that you can find the tests for a change and see where there are none. It lists every test in `tests/`.

All existing tests are unit tests: each calls one module directly.

| Area | Code | Test file | Tests | What they check |
|---|---|---|---|---|
| Settings | `pingboard/config.py` | `tests/test_config.py` | `test_defaults` | With the variables unset, port, interval and timeout are `8080`, `60` and `5.0`. |
| Settings | `pingboard/config.py` | `tests/test_config.py` | `test_interval_floor` | `PINGBOARD_INTERVAL=2` makes `config.load()` exit. |
| Targets file | `pingboard/store.py` | `tests/test_store.py` | `test_roundtrip_sorted_unique` | A written list is read back sorted and without duplicates. |
| Targets file | `pingboard/store.py` | `tests/test_store.py` | `test_missing_file_is_empty` | A missing file reads as an empty list. |
| Command line | `pingboard/cli.py` | `tests/test_cli.py` | `test_add_rejects_non_http` | `add ftp://example.org` exits. |

## Areas with no automated test

| Area | Code | Not covered |
|---|---|---|
| One check | `pingboard/check.py` | Everything: the meaning of up, status codes, timeouts, connection errors. |
| Check loop and HTTP server | `pingboard/server.py` | Everything: the loop, the routes `/`, `/api/status`, `/metrics` and `/healthz`, the 404 answer, the log lines. |
| Command line | `pingboard/cli.py` | A successful `add`; `remove`, `list`, `check` with `--json` and `--fail-fast` and its exit status; `serve` and `--port`. |
| Settings | `pingboard/config.py` | The defaults of `PINGBOARD_BIND`, `PINGBOARD_DATA` and `PINGBOARD_LOG_LEVEL`; non-numeric values. |
| Targets file | `pingboard/store.py` | A file that is not valid JSON or has no `targets` key. |

A change in one of these areas is not protected by the suite. Check it by hand with [Exploring by hand](../explore/by-hand.md), and add a test where you can with [Adding tests](../contributing/adding-tests.md).

To run the tests of one area:

```bash
python -m pytest -q tests/test_config.py
```
