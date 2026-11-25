# Monitoring and logs

pingboard watches your targets. This page is about watching pingboard.

## What can go wrong

| Failure | `/healthz` | How to detect it |
| --- | --- | --- |
| The process is gone | no answer | Health probe, service manager |
| The check loop has stopped | still `ok` | `pingboard_checks_total` no longer grows |
| The host has lost its network | still `ok` | All targets go down at once |
| A target is down | still `ok` | `pingboard_target_up` is 0, warning in the log |

The second row is the important one. The check loop runs in a background thread. If that thread stops, which happens when the data file becomes unreadable or invalid, the HTTP server continues and serves the last results for ever. A health probe on `/healthz` alone does not notice.

## Health probe

Use `/healthz` as the liveness probe of a load balancer, container platform or uptime service:

```
curl -fsS http://127.0.0.1:8080/healthz
```

## Prometheus

Scrape configuration:

```yaml
scrape_configs:
  - job_name: pingboard
    static_configs:
      - targets: ["127.0.0.1:8080"]
```

Alert rules that cover the failures above:

```yaml
groups:
  - name: pingboard
    rules:
      - alert: PingboardDown
        expr: up{job="pingboard"} == 0
        for: 2m

      - alert: PingboardLoopStalled
        expr: increase(pingboard_checks_total[15m]) == 0
        for: 5m

      - alert: PingboardTargetDown
        expr: pingboard_target_up == 0
        for: 5m
```

Adapt the windows to your settings:

* The window of `PingboardLoopStalled` must be longer than the longest possible gap between two checks, `targets x PINGBOARD_TIMEOUT + PINGBOARD_INTERVAL`.
* `PingboardLoopStalled` also fires when the target list is empty, because then no checks are done. Keep at least one target in the list.
* The `for` of `PingboardTargetDown` should span at least two rounds, so that one failed request does not page anyone.

Without Prometheus, read `pingboard_checks_total` from `/metrics` twice, some minutes apart, and compare the values.

## Logs

pingboard writes its log to standard error. Under systemd, read it with `journalctl -u pingboard`. The format is:

```
<date> <time>,<milliseconds> <LEVEL> <message>
```

| Level | Message | Meaning |
| --- | --- | --- |
| `INFO` | `listening on http://127.0.0.1:8080` | The service has started. Logged once |
| `WARNING` | `target down url=<url> status=<status> error=<text>` | A check failed. Logged at every round for as long as the target is down |
| `DEBUG` | `http ...` | One request to the HTTP server. Only with `PINGBOARD_LOG_LEVEL=debug` |

Example:

```
2026-11-25 10:00:00,123 INFO listening on http://127.0.0.1:8080
2026-11-25 10:00:05,131 WARNING target down url=https://unreachable.example status=0 error=<urlopen error timed out>
```

A target that comes back up is not logged. Successful checks are not logged either.

A crash of the check loop appears as a Python traceback that starts with `Exception in thread`. It is not prefixed with a level, so search for the word `Traceback` when you set up log alerts.

Log volume is one line per down target per round. With many unstable targets and a short interval, set `PINGBOARD_LOG_LEVEL=error` and rely on the metrics instead.
