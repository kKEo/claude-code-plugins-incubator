# Configuration

pingboard is configured through environment variables. They are read once,
when the command starts. There is no configuration file.

## Environment variables

| Variable | Type | Default | Used by | Meaning |
| --- | --- | --- | --- | --- |
| `PINGBOARD_PORT` | integer | `8080` | `serve` | TCP port of the HTTP server |
| `PINGBOARD_BIND` | string | `127.0.0.1` | `serve` | Address the HTTP server listens on |
| `PINGBOARD_INTERVAL` | integer, at least 5 | `60` | `serve` | Seconds to sleep between two rounds of checks |
| `PINGBOARD_TIMEOUT` | number | `5` | `check`, `serve` | Seconds a target has to answer; fractions are allowed |
| `PINGBOARD_DATA` | path | `~/.pingboard/targets.json` | all commands | The targets file |
| `PINGBOARD_LOG_LEVEL` | string | `info` | `serve` | Log level: `debug`, `info`, `warning`, `error` or `critical`; case does not matter |

## Command-line override

| Option | Overrides |
| --- | --- |
| `pingboard serve --port <number>` | `PINGBOARD_PORT` |

No other setting has a command-line option.

## Notes on single settings

**`PINGBOARD_INTERVAL`** is the pause between rounds, not the period. One
cycle lasts the round plus the interval. See
[Architecture](architecture.md#the-check-loop).

**`PINGBOARD_TIMEOUT`** applies to each check separately. Because checks run
one after another, a round can last up to about the number of targets
multiplied by the timeout when many targets hang. Keep the timeout low when
the list is long.

**`PINGBOARD_DATA`** must point to the same file for the service and for the
command-line tool, otherwise `pingboard add` changes a list that the service
never reads. A leading `~` in the value is not expanded by pingboard; let the
shell expand it or use an absolute path. Missing parent folders are created on
the first write.

**`PINGBOARD_BIND`** set to `0.0.0.0` makes the service reachable from other
machines. Read [Security](security.md) first.

## Validation

Every command loads the whole configuration, so an invalid value stops every
command, including `pingboard list`.

| Problem | Result |
| --- | --- |
| `PINGBOARD_INTERVAL` below 5 | Message `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`, exit code 1 |
| `PINGBOARD_INTERVAL`, `PINGBOARD_PORT` or `PINGBOARD_TIMEOUT` is not a number | Python traceback ending in `ValueError`, exit code 1 |
| Unknown `PINGBOARD_LOG_LEVEL` | `pingboard serve` fails at start with a `ValueError` traceback; other commands ignore the value |

`PINGBOARD_TIMEOUT` and `PINGBOARD_PORT` have no range check.
