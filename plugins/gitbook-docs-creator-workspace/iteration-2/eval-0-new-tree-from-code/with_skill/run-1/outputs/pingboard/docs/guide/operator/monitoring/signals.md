# Metrics and logs

This page lists the signals `pingboard serve` gives about itself and about its targets: a health check, three metrics and a log. It ends with the conditions worth an alert.

## Health check

`GET /healthz` returns status 200 and the body `ok` as long as the HTTP server answers.

```bash
curl http://127.0.0.1:8080/healthz
# ok
```

> **Warning.** `/healthz` says nothing about the check loop. When the loop has stopped, `/healthz` still returns `ok`. Watch `pingboard_checks_total` as well.

## Metrics

`GET /metrics` returns plain text, one sample per line, without `# HELP` or `# TYPE` lines.

```bash
curl http://127.0.0.1:8080/metrics
# pingboard_checks_total 4
# pingboard_target_up{url="https://example.org"} 1
# pingboard_check_duration_ms{url="https://example.org"} 184
```

| Metric | Labels | Meaning |
|---|---|---|
| `pingboard_check_duration_ms` | `url` | How long the last check of the target took, in milliseconds. |
| `pingboard_checks_total` | none | Number of checks done since `serve` started. Starts at 0 after every restart. |
| `pingboard_target_up` | `url` | `1` when the last check of the target was up, `0` when it was down. |

A target has samples only after its first check, and keeps them after it is removed, until `serve` is restarted. The URL is written into the label as it is, without escaping.

## Log

`serve` writes its log to standard error. Each line has the time, the level and the message:

```text
2026-11-25 22:40:02,614 INFO listening on http://127.0.0.1:18931
2026-11-25 22:40:02,634 WARNING target down url=http://127.0.0.1:1/ status=0 error=<urlopen error [Errno 61] Connection refused>
```

| Level | Message | When |
|---|---|---|
| `DEBUG` | `http` followed by the request line and status | Every request the HTTP server answers. |
| `INFO` | `listening on http://<bind>:<port>` | Once, at start. |
| `WARNING` | `target down url=<url> status=<status> error=<error>` | Every check that finds a target down, so once per cycle while it stays down. |

`PINGBOARD_LOG_LEVEL` sets the lowest level that is written. With the default, `info`, requests are not logged. A check that finds a target up is not logged at any level.

An error that stops the check loop is not a log line: Python prints its traceback to standard error.

The other commands write no log. `check` reports through its output and its exit status.

## What deserves an alert

| Condition | What it means |
|---|---|
| `/healthz` does not answer | The process is gone or the port is unreachable. |
| `pingboard_checks_total` has not grown for longer than the interval plus the time a cycle takes | The check loop has stopped, or the list is empty. See [Troubleshooting runbook](../operations/troubleshooting.md). |
| `pingboard_target_up` is `0` | The target was down at its last check. |
