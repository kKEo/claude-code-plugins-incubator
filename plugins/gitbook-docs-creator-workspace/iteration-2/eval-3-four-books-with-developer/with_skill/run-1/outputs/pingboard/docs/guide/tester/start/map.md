# What is tested where

This chapter maps each area of pingboard to the tests that cover it, so that a reviewer can find the tests for a change and see where there are none.

All tests are unit tests run by pytest, in `tests/`, one file per module. There are no integration or end-to-end tests: nothing starts the dashboard or makes an HTTP request.

| Area | Code | Tests | Covered | Not covered |
|---|---|---|---|---|
| Settings | `pingboard/config.py` | `tests/test_config.py` | Defaults of `PINGBOARD_PORT`, `PINGBOARD_INTERVAL` and `PINGBOARD_TIMEOUT` (`test_defaults`); the minimum interval (`test_interval_floor`) | Defaults of `PINGBOARD_BIND`, `PINGBOARD_DATA` and `PINGBOARD_LOG_LEVEL`; values that are not numbers |
| Targets file | `pingboard/store.py` | `tests/test_store.py` | Writing sorts and removes duplicates (`test_roundtrip_sorted_unique`); a missing file reads as an empty list (`test_missing_file_is_empty`) | A file that is not valid JSON; two writers at once |
| Commands | `pingboard/cli.py` | `tests/test_cli.py` | `add` rejects a URL that is not `http://` or `https://` (`test_add_rejects_non_http`) | `remove`, `list`, `check` with its flags and exit status, `serve --port` |
| One check | `pingboard/check.py` | none | Nothing | The up rule, error statuses, timeouts, network errors |
| Dashboard and checker | `pingboard/server.py` | none | Nothing | The four HTTP paths, the metrics format, the checker loop |

Run the tests of one row with its file name, for example:

```bash
python -m pytest -q tests/test_store.py
```

The areas without tests are the ones to explore by hand; [Exploring by hand](../explore/by-hand.md) starts from this table.
