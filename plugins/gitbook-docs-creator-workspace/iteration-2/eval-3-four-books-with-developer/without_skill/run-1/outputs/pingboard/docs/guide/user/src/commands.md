# Command reference

```
pingboard <command> [options]
```

Run `pingboard --help` or `pingboard <command> --help` for the built-in help.

## Commands

### `pingboard add <url>`

Adds a URL to the target list. The URL must start with `http://` or `https://`. Adding a URL that is already in the list changes nothing.

### `pingboard remove <url>`

Removes a URL from the target list. Fails when the URL is not in the list.

### `pingboard list`

Prints the targets, one per line, in alphabetical order.

### `pingboard check [--json] [--fail-fast]`

Checks every target once and exits.

| Option | Effect |
| --- | --- |
| `--json` | Print the results as one JSON array instead of one text line per target |
| `--fail-fast` | Stop at the first target that is down |

Exit status `0` means every target is up; `1` means at least one target is down.

### `pingboard serve [--port PORT]`

Runs the dashboard and checks all targets on a schedule, until you stop it.

| Option | Effect |
| --- | --- |
| `--port PORT` | Listen on this port; overrides `PINGBOARD_PORT` |

## Settings

Settings are environment variables. pingboard reads them at the start of every command.

| Variable | Default | Meaning | Used by |
| --- | --- | --- | --- |
| `PINGBOARD_DATA` | `~/.pingboard/targets.json` | Path of the file with the target list | all commands |
| `PINGBOARD_TIMEOUT` | `5` | Seconds to wait for an answer from a target | `check`, `serve` |
| `PINGBOARD_INTERVAL` | `60` | Seconds to wait between two rounds of checks; at least 5 | `serve` |
| `PINGBOARD_PORT` | `8080` | Port of the dashboard | `serve` |
| `PINGBOARD_BIND` | `127.0.0.1` | Network address the dashboard listens on | `serve` |
| `PINGBOARD_LOG_LEVEL` | `info` | Amount of log output: `debug`, `info`, `warning` or `error` | `serve` |

> **Note:** every command validates all settings, also the ones it does not use. For example, `PINGBOARD_INTERVAL=2 pingboard list` fails although `list` does not use the interval.

## Exit status

| Exit status | Meaning |
| --- | --- |
| `0` | Success |
| `1` | A target is down (`check`), or the command failed with a `pingboard: ...` message |
| `2` | The command line is wrong, for example an unknown command or a missing URL |
