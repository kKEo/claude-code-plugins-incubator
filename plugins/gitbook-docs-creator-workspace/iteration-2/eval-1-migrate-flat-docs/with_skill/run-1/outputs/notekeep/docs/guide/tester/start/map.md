# What is tested where

This page maps each area of notekeep to the tests that cover it, so that you can find the
tests for a change and see which areas have none.

All tests are unit tests that import `notekeep.py` and call it directly. None of them starts
the server or sends an HTTP request.

| Area | Test | Run it alone |
|---|---|---|
| Default port is `7070` | `tests/test_api.py::test_default_port` | `python3 -m pytest -q tests/test_api.py::test_default_port` |
| The `notes` table is created in an empty database | `tests/test_api.py::test_schema_created` | `python3 -m pytest -q tests/test_api.py::test_schema_created` |
| `show` exits with an error for a missing note | `tests/test_cli.py::test_show_missing_note_exits` | `python3 -m pytest -q tests/test_cli.py::test_show_missing_note_exits` |
| `notekeep.py` compiles | the `py_compile` step of `run-tests.sh` | `python3 -m py_compile notekeep.py` |

## Areas with no automated test

| Area | What is not checked |
|---|---|
| HTTP API | `GET /health`, `GET /notes`, `PUT /notes/<title>`, the `404` and `501` answers |
| Token | The `401` answer, and that `/health` stays open, when `NOTEKEEP_TOKEN` is set |
| Size limit | The `413` answer and `NOTEKEEP_MAX_NOTE_BYTES` |
| Saving | That saving to an existing title replaces the note |
| Commands | `serve`, `list`, `export`, `vacuum`, and `show` for a note that exists |
| Settings | `NOTEKEEP_DB`, `NOTEKEEP_TOKEN` and `NOTEKEEP_MAX_NOTE_BYTES` defaults |

Check these by hand until they have tests; see [Exploring by hand](../explore/by-hand.md).
The requests and answers are listed in the operator guide's
[HTTP API](../../operator/config/api.md) page.
