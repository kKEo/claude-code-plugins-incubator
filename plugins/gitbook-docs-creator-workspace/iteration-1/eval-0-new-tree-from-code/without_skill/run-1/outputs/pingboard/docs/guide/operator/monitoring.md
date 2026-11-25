# Monitoring

## Logs

pingboard logs to standard error in this format:

    2026-01-15 10:32:07,512 INFO listening on http://127.0.0.1:8080
    2026-01-15 10:33:08,031 WARNING target down url=https://example.org/missing status=404 error=HTTP Error 404: Not Found

| Level | Messages |
| --- | --- |
| `INFO` | `listening on http://<bind>:<port>`, once at start |
| `WARNING` | `target down url=... status=... error=...`, for every failed check in every round |
| `DEBUG` | One `http ...` line per request to the HTTP server |

A target that stays down produces one warning per round. A successful check
and a recovery are not logged. Only `pingboard serve` logs; the other commands
print their results to standard output and their errors to standard error.

If the check loop crashes, Python prints a traceback that starts with
`Exception in thread` to standard error. It does not pass through the logger,
so it has no timestamp or level.

## Metrics

Scrape `/metrics`; the metrics are described in
[HTTP endpoints](http-endpoints.md#get-metrics). A minimal Prometheus scrape
configuration:

    scrape_configs:
      - job_name: pingboard
        static_configs:
          - targets: ["127.0.0.1:8080"]

## Health

`/healthz` proves only that the HTTP server answers. Use it as a liveness
probe, and use `pingboard_checks_total` to prove that checks still run.

## Suggested alerts

| Alert | Expression | Why |
| --- | --- | --- |
| A target is down | `pingboard_target_up == 0` for a few minutes | The main purpose of the service |
| The check loop has stopped | `increase(pingboard_checks_total[15m]) == 0` | The loop can die while the HTTP server keeps answering; results then go stale silently |
| pingboard itself is down | `up{job="pingboard"} == 0` | The scrape failed |
| A target is slow | `pingboard_check_duration_ms > 2000` | Early warning before a timeout |

Choose the window of the second alert larger than the longest possible cycle:
the number of targets multiplied by the timeout, plus the interval. The alert
also fires when the list of targets is empty, because then no checks are made.

## Things the metrics do not show

- **Removed targets** keep their last `pingboard_target_up` and
  `pingboard_check_duration_ms` series until the process restarts. Restart the
  service after removing a target that was down, otherwise its alert keeps
  firing.
- **Age of a result.** There is no timestamp per target. Staleness is visible
  only through `pingboard_checks_total`.
- **History.** pingboard keeps only the latest result. Keep history in your
  metrics system.
