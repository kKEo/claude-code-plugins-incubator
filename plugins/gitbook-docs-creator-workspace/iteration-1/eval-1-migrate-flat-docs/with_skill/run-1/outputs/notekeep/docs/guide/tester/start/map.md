# What is tested where

This page maps each area of notekeep to the tests that cover it, so that you can find the
tests for a change and see what has none. The whole suite is three tests in two files.

| Area | Test | Kind | Run it alone |
|---|---|---|---|
| Default of `NOTEKEEP_PORT` | `tests/test_api.py::test_default_port` | Unit | `python3 -m pytest -q tests/test_api.py::test_default_port` |
| The `notes` table is created on first use | `tests/test_api.py::test_schema_created` | Unit, temporary database | `python3 -m pytest -q tests/test_api.py::test_schema_created` |
| `show` exits with an error for a missing note | `tests/test_cli.py::test_show_missing_note_exits` | Command line, temporary database | `python3 -m pytest -q tests/test_cli.py` |
| `notekeep.py` compiles | `python3 -m py_compile notekeep.py` in `run-tests.sh` | Compile check | `python3 -m py_compile notekeep.py` |

## Areas with no automated test

No test starts the HTTP server or sends a request. These areas are covered only by
[exploring by hand](../explore/by-hand.md):

| Area | In the code |
|---|---|
| `GET /health`, `GET /notes` and the `404` answer | `Handler.do_GET` |
| Saving and replacing a note with `PUT` | `Handler.do_PUT` |
| The token check and the `401` answer | `Handler._auth` |
| The size limit and the `413` answer | `Handler.do_PUT`, `NOTEKEEP_MAX_NOTE_BYTES` |
| The commands `serve`, `list`, `export` and `vacuum`, and `show` for a note that exists | `main` |
| The defaults of `NOTEKEEP_DB`, `NOTEKEEP_TOKEN` and `NOTEKEEP_MAX_NOTE_BYTES` | top of `notekeep.py` |
