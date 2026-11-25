# Commands and flags

This is every command and flag of the `pingboard` program, taken from the argument parser in `pingboard/cli.py`.

The general form is `pingboard <command> [arguments]`. A command is required. `pingboard -h` and `pingboard <command> -h` print help. All commands read the [environment variables](environment.md) first.

| Command | Arguments and flags | Purpose |
|---|---|---|
| `add` | `url` | Add a URL to the list |
| `check` | `--json`, `--fail-fast` | Check every URL once and exit |
| `list` | none | Print the URLs, one per line |
| `remove` | `url` | Remove a URL from the list |
| `serve` | `--port PORT` | Run the dashboard and check on a schedule |

## add

```bash
pingboard add https://example.org
```

Adds `url` to the targets file and prints nothing. The URL must start with `http://` or `https://`; otherwise the command exits with status 1 and `pingboard: a target must start with http:// or https://`. No other validation is done. The list is kept sorted and without duplicates, so adding a URL twice changes nothing. URLs are compared as text: `https://example.org` and `https://example.org/` are two targets.

## check

```bash
pingboard check
pingboard check --json
pingboard check --fail-fast
```

Checks every target once, in list order, and exits. It does not need a running `serve` process and does not update one.

| Flag | Effect |
|---|---|
| `--json` | Print one JSON array of results at the end instead of one line per target |
| `--fail-fast` | Stop at the first target that is down |

Without `--json`, each line has the state (`up` or `DOWN`), the HTTP status, the time and the URL:

```text
up   200    87 ms  https://example.org
DOWN 404    52 ms  https://example.org/missing-page-404
```

With `--json`, each element has the fields `url`, `up`, `status`, `millis` and `error`, described in the [System overview](../intro/overview.md).

| Exit status | Meaning |
|---|---|
| `0` | Every checked target is up, or the list is empty |
| `1` | At least one target is down |

## list

```bash
pingboard list
```

Prints the targets, one per line, sorted. An empty list prints one empty line.

## remove

```bash
pingboard remove https://example.org
```

Removes `url` from the targets file and prints nothing. The text must match a stored target exactly; otherwise the command exits with status 1 and `pingboard: <url> is not in the list`. A running `serve` process stops checking the target at its next round but keeps showing the last result until it restarts.

## serve

```bash
pingboard serve
pingboard serve --port 9090
```

Starts the checker and the HTTP server and runs until it is stopped. It logs to standard error.

| Flag | Effect |
|---|---|
| `--port` | Takes a port number and listens on it instead of `PINGBOARD_PORT`. A value of `0` is ignored |

The paths the server answers are listed in [HTTP endpoints](http.md).
