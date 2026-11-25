# Commands and flags

This page lists every subcommand and flag of the `pingboard` command, taken from its argument parser in `pingboard/cli.py`.

A subcommand is required. Every subcommand, and `pingboard` itself, also accepts `-h` or `--help`.

| Command | Argument or flag | Purpose |
|---|---|---|
| `add` | `url` | Add a URL to the list of targets. |
| `check` | | Check every target once, print the results and exit. |
| `check` | `--fail-fast` | Stop at the first target that is down. |
| `check` | `--json` | Print the results as one JSON array in place of the text lines. |
| `list` | | Print the targets, one per line. |
| `remove` | `url` | Remove a URL from the list of targets. |
| `serve` | | Run the check loop and the HTTP server until stopped. |
| `serve` | `--port` with a port number | Listen on that port in place of `PINGBOARD_PORT`. |

## `add`

```bash
pingboard add https://example.org
```

The URL must start with `http://` or `https://`. Anything else exits with status 1 and `pingboard: a target must start with http:// or https://`. No other part of the URL is checked. Adding a URL that is already in the list changes nothing. On success the command prints nothing.

## `check`

```bash
pingboard check
# up   200   184 ms  https://example.org
# DOWN   0     5 ms  http://127.0.0.1:1/
```

Each line shows `up` or `DOWN`, the HTTP status (`0` when there was no response), the time in milliseconds and the URL. Targets are checked in the order `list` prints them. The times in the example are illustrative.

With `--json` the command prints nothing until all checks are done, then one array with an object per target:

```bash
pingboard check --json
# [{"url": "http://127.0.0.1:1/", "up": false, "status": 0, "millis": 16, "error": "<urlopen error [Errno 61] Connection refused>"}]
```

With `--fail-fast` the command stops after the first target that is down; later targets are not checked and do not appear in the output.

| Exit status | Meaning |
|---|---|
| `0` | Every checked target is up, or the list is empty. |
| `1` | At least one target is down. |

`check` does not need `serve` to be running and does not change what `serve` shows.

## `list`

```bash
pingboard list
# https://example.org
```

The targets are printed in sorted order. With an empty list the command prints one empty line.

## `remove`

```bash
pingboard remove https://example.org
```

The URL must match an entry exactly. Otherwise the command exits with status 1 and `pingboard: <url> is not in the list`. On success it prints nothing. A running `serve` stops checking the target from its next cycle, but keeps showing its last result until it is restarted.

## `serve`

```bash
pingboard serve --port 9090
```

Starts the check loop and the HTTP server; see [System overview](../intro/overview.md) and [HTTP routes](routes.md). The command does not return. `--port 0` is ignored and the value of `PINGBOARD_PORT` is used.
