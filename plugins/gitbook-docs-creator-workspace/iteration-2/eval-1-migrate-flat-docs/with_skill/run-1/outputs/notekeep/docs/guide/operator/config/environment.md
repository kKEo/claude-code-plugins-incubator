# Environment variables and settings

This page lists every setting notekeep reads. All of them are environment variables; there
is no configuration file and no command line flag for them.

The values are read once, when `notekeep.py` starts, so a change needs a restart. The
defaults below are quoted from `notekeep.py`.

| Variable | Type | Default | Effect |
|---|---|---|---|
| `NOTEKEEP_DB` | path | `~/.notekeep/notes.db` | The SQLite database file. Its directory is created when missing. The path must contain a directory part: a bare file name such as `notes.db` fails. Read by the server and by every command. |
| `NOTEKEEP_MAX_NOTE_BYTES` | integer | `65536` | Largest note the server accepts, in bytes. A larger `PUT` is answered with `413`. |
| `NOTEKEEP_PORT` | integer | `7070` | TCP port the server listens on, on all IPv4 interfaces. |
| `NOTEKEEP_TOKEN` | string | empty | When set, every request except `GET /health` must send `Authorization: Bearer <token>`. When empty, no request needs a token. |

`NOTEKEEP_PORT` and `NOTEKEEP_MAX_NOTE_BYTES` must be whole numbers. Any other value stops
every command at start with `ValueError: invalid literal for int()`.
