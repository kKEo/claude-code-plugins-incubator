# What the suite covers

- `tests/test_api.py`: defaults and the schema.
- `tests/test_cli.py`: command line errors.

| Test | Checks |
|---|---|
| `test_default_port` | The port is 7070 when `NOTEKEEP_PORT` is not set. |
| `test_schema_created` | The `notes` table is created on first use and starts empty. |
| `test_show_missing_note_exits` | `show` exits with an error for a title that does not exist. |

## Adding a test

New behaviour needs a test in one of the two files.

Point `NOTEKEEP_DB` at a file under pytest's `tmp_path` before the test touches the
database. notekeep reads its settings when the module is imported, so a test that changes an
environment variable must reload the module, as `load()` in `tests/test_api.py` does.

## Not covered yet

No test sends an HTTP request. The token check, the note size limit, `export` and `vacuum`
have no tests.
