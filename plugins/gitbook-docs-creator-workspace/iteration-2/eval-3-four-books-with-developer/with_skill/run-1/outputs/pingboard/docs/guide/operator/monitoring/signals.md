# Metrics and logs

This chapter lists the signals pingboard emits (a health check, metrics and logs), their formats, and which of them deserve an alert.

All three come from the `pingboard serve` process. The short commands emit nothing except their output and exit status.

## Health check

```bash
curl http://127.0.0.1:8080/healthz
```

`/healthz` answers `200` with the body `ok` whenever the HTTP server can answer. It does not look at the checker thread or at the targets file, so it proves that the process is running, not that checks are being made. Use the `pingboard_checks_total` metric for that.

## Metrics

`/metrics` returns plain text with one sample per line, in a form Prometheus can scrape. There are no `HELP` or `TYPE` lines.

```text
pingboard_checks_total 2
pingboard_target_up{url="https://example.org"} 1
pingboard_target_up{url="https://example.org/missing-page-404"} 0
pingboard_check_duration_ms{url="https://example.org"} 72
pingboard_check_duration_ms{url="https://example.org/missing-page-404"} 54
```

| Metric | Labels | Meaning |
|---|---|---|
| `pingboard_check_duration_ms` | `url` | Duration of the latest check of this target, in milliseconds |
| `pingboard_checks_total` | none | Number of checks made since the process started; resets to 0 on restart |
| `pingboard_target_up` | `url` | `1` when the latest check of this target was up, `0` when it was down |

Notes for reading them:

- The per-target metrics appear after the first check of that target.
- A target removed from the list keeps its last samples until the process restarts.
- The `url` label is the target text as stored, without escaping.
- There is no metric for the time of the last check.

## Logs

Logs go to standard error, one line per event, in the format `time LEVEL message`. `PINGBOARD_LOG_LEVEL` sets the lowest level written; the default is `info`.

| Level | Message | When |
|---|---|---|
| `INFO` | `listening on http://<bind>:<port>` | Once, at start |
| `WARNING` | `target down url=<url> status=<status> error=<error>` | Every time a check finds a target down, so once per round while it stays down |
| `DEBUG` | `http …` | Every HTTP request the server answers |

```text
2026-11-25 22:41:17,284 INFO listening on http://127.0.0.1:18431
2026-11-25 22:41:17,412 WARNING target down url=https://example.org/missing-page-404 status=404 error=HTTP Error 404: Not Found
```

A Python traceback on standard error that starts with `Exception in thread` means the checker thread has ended; see the [Troubleshooting runbook](../operations/troubleshooting.md).

## What to alert on

| Condition | Meaning | Where to look |
|---|---|---|
| `pingboard_target_up` is `0` | A target is down | The `error` field in `/api/status` or the `target down` log line |
| `pingboard_checks_total` has not grown for longer than one round | The checker thread has stopped, or the list is empty | [Results stop changing](../operations/troubleshooting.md#results-stop-changing) |
| `/healthz` does not answer | The process is not running or not reachable | The supervisor and standard error |

One round lasts the interval plus the time of all checks; the [System overview](../intro/overview.md) gives the formula.
