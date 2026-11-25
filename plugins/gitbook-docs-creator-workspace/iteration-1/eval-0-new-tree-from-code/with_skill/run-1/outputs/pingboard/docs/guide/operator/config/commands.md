# Commands and flags

This page lists every command and flag of the `pingboard` program. It is taken from the argument parser in `pingboard/cli.py`. The same program can be started as `python -m pingboard.cli`.

Every command reads the settings first; see [Environment variables and settings](environment.md). A command that is not in the table, or no command at all, prints a usage message and exits with status 2.

| Command | Arguments and flags | Purpose |
|---|---|---|
| `add` | `url` | Add a URL to the list. |
| `check` | `--json`, `--fail-fast` | Check every URL once and exit. |
| `list` | none | Print the URLs, one per line. |
| `remove` | `url` | Remove a URL from the list. |
| `serve` | `--port` | Run the dashboard and check on a schedule. |

Every command, and the program itself, also accepts `-h` and `--help`.

## add

Adds one target to the data file.

```bash
pingboard add https://example.org
```

- The URL must start with `http://` or `https://`. Otherwise the command exits with status 1 and `pingboard: a target must start with http:// or https://`. Nothing else about the URL is checked.
- The list is stored sorted and without duplicates. Adding a URL that is already in the list changes nothing and exits with status 0.
- Prints nothing on success.

## check

Checks every target once, in the order of the list, and exits. It does not need a running `pingboard serve` and does not change what the dashboard shows.

```bash
pingboard check
```

```text
DOWN   0    19 ms  http://127.0.0.1:1/
up   200     3 ms  https://example.org
```

Each line shows the state, the HTTP status (`0` when there was no response), the duration and the URL.

| Flag | Effect |
|---|---|
| `--json` | Print one JSON array instead of the lines, after the last check. Each element has the fields `url`, `up`, `status`, `millis` and `error`. |
| `--fail-fast` | Stop at the first URL that is down. With `--json`, the array holds the results up to and including that one. |

| Exit status | Meaning |
|---|---|
| 0 | Every checked target is up, or the list is empty. |
| 1 | At least one target is down. |

```bash
# Use it as a gate in a script.
pingboard check --fail-fast || echo "something is down"
```

## list

Prints the targets, one per line, in sorted order. With an empty list it prints one empty line.

```bash
pingboard list
```

## remove

Removes one target from the data file.

```bash
pingboard remove https://example.org
```

- The URL must match an entry exactly. Otherwise the command exits with status 1 and `pingboard: <url> is not in the list`.
- A running `pingboard serve` stops checking the target in its next cycle, but keeps showing its last result until it is restarted.

## serve

Starts the check loop and the HTTP server and runs until the process is stopped.

```bash
pingboard serve --port 9090
```

| Flag | Effect |
|---|---|
| `--port PORT` | Listen on `PORT` instead of `PINGBOARD_PORT`. The value `0` is ignored and the setting is used. |

The address, the interval, the timeout and the log level have no flags; set them in the environment. [HTTP routes](http.md) lists what the server answers, and [Metrics and logs](../monitoring/signals.md) what it logs.
