# The dashboard

`pingboard serve` starts a small web server. In the background it checks every
target, waits, and checks again. The web page shows the latest result for each
target.

## Start and stop

    pingboard serve

pingboard prints the address it listens on, by default
`http://127.0.0.1:8080`. Open that address in a browser. Stop pingboard with
`Ctrl+C`.

## Reading the page

The page is a table with one row per target:

| Column | Meaning |
| --- | --- |
| Target | The URL |
| State | `up` or `DOWN` |
| Time | How long the last check took, in milliseconds |

Good to know:

- **The page does not refresh itself.** Reload it to see newer results.
- **The table is empty right after the start.** A row appears as soon as the
  first check of that target has finished.
- **Results are not saved.** After a restart the dashboard starts empty again;
  there is no history.
- **Removed targets stay visible** with their last result until you restart
  the dashboard. See [Managing targets](managing-targets.md).

## Common settings

Settings are environment variables that you set when you start pingboard.

| I want to... | Do this |
| --- | --- |
| Use another port | `pingboard serve --port 9000` |
| Check more or less often | `PINGBOARD_INTERVAL=30 pingboard serve` (seconds to wait between rounds, at least 5) |
| Give slow targets more time | `PINGBOARD_TIMEOUT=10 pingboard serve` (seconds) |
| Open the dashboard from another machine | `PINGBOARD_BIND=0.0.0.0 pingboard serve` |

The dashboard has no login. Anyone who can reach the address can see your
targets and their state, so think before you make it reachable from other
machines. The Operator guide lists every setting and explains how to run the
dashboard safely as a service.

## Getting the results as data

The same results are available as JSON at
<http://127.0.0.1:8080/api/status>. The fields are the same as in the
[JSON output of `pingboard check`](one-off-check.md#json-output).
