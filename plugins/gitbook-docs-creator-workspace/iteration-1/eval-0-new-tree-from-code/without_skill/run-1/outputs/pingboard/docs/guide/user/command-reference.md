# Command reference

    pingboard <command> [options]

| Command | What it does |
| --- | --- |
| `pingboard add <url>` | Adds a URL to the list. The URL must start with `http://` or `https://` |
| `pingboard remove <url>` | Removes a URL from the list. Fails when the URL is not in the list |
| `pingboard list` | Prints the URLs, one per line |
| `pingboard check` | Checks every URL once and exits |
| `pingboard serve` | Runs the dashboard and checks on a schedule |

Run `pingboard --help` or `pingboard <command> --help` to see the built-in
help.

## Options

| Command | Option | Meaning |
| --- | --- | --- |
| `check` | `--json` | Print the results as one JSON array |
| `check` | `--fail-fast` | Stop at the first URL that is down |
| `serve` | `--port <number>` | Listen on this port instead of the configured one |

## Exit codes

| Command | Exit code | Meaning |
| --- | --- | --- |
| any | `0` | Success |
| `add` | `1` | The URL does not start with `http://` or `https://` |
| `remove` | `1` | The URL is not in the list |
| `check` | `1` | At least one target is down |
| any | `1` | `PINGBOARD_INTERVAL` is below 5 |
| any | `2` | Unknown command or option, or a missing argument |

## Environment variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `PINGBOARD_DATA` | `~/.pingboard/targets.json` | File that holds the list of targets |
| `PINGBOARD_TIMEOUT` | `5` | Seconds a target has to answer |
| `PINGBOARD_INTERVAL` | `60` | Seconds the dashboard waits between two rounds of checks; at least 5 |
| `PINGBOARD_PORT` | `8080` | Port of the dashboard |
| `PINGBOARD_BIND` | `127.0.0.1` | Address the dashboard listens on |
| `PINGBOARD_LOG_LEVEL` | `info` | How much the dashboard logs |

The Operator guide describes each variable in detail.
