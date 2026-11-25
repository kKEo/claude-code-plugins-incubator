# HTTP endpoints

`pingboard serve` answers `GET` requests on four paths. Paths are matched
exactly: a query string or a trailing slash gives 404. Other methods are not
implemented and are answered with 501. No endpoint needs authentication.

| Path | Content type | Purpose |
| --- | --- | --- |
| `/` | `text/html` | The dashboard |
| `/api/status` | `application/json` | Latest results as JSON |
| `/metrics` | `text/plain` | Metrics in the Prometheus text format |
| `/healthz` | `text/plain` | Liveness probe |
| anything else | `text/plain` | `404`, body `not found` |

## `GET /`

A heading and a table with one row per result: target, `up` or `DOWN`, and the
duration of the last check. The page has no automatic refresh.

## `GET /api/status`

A JSON array with the latest result of every target that has been checked
since the process started:

    [
      {"url": "https://example.com", "up": true, "status": 200, "millis": 142, "error": ""},
      {"url": "https://example.org/missing", "up": false, "status": 404, "millis": 87, "error": "HTTP Error 404: Not Found"}
    ]

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The target |
| `up` | boolean | `true` when the final status was below 400 |
| `status` | number | HTTP status code, `0` when no HTTP response arrived |
| `millis` | number | Duration of the check in milliseconds |
| `error` | string | Exception text for a failed check, otherwise empty |

The array is empty until the first check has finished. A result carries no
timestamp, so the response alone does not show how old a result is.

## `GET /metrics`

    pingboard_checks_total 42
    pingboard_target_up{url="https://example.com"} 1
    pingboard_target_up{url="https://example.org/missing"} 0
    pingboard_check_duration_ms{url="https://example.com"} 142
    pingboard_check_duration_ms{url="https://example.org/missing"} 87

| Metric | Labels | Meaning |
| --- | --- | --- |
| `pingboard_checks_total` | none | Number of checks performed since the process started |
| `pingboard_target_up` | `url` | `1` when the last check of the target succeeded, otherwise `0` |
| `pingboard_check_duration_ms` | `url` | Duration of the last check of the target in milliseconds |

The output has no `# HELP` or `# TYPE` lines, so Prometheus treats the metrics
as untyped. Label values are not escaped; see [Security](security.md).

## `GET /healthz`

Always answers `200` with the body `ok` while the HTTP server runs. It does
**not** tell you whether the check loop is still working. See
[Monitoring](monitoring.md).
