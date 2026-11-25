# HTTP endpoints

The server answers GET requests on four paths. Paths are matched exactly: a query string or a trailing slash, as in `/healthz?x=1` or `/metrics/`, gives 404. Methods other than GET give 501.

| Path | Content type | Purpose |
| --- | --- | --- |
| `/` | `text/html` | Dashboard for people |
| `/api/status` | `application/json` | Latest results for scripts |
| `/healthz` | `text/plain` | Liveness of the HTTP server |
| `/metrics` | `text/plain` | Metrics in the Prometheus text format |

All four answer from memory and return quickly, whatever the state of the targets.

## `/`

An HTML table with one row per result: URL, `up` or `DOWN`, and the response time. The page has no automatic refresh.

## `/api/status`

```
curl -s http://127.0.0.1:8080/api/status
```

```json
[{"url": "https://example.org", "up": true, "status": 200, "millis": 142, "error": ""},
 {"url": "https://unreachable.example", "up": false, "status": 0, "millis": 5003, "error": "<urlopen error timed out>"}]
```

A JSON array with one object per target that has been checked since the start.

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The target |
| `up` | boolean | `true` when the last check got a status below 400 within the timeout |
| `status` | number | HTTP status of the last check, after redirects. `0` means no HTTP answer: DNS failure, refused connection, TLS failure or timeout |
| `millis` | number | Duration of the last check in milliseconds |
| `error` | string | Error text of a failed check; empty when the target is up |

The array is empty until the first check after the start has finished. The response carries no timestamp, so a client cannot see the age of a result.

## `/healthz`

Returns status 200 and the body `ok`. It proves that the process runs and that the HTTP server accepts connections. It says nothing about the check loop or the targets. See [Monitoring and logs](monitoring.md).

## `/metrics`

```
pingboard_checks_total 42
pingboard_target_up{url="https://example.org"} 1
pingboard_target_up{url="https://unreachable.example"} 0
pingboard_check_duration_ms{url="https://example.org"} 142
pingboard_check_duration_ms{url="https://unreachable.example"} 5003
```

| Metric | Labels | Meaning |
| --- | --- | --- |
| `pingboard_checks_total` | none | Number of checks done since the start; a counter that resets at a restart |
| `pingboard_target_up` | `url` | `1` when the last check of the target succeeded, otherwise `0` |
| `pingboard_check_duration_ms` | `url` | Duration of the last check of the target in milliseconds |

The output has no `# HELP` and `# TYPE` lines, so Prometheus treats the metrics as untyped. The per-target metrics appear after the first check of that target.

## Results of removed targets

In all three data endpoints, the last result of a removed target stays until the process restarts. In `/metrics` this means that `pingboard_target_up` of a removed target keeps its last value. Restart the service after you remove a target that was down, or an alert on that target will never clear.
