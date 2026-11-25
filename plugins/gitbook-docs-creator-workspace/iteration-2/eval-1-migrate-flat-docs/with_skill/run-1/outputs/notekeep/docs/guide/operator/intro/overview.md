# System overview

This page describes notekeep as it runs: one process, one database file, and how a request
moves between them.

notekeep is a single process started with `python3 notekeep.py serve`. It listens for HTTP
on one port and reads and writes one SQLite file. There is no cache, no background work and
no second service. The same script is also the command line tool, which opens the database
file directly and does not go through the server.

## The server process

- It listens on all IPv4 interfaces (`0.0.0.0`) on the port set by `NOTEKEEP_PORT`.
- It speaks plain HTTP. It has no TLS support, so put it behind a reverse proxy that
  terminates TLS.
- It handles one request at a time.
- It reads its settings once, when it starts. A changed setting needs a restart. See
  [Environment variables and settings](../config/environment.md).

## The database file

Every note is a row in one SQLite file, at the path set by `NOTEKEEP_DB`. The directory and
the table are created on first use. There is a single table, `notes`:

| Column | Meaning |
|---|---|
| `id` | Row id. |
| `title` | Unique title, taken from the last part of the request path. |
| `body` | The note text. |
| `updated` | Time of the last save, in UTC, as `YYYY-MM-DD HH:MM:SS`. |

The file is the whole state of the system. Backing it up backs up everything; see
[Backup and restore](../operations/backup.md).

## How a request is handled

1. `GET /health` is answered at once with `{"ok": true}`. It never needs a token, so that a
   load balancer can probe it.
2. For every other request, when `NOTEKEEP_TOKEN` is set, the `Authorization` header must be
   exactly `Bearer <token>`. Otherwise the answer is `401`.
3. A `PUT` whose `Content-Length` is larger than `NOTEKEEP_MAX_NOTE_BYTES` is refused with
   `413` before the body is read.
4. The request opens its own SQLite connection. A save is an upsert on `title`: a new title
   adds a row, an existing title has its `body` replaced and its `updated` time reset.

The full list of endpoints and answers is in the [HTTP API](../config/api.md) reference.

## The command line tool

`list`, `show`, `export` and `vacuum` open the database file named by `NOTEKEEP_DB` in the
environment of the person who runs them. They do not contact the server and do not use the
token. Run them on the machine that holds the file, with the same `NOTEKEEP_DB` value as the
server. See [Commands and flags](../config/commands.md).
