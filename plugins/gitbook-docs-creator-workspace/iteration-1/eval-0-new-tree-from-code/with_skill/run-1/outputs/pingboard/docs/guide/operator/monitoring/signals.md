# Metrics and logs

This page lists the signals a running `pingboard serve` gives: three metrics, three kinds of log line and one health check. They are taken from `pingboard/server.py`. The one-shot commands log nothing; they report through their output and exit status.

## Metrics

`GET /metrics` returns the metrics as plain text, one sample per line, in the form `name{label="value"} number`. There are no `# HELP` or `# TYPE` lines.

| Metric | Labels | Meaning |
|---|---|---|
| `pingboard_check_duration_ms` | `url` | Duration of the latest check of this target, in milliseconds. |
| `pingboard_checks_total` | none | Number of checks made since the process started. Starts at 0 after every restart. |
| `pingboard_target_up` | `url` | `1` when the latest check of this target passed, `0` when it failed. |

```text
pingboard_checks_total 3
pingboard_target_up{url="https://example.org"} 1
pingboard_check_duration_ms{url="https://example.org"} 84
```

A target appears after its first check. A target that was removed from the list keeps its last values until the process is restarted.

## Logs

`serve` writes its log to standard error, one line per event, in the format `%(asctime)s %(levelname)s %(message)s`. `PINGBOARD_LOG_LEVEL` sets the lowest level that is written.

| Level | Message | When |
|---|---|---|
| `INFO` | `listening on http://<bind>:<port>` | Once, at start. |
| `WARNING` | `target down url=<url> status=<status> error=<error>` | In every cycle, for every target that is down. |
| `DEBUG` | `http <request line and status>` | For every HTTP request the server answers. |

```text
2026-11-25 21:47:09,819 INFO listening on http://127.0.0.1:8080
2026-11-25 21:47:09,835 WARNING target down url=http://127.0.0.1:1/ status=0 error=<urlopen error [Errno 61] Connection refused>
```

There is no log line for a passed check and none when a target comes back up. An error that ends the check loop is not logged through the logger; Python prints a traceback that starts with `Exception in thread` to standard error.

## Health check

`GET /healthz` answers `200` with `ok` as long as the HTTP server answers. It does not look at the check loop or at the targets, so it stays `ok` when the loop has stopped.

## What to alert on

| Condition | What it means | Signal |
|---|---|---|
| A target is down | The thing pingboard exists to tell you. | `pingboard_target_up` is `0`, or a `target down` log line. |
| The check loop has stopped | Results are stale although the dashboard still answers. | `pingboard_checks_total` no longer increases while the list has targets. |
| The process is gone | Nothing is checked or shown. | `/healthz` does not answer. |
| A target is slow | It is up but close to the timeout. | `pingboard_check_duration_ms` close to `PINGBOARD_TIMEOUT` times 1000. |

pingboard sends no notifications itself. Alerts come from whatever reads these metrics or logs.

> **Note.** With an empty target list `pingboard_checks_total` does not increase either. Pair the second alert with a check that the list is not empty.
