# Configuration

notekeep is configured with environment variables only. They are read once, at start.

| Variable | Default | Meaning |
|---|---|---|
| `NOTEKEEP_PORT` | `7070` | Port the server listens on. |
| `NOTEKEEP_DB` | `~/.notekeep/notes.db` | Path of the SQLite database file. |
| `NOTEKEEP_TOKEN` | empty | When set, every request except the health check must send `Authorization: Bearer <token>`. |
| `NOTEKEEP_MAX_NOTE_BYTES` | `65536` | Largest note body accepted by PUT. |

With `NOTEKEEP_TOKEN` empty the server accepts requests from anyone who can reach it.
