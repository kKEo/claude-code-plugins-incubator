# Install

This page shows how to put notekeep on a host, run it as a service, check that it works,
and later upgrade or remove it.

## Before you start

- `python3`. The project asks for Python 3.9 or newer; no file in the repository pins a
  version, and CI uses the `python3` of its runner image.
- Nothing else. `notekeep.py` imports only the standard library, so there is nothing to
  build and no package to install.

## Run it once by hand

1. Copy `notekeep.py` from <https://github.com/example/notekeep> to the host.
2. Start the server:

   ```bash
   python3 notekeep.py serve
   ```

   It prints `notekeep listening on :7070, database <path>` and keeps running.
3. From a second terminal, check it:

   ```bash
   curl http://localhost:7070/health
   ```

   The answer is `{"ok": true}`.

Without any setting, the database is `~/.notekeep/notes.db` of the user who started the
process. The directory is created on first use.

## Run it under systemd

This is the service section the project documents. It assumes the file is at
`/opt/notekeep/notekeep.py`; adjust the paths to your host.

```ini
[Service]
Environment=NOTEKEEP_DB=/var/lib/notekeep/notes.db
Environment=NOTEKEEP_TOKEN=change-me
ExecStart=/usr/bin/python3 /opt/notekeep/notekeep.py serve
```

- Replace `change-me` with a secret of your own. Without `NOTEKEEP_TOKEN`, anyone who can
  reach the port can read the list of notes and write notes.
- The service user must be able to create and write `/var/lib/notekeep/`.
- All settings are listed in
  [Environment variables and settings](../config/environment.md).

> **Warning.** The server listens on all interfaces (`0.0.0.0`) and speaks plain HTTP. Put
> it behind a reverse proxy that terminates TLS, and do not expose the port itself.

## Check the result

```bash
curl http://localhost:7070/health
curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
```

The first command prints `{"ok": true}`. The second prints `[]` on a new database.

## Upgrade

Replace `notekeep.py` and restart the service. The table is created with
`CREATE TABLE IF NOT EXISTS`, and there is no migration step. Take a
[backup](../operations/backup.md) first.

## Uninstall

Stop the service, then delete `notekeep.py`, the service unit and the database file.
notekeep writes nothing else.
