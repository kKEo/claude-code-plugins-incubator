# Backup and restore

This page shows how to back up the notes, restore them and compact the database. All notes
are in the one file named by `NOTEKEEP_DB`, so a copy of that file is a complete backup.

The examples use `/var/lib/notekeep/notes.db`. Replace it with your `NOTEKEEP_DB` value.

## Back up while the server runs

Use the `sqlite3` command line tool, which takes a consistent copy of a database that is in
use:

```bash
sqlite3 /var/lib/notekeep/notes.db ".backup /var/backups/notes-copy.db"
```

## Back up with the server stopped

Stop the service, copy the file, start the service:

```bash
cp /var/lib/notekeep/notes.db /var/backups/notes-copy.db
```

## Restore

1. Stop the service.
2. Copy the backup over the file named by `NOTEKEEP_DB`.
3. Start the service and check that the notes are there:

   ```bash
   NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py list
   ```

## Export the notes as files

`export` writes every note to a directory as `<title>.md`. It is a readable copy, not a
backup you can restore from: notekeep has no import command.

```bash
NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py export ./notes-export
```

## Compact the database

`vacuum` rewrites the file so that it gives back space it no longer uses:

```bash
NOTEKEEP_DB=/var/lib/notekeep/notes.db python3 notekeep.py vacuum
```
