# Deployment

notekeep needs Python 3.9 or newer and nothing else.

Run it under systemd:

    [Service]
    Environment=NOTEKEEP_DB=/var/lib/notekeep/notes.db
    Environment=NOTEKEEP_TOKEN=change-me
    ExecStart=/usr/bin/python3 /opt/notekeep/notekeep.py serve

The server listens on all interfaces, so put it behind a reverse proxy that terminates TLS.
It listens on port 7070 unless `NOTEKEEP_PORT` is set; see [Configuration](configuration.md).

## Health

`GET /health` returns `{"ok": true}`. It never requires the token, so a load balancer can
probe it.
