# Environment variables and settings

This page lists every setting pingboard reads. All settings are environment variables; there is no configuration file. The table is taken from `config.load()` in `pingboard/config.py`, the only place where the code reads the environment.

Settings are read once, at the start of every command. Restart `pingboard serve` to apply a change.

| Variable | Type | Default | Effect |
|---|---|---|---|
| `PINGBOARD_BIND` | address | `127.0.0.1` | Address the HTTP server listens on. Used by `serve`. |
| `PINGBOARD_DATA` | path | `~/.pingboard/targets.json` | The data file that holds the target list. Its directory is created on the first write. Used by every command. |
| `PINGBOARD_INTERVAL` | integer, seconds | `60` | Pause between two cycles of the check loop. Must be at least `5`. Used by `serve`. |
| `PINGBOARD_LOG_LEVEL` | level name | `info` | Lowest level that is logged. A Python logging level name in any case: `debug`, `info`, `warning`, `error`, `critical`. Used by `serve`. |
| `PINGBOARD_PORT` | integer | `8080` | Port the HTTP server listens on. `serve --port` overrides it. |
| `PINGBOARD_TIMEOUT` | number, seconds | `5` | Timeout of one check. Fractions are allowed. Used by `check` and `serve`. |

## Invalid values

Because every command loads all settings, a bad value stops every command, not only `serve`.

| Variable | Bad value | What happens |
|---|---|---|
| `PINGBOARD_INTERVAL` | below `5` | Exit status 1 with `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`. |
| `PINGBOARD_INTERVAL`, `PINGBOARD_PORT` | not an integer | A Python traceback that ends in `ValueError: invalid literal for int() with base 10`. |
| `PINGBOARD_TIMEOUT` | not a number | A Python traceback that ends in `ValueError: could not convert string to float`. |
| `PINGBOARD_LOG_LEVEL` | not a level name | `serve` stops with a traceback that ends in `ValueError: Unknown level`. Other commands do not use the value and run normally. |

`PINGBOARD_BIND`, `PINGBOARD_DATA` and `PINGBOARD_TIMEOUT` are not range-checked. A wrong address or a port that is taken shows up when `serve` starts; see [Troubleshooting](../operations/troubleshooting.md).

## Example

```bash
# Check every 30 seconds, give each target 2 seconds, keep the list in /var/lib/pingboard.
export PINGBOARD_INTERVAL=30
export PINGBOARD_TIMEOUT=2
export PINGBOARD_DATA=/var/lib/pingboard/targets.json
pingboard serve
```
