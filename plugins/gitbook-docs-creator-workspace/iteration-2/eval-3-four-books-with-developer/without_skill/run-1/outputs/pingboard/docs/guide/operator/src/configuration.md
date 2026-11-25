# Configuration

pingboard is configured with environment variables only. There is no configuration file.

## Settings

| Variable | Type | Default | Meaning |
| --- | --- | --- | --- |
| `PINGBOARD_PORT` | integer | `8080` | TCP port of the HTTP server |
| `PINGBOARD_BIND` | address | `127.0.0.1` | Address the HTTP server listens on. `0.0.0.0` means all IPv4 interfaces |
| `PINGBOARD_INTERVAL` | integer, seconds | `60` | Pause between the end of one round of checks and the start of the next. Minimum 5 |
| `PINGBOARD_TIMEOUT` | number, seconds | `5` | Longest wait for an answer from one target. Fractions such as `2.5` are allowed |
| `PINGBOARD_DATA` | path | `~/.pingboard/targets.json` | File with the target list. See [The data file](data.md) |
| `PINGBOARD_LOG_LEVEL` | name | `info` | Lowest level that is logged: `debug`, `info`, `warning`, `error` or `critical`. Upper and lower case are both accepted |

The command line has one override: `pingboard serve --port <port>` wins over `PINGBOARD_PORT`.

## When settings are read

Settings are read once, when a command starts. To apply a change to a running service, restart it.

Every command reads and validates all settings, including the short-lived ones such as `pingboard add`. A wrong value in the environment therefore breaks every command, not only `serve`.

## Validation

pingboard validates little. Know what happens with wrong values:

| Wrong value | Result |
| --- | --- |
| `PINGBOARD_INTERVAL` below 5 | Clean exit with `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` |
| Non-numeric `PINGBOARD_PORT`, `PINGBOARD_INTERVAL` or `PINGBOARD_TIMEOUT` | Python traceback ending in `ValueError` |
| Unknown `PINGBOARD_LOG_LEVEL` | `serve` fails at start with `ValueError: Unknown level` |
| `PINGBOARD_PORT` in use or below 1024 without privileges | `serve` fails at start with `OSError` or `PermissionError` |
| `PINGBOARD_TIMEOUT` of zero or below | Not rejected. Checks fail or behave unpredictably; do not use |
| `--port 0` | Ignored; the value of `PINGBOARD_PORT` is used |

All of these failures happen at start, so a service manager shows them immediately. Check the service status after every configuration change.

## Choosing values

* **Interval and timeout.** The age of a result can reach `targets x timeout + interval`. See the capacity section of [Deployment](deployment.md).
* **Bind address.** Keep the default and use a reverse proxy unless the network is trusted. See [Security](security.md).
* **Log level.** `info` is right for production. `debug` adds one line per HTTP request to the server, including every scrape of `/metrics` and every health probe.

## Example

```
PINGBOARD_DATA=/var/lib/pingboard/targets.json
PINGBOARD_INTERVAL=30
PINGBOARD_TIMEOUT=3
PINGBOARD_LOG_LEVEL=warning
```

Under systemd, put these lines in a file and reference it with `EnvironmentFile=`, or write one `Environment=` line per setting.
