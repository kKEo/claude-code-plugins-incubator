# HTTP routes

This page lists every path that a running `pingboard serve` answers. It is taken from `Handler.do_GET` in `pingboard/server.py`.

The server answers GET requests only, without a login and without TLS, on the address and port set by `PINGBOARD_BIND` and `PINGBOARD_PORT`. Paths are matched exactly: a query string or a trailing slash makes a path unknown.

| Path | Status | Content type | Body |
|---|---|---|---|
| `/` | 200 | `text/html` | The dashboard: a table with one row per target, showing the URL, `up` or `DOWN`, and the duration of the last check. |
| `/api/status` | 200 | `application/json` | A JSON array with the latest result of each target. |
| `/healthz` | 200 | `text/plain` | `ok` |
| `/metrics` | 200 | `text/plain` | The metrics in text form; see [Metrics and logs](../monitoring/signals.md). |
| any other path | 404 | `text/plain` | `not found` |

A request with another method, such as POST, is answered with status 501.

## The dashboard

The page is plain HTML that is built at the moment of the request. It does not refresh itself; reload it to see newer results. It is empty until the first cycle has checked at least one target.

## /api/status

Each element has the fields of a check result: `url`, `up`, `status`, `millis` and `error`. [System overview](../intro/overview.md#one-check) defines them.

```bash
curl http://127.0.0.1:8080/api/status
```

```json
[{"url": "https://example.org", "up": true, "status": 200, "millis": 84, "error": ""}]
```

The array holds every target that was checked since the process started, including targets that were removed from the list since then.
