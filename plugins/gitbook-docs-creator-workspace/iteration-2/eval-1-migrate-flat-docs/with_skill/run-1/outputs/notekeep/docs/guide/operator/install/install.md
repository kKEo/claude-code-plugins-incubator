# Install

This page shows how to run notekeep by hand, how to run it under systemd, and how to upgrade
and remove it.

notekeep has no package and no installer: it is the single file `notekeep.py`. Installing it
means copying that file to the machine.

## Before you start

- Python 3.9 or newer. This is the minimum the project states; the script itself does not
  check the version.
- Nothing else. The script uses only the Python standard library.

## Run it by hand

1. Copy `notekeep.py` to the machine, for example to `/opt/notekeep/`.
2. Start the server:

   ```bash
   python3 notekeep.py serve
   ```

   It prints one line and keeps running:

   ```text
   notekeep listening on :7070, database /home/you/.notekeep/notes.db
   ```

3. Verify it from a second terminal:

   ```bash
   curl http://localhost:7070/health
   ```

   The answer is `{"ok": true}`.

## Run it under systemd

Set the settings as environment variables in the unit and start the same command. The
`[Service]` section looks like this:

```ini
[Service]
Environment=NOTEKEEP_DB=/var/lib/notekeep/notes.db
Environment=NOTEKEEP_TOKEN=change-me
ExecStart=/usr/bin/python3 /opt/notekeep/notekeep.py serve
```

Replace `change-me` with a secret of your own. The service user must be able to write to the
directory of `NOTEKEEP_DB`; notekeep creates the directory when it is missing.

> **Warning.** The server listens on all interfaces and speaks plain HTTP. Put it behind a
> reverse proxy that terminates TLS, and set `NOTEKEEP_TOKEN`, before other machines can
> reach it. Without a token, anyone who can reach the port can read the list of notes and
> overwrite them.

Verify with the health check, as above. Point your load balancer or proxy at `GET /health`;
see [Metrics and logs](../monitoring/signals.md).

## Upgrade

1. Back up the database. See [Backup and restore](../operations/backup.md).
2. Stop the service, replace `notekeep.py` with the new file, start the service.
3. Check `GET /health`.

The table is created only when it does not exist, and the code contains no migration step.

## Uninstall

Stop the service, remove the unit and `notekeep.py`. The notes stay in the database file
until you delete it; by default that is `~/.notekeep/notes.db` of the user that ran the
server.
