# Backup and maintenance

## Backup

Stop the service and copy the database file, or run `sqlite3 notes.db ".backup copy.db"`
while it runs.

`python3 notekeep.py export <dir>` writes every note to `<dir>/<title>.md`. That is a
readable copy, not a backup: it does not keep the timestamps.

## Removing a note

notekeep has no delete command and no delete endpoint. Remove a note with SQLite:

    sqlite3 notes.db "DELETE FROM notes WHERE title = 'shopping'"

## Compacting the database

`python3 notekeep.py vacuum` compacts the file after many deletions.

Run these commands with the same `NOTEKEEP_DB` as the server, or they act on a different
file.
