# System overview

This page gives the model that every later chapter assumes: what runs, what it stores, and
how a request reaches the database.

notekeep is one process and one file. `notekeep.py` contains the HTTP handler, the command
line and the database access, and it imports only the Python standard library. The notes
live in a single SQLite database file. There is no cache, no background work and no outbound
network call.

## Components

| Component | Name in the code | Owns | Talks to |
|---|---|---|---|
| HTTP server | `Handler`, started by `serve` | The JSON API on one TCP port | The database, through `db()` |
| Command line | `main` | The commands `serve`, `list`, `show`, `export` and `vacuum` | The database, through `db()` |
| Database access | `db()` | The SQLite file and the `notes` table | The file system |

Two consequences are easy to miss:

- `list`, `show`, `export` and `vacuum` do not talk to the server. They open the database
  file themselves, so they must run on the machine that holds the file, with the same
  `NOTEKEEP_DB` as the server.
- The server is a plain `HTTPServer`, which handles one request at a time.

## Where state is kept

All state is in the database file named by `NOTEKEEP_DB`. Every call to `db()` creates the
directory of that file and the `notes` table when they do not exist, so there is no separate
setup step and no migration code.

| Column | Type | Meaning |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY` | Row id |
| `title` | `TEXT UNIQUE` | The title, taken from the last segment of the request path |
| `body` | `TEXT` | The note text |
| `updated` | `TEXT DEFAULT CURRENT_TIMESTAMP` | Time of the last save, in UTC, as `YYYY-MM-DD HH:MM:SS` |

## How a request is handled

1. `GET /health` is answered at once with `{"ok": true}`. It never needs a token, so that a
   load balancer can probe it.
2. Every other request is checked against the shared token. When `NOTEKEEP_TOKEN` is set,
   the `Authorization` header must be exactly `Bearer <token>`; otherwise the answer is
   `401`.
3. The handler opens its own SQLite connection for the request.
4. A `PUT` is rejected with `413` when its `Content-Length` is above
   `NOTEKEEP_MAX_NOTE_BYTES`. Otherwise the body is written with an upsert on `title`:
   a new title inserts a row, an existing title replaces `body` and sets `updated`.
5. `GET /notes` returns the title and `updated` of every note, sorted by title.

The exact paths and answers are in the [HTTP API reference](../config/http-api.md).

## Settings are read once

The four environment variables are read when `notekeep.py` is loaded. A changed value takes
effect only after a restart. See
[Environment variables and settings](../config/environment.md).
