# Environment variables and settings

This page lists every setting pingboard reads. All of them are environment variables; there is no configuration file.

The settings are read once, when a command starts, in `pingboard/config.py`. Every subcommand reads all of them, so a bad value stops `add` or `list` as well as `serve`. A change takes effect the next time the command starts.

| Variable | Type | Default | Effect |
|---|---|---|---|
| `PINGBOARD_BIND` | address | `127.0.0.1` | Address the HTTP server of `serve` listens on. The default accepts connections from the same machine only. |
| `PINGBOARD_DATA` | path | `~/.pingboard/targets.json` | The targets file. `add` creates it, and its directory, when missing. |
| `PINGBOARD_INTERVAL` | integer, seconds | `60` | How long the check loop of `serve` sleeps between two cycles. Minimum `5`. |
| `PINGBOARD_LOG_LEVEL` | level name | `info` | Lowest level `serve` logs. Any case. Python level names: `debug`, `info`, `warning`, `error`, `critical`. |
| `PINGBOARD_PORT` | integer | `8080` | Port the HTTP server of `serve` listens on. `serve --port` overrides it. |
| `PINGBOARD_TIMEOUT` | number, seconds | `5` | Timeout of one check. Used by `check` and `serve`. Fractions are allowed. |

## Invalid values

| Value | Result |
|---|---|
| `PINGBOARD_INTERVAL` below `5` | Every command exits with status 1 and `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`. |
| A non-numeric `PINGBOARD_INTERVAL`, `PINGBOARD_PORT` or `PINGBOARD_TIMEOUT` | Every command ends with a Python traceback whose last line starts with `ValueError`. |
| An unknown `PINGBOARD_LOG_LEVEL` | `serve` ends with a traceback whose last line is `ValueError: Unknown level:` followed by the value. Other commands do not use the setting. |

`PINGBOARD_PORT`, `PINGBOARD_TIMEOUT` and `PINGBOARD_BIND` are not checked for range or form beyond their type.

## Example

```bash
# Check every 30 seconds, give each target 2 seconds, keep the list in /srv/pingboard.
PINGBOARD_INTERVAL=30 PINGBOARD_TIMEOUT=2 PINGBOARD_DATA=/srv/pingboard/targets.json pingboard serve
```

> **Note.** `add`, `remove`, `list` and `check` must run with the same `PINGBOARD_DATA` as `serve`, or they work on a different list.
