# The dashboard

`pingboard serve` checks all targets on a schedule and shows the latest results on a web page.

```
pingboard serve
```

Open <http://127.0.0.1:8080/>. Stop the dashboard with `Ctrl+C`.

## What the page shows

The page is a table with one row per target:

| Column | Meaning |
| --- | --- |
| URL | The target |
| State | `up` or `DOWN` |
| Time | How long the last check took, in milliseconds |

Keep in mind:

* The page does not refresh by itself. Reload it to see the latest results.
* Right after the start the table is empty or incomplete. Rows appear as the first round of checks proceeds.
* The page shows only the latest result of each target. pingboard keeps no history.
* The page does not show the HTTP status or the error. Use `pingboard check --json` or the address `/api/status` to see them.

## How often targets are checked

pingboard starts the first round of checks immediately, then waits 60 seconds after each round before it starts the next one. Change the wait with `PINGBOARD_INTERVAL`, in seconds:

```
PINGBOARD_INTERVAL=15 pingboard serve
```

The smallest allowed value is 5. A lower value stops pingboard with the message `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`.

## Use another port

```
pingboard serve --port 9000
```

You can also set `PINGBOARD_PORT`. The `--port` option wins when both are given.

## Open the dashboard from another machine

By default the dashboard answers only requests from the machine it runs on. To make it reachable from other machines, set `PINGBOARD_BIND`:

```
PINGBOARD_BIND=0.0.0.0 pingboard serve
```

> **Warning:** the dashboard has no login and no encryption. Anyone who can reach the port can see your targets and their state. Read the security page of the operator guide before you expose the dashboard on a network.

## Other addresses

Besides the page at `/`, the dashboard answers at three more addresses:

| Address | Content |
| --- | --- |
| `/api/status` | The latest results as JSON, with the same fields as `pingboard check --json` |
| `/healthz` | The text `ok`, to show that the dashboard is running |
| `/metrics` | Numbers for a monitoring system |

The operator guide describes `/healthz` and `/metrics` in detail.
