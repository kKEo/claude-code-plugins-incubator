# Deploying

Run it under systemd:

    [Service]
    Environment=NOTEKEEP_DB=/var/lib/notekeep/notes.db
    Environment=NOTEKEEP_TOKEN=change-me
    ExecStart=/usr/bin/python3 /opt/notekeep/notekeep.py serve

The server listens on all interfaces, so put it behind a reverse proxy that terminates TLS.

## Backup

Stop the service and copy the database file, or run `sqlite3 notes.db ".backup copy.db"`
while it runs. `python3 notekeep.py vacuum` compacts the file after many deletions.

## Health

`GET /health` returns `{"ok": true}`.
