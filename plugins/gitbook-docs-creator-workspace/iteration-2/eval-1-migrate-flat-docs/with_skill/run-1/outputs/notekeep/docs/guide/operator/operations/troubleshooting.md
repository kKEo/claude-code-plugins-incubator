# Troubleshooting runbook

This page has one section per symptom: how to confirm it, the cause, the fix and how to
check that the fix worked. The error texts are quoted exactly, so that a search finds them.

## A client gets "missing or wrong token"

**Confirm.** The answer has status `401` and the body `{"error": "missing or wrong token"}`.
The request log shows `401` for the request.

**Cause.** The server was started with `NOTEKEEP_TOKEN`, and the request has no
`Authorization` header or one that is not exactly `Bearer <token>`.

**Fix.** Send the header:

```bash
curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
```

**Check.** The same request answers `200`.

## A client gets "note larger than 65536 bytes"

**Confirm.** The answer has status `413`. The number in the message is the current limit.

**Cause.** The note is larger than `NOTEKEEP_MAX_NOTE_BYTES`.

**Fix.** Send a smaller note, or raise `NOTEKEEP_MAX_NOTE_BYTES` and restart the server.

**Check.** The same `PUT` answers `200` and `{"saved": "<title>"}`.

## The server stops at start with "Address already in use"

**Confirm.** `python3 notekeep.py serve` prints the start line and then ends with
`OSError: … Address already in use`.

**Cause.** Another process, often a second notekeep, already listens on the port.

**Fix.** Stop the other process, or set `NOTEKEEP_PORT` to a free port.

**Check.** `curl http://localhost:<port>/health` answers `{"ok": true}`.

## A command stops with "FileNotFoundError: [Errno 2] No such file or directory: ''"

**Cause.** `NOTEKEEP_DB` is a bare file name such as `notes.db`. notekeep creates the
directory of the database, and a bare file name has none.

**Fix.** Give a path with a directory, for example `NOTEKEEP_DB=./notes.db` or an absolute
path.

**Check.** `python3 notekeep.py list` runs without an error.

## A command stops with "ValueError: invalid literal for int()"

**Cause.** `NOTEKEEP_PORT` or `NOTEKEEP_MAX_NOTE_BYTES` is not a whole number.

**Fix.** Correct the value. See [Environment variables and settings](../config/environment.md).

## "list" prints nothing, or "show" says "notekeep: no note called …", but the notes exist

**Confirm.** `curl http://localhost:7070/notes` lists the notes, while
`python3 notekeep.py list` on the same machine prints nothing.

**Cause.** The command reads the database named by `NOTEKEEP_DB` in your own shell. When the
variable is set only in the service unit, your shell uses the default,
`~/.notekeep/notes.db`, which is a different and empty file.

**Fix.** Run the command with the server's value:

```bash
NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py list
```

**Check.** The titles are printed.

## A client cannot connect on port 9000

**Cause.** Earlier documentation gave `9000` as the default port. The default in the code
is `7070`.

**Fix.** Use port `7070`, or the value of `NOTEKEEP_PORT`. The start line of the server
shows the port in use.
