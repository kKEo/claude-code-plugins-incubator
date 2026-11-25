# Metrics and logs

This page lists the signals notekeep gives: a health check and a request log. It has no
metrics and no traces.

| Signal | Where | Format |
|---|---|---|
| Health check | `GET /health` | `200` and `{"ok": true}`. Never needs a token. |
| Start line | standard output, once | `notekeep listening on :<port>, database <path>` |
| Request log | standard error, one line per request | `127.0.0.1 - - [25/Nov/2026 22:40:01] "PUT /notes/shopping HTTP/1.1" 200 -` |

Under systemd both streams go to the journal.

## What the health check tells you

`GET /health` answers without opening the database. A `200` means the process is running
and accepting connections; it does not prove that the database file can be read or written.
To check the database as well, list the notes:

```bash
curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
```

## What to alert on

- `GET /health` does not answer `200`: the process is down or not reachable.
- Request log lines with status `401`: a client has a missing or wrong token.
- Request log lines with status `413`: a client sends notes larger than
  `NOTEKEEP_MAX_NOTE_BYTES`.
- A Python traceback on standard error: a request failed inside the server. Start with the
  [Troubleshooting runbook](../operations/troubleshooting.md).
