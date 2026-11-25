# Metrics and logs

This page lists every signal notekeep gives: one health check, one start line and an access
log. It emits no metrics and no traces.

## Health check

`GET /health` returns `200` and `{"ok": true}`. It needs no token and does not touch the
database, so it tells you that the process accepts connections, not that the database is
usable. To check the database too, request `GET /notes` with the token.

```bash
curl http://localhost:7070/health
```

## Start line

`serve` prints one line to standard output when it starts:

```text
notekeep listening on :7070, database /var/lib/notekeep/notes.db
```

When standard output is not a terminal, Python buffers this line, and it may not appear in a
log file or journal while the process runs.

## Access log

Each request writes one line to standard error, in the format of the Python standard
library server:

```text
127.0.0.1 - - [25/Nov/2026 21:46:26] "PUT /notes/shopping HTTP/1.1" 200 -
127.0.0.1 - - [25/Nov/2026 21:46:26] "GET /notes/shopping HTTP/1.1" 404 -
```

An unhandled error, such as a body that is not valid UTF-8, writes a Python traceback to
the same stream. Behind a reverse proxy the address is the address of the proxy.

## What deserves an alert

| Signal | Meaning |
|---|---|
| `GET /health` fails or times out | The process is down or stuck on a request |
| Lines that end in `401 -` | A client sends no token or a wrong one |
| Lines that end in `413 -` | A client sends notes above `NOTEKEEP_MAX_NOTE_BYTES` |
| `Traceback` in standard error | A request failed inside the handler |

The fixes are in the [Troubleshooting runbook](../operations/troubleshooting.md).
