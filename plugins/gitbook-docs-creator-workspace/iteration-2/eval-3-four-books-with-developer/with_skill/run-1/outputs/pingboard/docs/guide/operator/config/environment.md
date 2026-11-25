# Environment variables and settings

This is the complete list of settings pingboard reads. All of them are environment variables read in `pingboard/config.py`; there is no configuration file.

Every command reads all settings when it starts, including `add`, `remove` and `list`. A value that cannot be parsed therefore stops every command, not only the one that uses the setting. A running `serve` process does not notice a changed variable; restart it.

| Variable | Type | Default | Used by | Effect |
|---|---|---|---|---|
| `PINGBOARD_BIND` | address | `127.0.0.1` | `serve` | Address the HTTP server listens on. |
| `PINGBOARD_DATA` | path | `~/.pingboard/targets.json` | all commands | Location of the targets file. The directory is created on the first `add`. |
| `PINGBOARD_INTERVAL` | integer, seconds | `60` | `serve` | Pause between two rounds of checks. Minimum `5`. |
| `PINGBOARD_LOG_LEVEL` | level name | `info` | `serve` | Lowest log level written: `debug`, `info`, `warning`, `error` or `critical`, in any letter case. |
| `PINGBOARD_PORT` | integer | `8080` | `serve` | Port the HTTP server listens on. `pingboard serve --port` overrides it. |
| `PINGBOARD_TIMEOUT` | number, seconds | `5` | `check`, `serve` | How long one check waits for a response before the target counts as down. Fractions are allowed. |

## Invalid values

Only `PINGBOARD_INTERVAL` has a checked limit. Other bad values end the command with a Python traceback.

| Value | What happens |
|---|---|
| `PINGBOARD_INTERVAL` below `5` | Every command exits with status 1 and `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` |
| `PINGBOARD_INTERVAL` or `PINGBOARD_PORT` not an integer | Every command ends with `ValueError: invalid literal for int() with base 10: …` |
| `PINGBOARD_TIMEOUT` not a number | Every command ends with a `ValueError` |
| `PINGBOARD_LOG_LEVEL` not a level name | `serve` ends with `ValueError: Unknown level: …`; other commands are not affected |

## Example

```bash
# Check every 30 seconds, give slow sites 10 seconds, keep the list in /srv.
export PINGBOARD_INTERVAL=30
export PINGBOARD_TIMEOUT=10
export PINGBOARD_DATA=/srv/pingboard/targets.json
pingboard serve
```
