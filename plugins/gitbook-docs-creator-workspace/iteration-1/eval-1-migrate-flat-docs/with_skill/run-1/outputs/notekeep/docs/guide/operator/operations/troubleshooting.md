# Troubleshooting runbook

This page has one section per symptom, with the exact error text, the cause and the fix.
For backup, restore and removing notes, see [Backup and maintenance](backup.md).

## `{"error": "missing or wrong token"}`

- **Confirm.** The answer has status `401`, and the access log line ends in `401 -`.
- **Cause.** The server was started with `NOTEKEEP_TOKEN`, and the request has no
  `Authorization` header or a different value. The comparison is exact.
- **Fix.** Send the header:

  ```bash
  curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
  ```

- **Check.** The same request returns `200`.

## `{"error": "note larger than 65536 bytes"}`

- **Confirm.** The answer has status `413`.
- **Cause.** The request body is larger than `NOTEKEEP_MAX_NOTE_BYTES`.
- **Fix.** Split the note, or raise `NOTEKEEP_MAX_NOTE_BYTES` and restart.
- **Check.** The `PUT` returns `{"saved": "<title>"}`.

## `FileNotFoundError: [Errno 2] No such file or directory: ''`

- **Cause.** `NOTEKEEP_DB` is a bare file name such as `notes.db`. notekeep creates the
  directory of the database, and a bare name has none.
- **Fix.** Give a path with a directory, for example `./notes.db` or
  `/var/lib/notekeep/notes.db`.

## `ValueError: invalid literal for int() with base 10`

- **Cause.** `NOTEKEEP_PORT` or `NOTEKEEP_MAX_NOTE_BYTES` is not a whole number. Every
  command fails, not only `serve`.
- **Fix.** Correct or unset the variable.

## `OSError: … Address already in use`

- **Cause.** Another process, often a second notekeep, already listens on `NOTEKEEP_PORT`.
- **Fix.** Stop the other process, or choose another port and restart.

## `list` or `show` finds no notes, but the server has them

- **Confirm.** `GET /notes` returns notes, and `python3 notekeep.py list` prints nothing.
- **Cause.** The commands open the database file directly. They ran with another
  `NOTEKEEP_DB` than the server, or as another user, whose default is a different
  `~/.notekeep/notes.db`. A missing database is created empty, without a message.
- **Fix.** Run the command with the `NOTEKEEP_DB` of the service:

  ```bash
  NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py list
  ```

## `notekeep: no note called <title>`

- **Cause.** `show` found no note with exactly that title. Titles are stored as they were
  sent, so a title saved as `my%20note` is not found as `my note`.
- **Fix.** Copy the title from `python3 notekeep.py list`.

## `invalid choice: 'delete'`

- **Cause.** There is no `delete` command, and the API has no `DELETE`.
- **Fix.** See [Remove a note](backup.md#remove-a-note).

## A client gets an empty reply and the log shows `UnicodeDecodeError`

- **Cause.** The body of a `PUT` was not valid UTF-8. The note was not saved.
- **Fix.** Send the text as UTF-8. The server needs no restart.
