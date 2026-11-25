# HTTP routes

This page lists every route the HTTP server of `pingboard serve` answers. All of them answer GET requests only, need no authentication, and are built from the results held in memory.

| Route | Content type | Response |
|---|---|---|
| `/` | `text/html` | The dashboard: a table with one row per target, showing the URL, `up` or `DOWN`, and the time of the last check in milliseconds. |
| `/api/status` | `application/json` | An array with one object per target; see below. |
| `/healthz` | `text/plain` | Status 200 and the body `ok`. |
| `/metrics` | `text/plain` | The metrics as text; see [Metrics and logs](../monitoring/signals.md). |

Any other path returns status 404 and the body `not found`. A request with another method, such as POST, returns status 501.

## Fields of `/api/status`

```bash
curl http://127.0.0.1:8080/api/status
# [{"url": "https://example.org", "up": true, "status": 200, "millis": 184, "error": ""}]
```

| Field | Type | Meaning |
|---|---|---|
| `error` | string | The error text when the target is down, otherwise empty. |
| `millis` | integer | How long the last check took, in milliseconds. |
| `status` | integer | The HTTP status of the last check, or `0` when there was no response. |
| `up` | boolean | `true` when the last check returned a status below 400. |
| `url` | string | The target. |

`pingboard check --json` prints the same fields.

## What the routes do not show

- A target appears only after its first check. Right after a start the table and the array are empty.
- No route shows when a target was last checked, and no route shows history.
- The dashboard does not refresh itself. Reload the page to see newer results.
- A removed target stays in every route until `serve` is restarted.
