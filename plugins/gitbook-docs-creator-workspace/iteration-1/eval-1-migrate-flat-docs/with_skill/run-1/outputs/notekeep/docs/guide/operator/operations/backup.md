# Backup and maintenance

This page covers the work that keeps the database safe and small: backup, restore, removing
a note and compacting the file. Everything notekeep stores is in the one file named by
`NOTEKEEP_DB`.

The examples use `/var/lib/notekeep/notes.db`. The `sqlite3` command line tool is separate
from notekeep and has to be installed on the host.

## Back up

While the service runs, let SQLite make a consistent copy:

```bash
sqlite3 /var/lib/notekeep/notes.db ".backup /var/backups/notekeep-copy.db"
```

Or stop the service and copy the database file with `cp`.

## Export a readable copy

`export` writes one Markdown file per note. It is a copy for people, not a backup that
notekeep can load again: there is no import command, and the `updated` times are not
exported.

```bash
NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py export ./backup
```

## Restore

1. Stop the service.
2. Copy the backup over the file named by `NOTEKEEP_DB`.
3. Start the service.
4. Check with `GET /notes` that the notes are back.

## Remove a note

notekeep has no delete command. Remove the row with `sqlite3`:

```bash
sqlite3 /var/lib/notekeep/notes.db "DELETE FROM notes WHERE title='shopping'"
```

## Compact the database

After removing many notes, give the freed space back to the file system:

```bash
NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py vacuum
```
