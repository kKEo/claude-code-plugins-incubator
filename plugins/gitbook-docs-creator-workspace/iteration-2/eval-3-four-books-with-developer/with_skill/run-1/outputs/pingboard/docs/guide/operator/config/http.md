# HTTP endpoints

This is every path the `pingboard serve` process answers, taken from `pingboard/server.py`.

Only `GET` is implemented. A path has to match exactly: a query string or a trailing slash gives `404`. Responses carry no caching headers and there is no authentication.

| Path | Content type | Body |
|---|---|---|
| `/` | `text/html` | The dashboard: one table row per target with the URL, `up` or `DOWN`, and the time of the last check in milliseconds |
| `/api/status` | `application/json` | An array with the latest result of each target |
| `/healthz` | `text/plain` | `ok` |
| `/metrics` | `text/plain` | The metrics, one sample per line |
| anything else | `text/plain` | `not found`, with status `404` |

## /api/status

```bash
curl http://127.0.0.1:8080/api/status
```

```json
[{"url": "https://example.org", "up": true, "status": 200, "millis": 72, "error": ""}, {"url": "https://example.org/missing-page-404", "up": false, "status": 404, "millis": 54, "error": "HTTP Error 404: Not Found"}]
```

The fields are described in the [System overview](../intro/overview.md). The array is empty until the first check has finished. The order is the order in which targets were first checked.

## The dashboard

The page at `/` is static HTML built from the results at the moment of the request. It does not reload itself; reload it in the browser to see newer results.

## /healthz and /metrics

Both are described in [Metrics and logs](../monitoring/signals.md).
