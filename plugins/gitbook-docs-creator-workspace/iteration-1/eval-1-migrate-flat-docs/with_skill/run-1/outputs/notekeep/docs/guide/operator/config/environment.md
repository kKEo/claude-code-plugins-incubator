# Environment variables and settings

This is the complete list of settings. notekeep reads environment variables only: it has no
configuration file and no command line flag for any of them. The values come from the top of
`notekeep.py` and are read once, at start.

| Variable | Type | Default | Effect |
|---|---|---|---|
| `NOTEKEEP_DB` | path | `~/.notekeep/notes.db` | The SQLite database file. Its directory is created when missing. The path must contain a directory part: a bare file name such as `notes.db` fails. |
| `NOTEKEEP_MAX_NOTE_BYTES` | integer | `65536` | Largest accepted `Content-Length` of a `PUT`, in bytes. A larger request gets `413`. |
| `NOTEKEEP_PORT` | integer | `7070` | TCP port of `serve`. The server always binds `0.0.0.0`. |
| `NOTEKEEP_TOKEN` | string | empty | When not empty, every request except `GET /health` must send `Authorization: Bearer <token>`. When empty, no request is checked. |

Notes on the table:

- The variables apply to every command, not only to `serve`. `list`, `show`, `export` and
  `vacuum` use `NOTEKEEP_DB` to find the database.
- `NOTEKEEP_PORT` and `NOTEKEEP_MAX_NOTE_BYTES` are parsed as integers when the program
  starts. Any other value stops every command with a `ValueError`.
- The listen address is not configurable.
