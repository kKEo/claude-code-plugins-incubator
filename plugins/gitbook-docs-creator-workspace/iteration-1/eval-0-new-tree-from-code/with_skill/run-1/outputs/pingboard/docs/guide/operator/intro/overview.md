# System overview

This page describes the parts of pingboard and how a check moves through them, so that the settings, signals and failure modes in later chapters make sense.

pingboard keeps a list of targets in one JSON file. A command line program edits that list, checks it once on demand, or starts a long-running process. The long-running process has a background loop that checks every target in turn and keeps the latest result of each in memory, and an HTTP server that shows those results. Nothing else is stored, and nothing is sent anywhere except the GET requests to the targets.

## Components

Each component is one module in the `pingboard` package.

| Module | Owns | Talks to |
|---|---|---|
| `pingboard/cli.py` | The command line: `add`, `remove`, `list`, `check`, `serve`. Loads the settings, then runs one command. | `config`, `store`, `check`, `server` |
| `pingboard/config.py` | The settings. `config.load()` reads six environment variables once and returns a frozen `Config`. | The environment |
| `pingboard/store.py` | The target list on disk. `store.read` and `store.write`. | The data file |
| `pingboard/check.py` | One check. `check.check(url, timeout)` returns a `Result`. | The target, over HTTP or HTTPS |
| `pingboard/server.py` | The background loop and the HTTP routes. Holds the latest results in memory. | `store`, `check`, HTTP clients |

## The target list

The list is one JSON file with a single key:

```json
{
  "targets": [
    "https://example.org"
  ]
}
```

- Its path is the setting `PINGBOARD_DATA`; see [Environment variables and settings](../config/environment.md).
- `store.write` sorts the targets, removes duplicates, writes them to a file with the suffix `.tmp` next to the data file, and then replaces the data file with it in one step. A reader never sees a half-written file. The parent directory is created when it is missing.
- `store.read` returns an empty list when the file does not exist.
- `add` and `remove` read the list, change it and write it back. There is no lock, so two changes made at the same moment can overwrite each other.

## One check

A check is one GET request with the header `User-Agent: pingboard`, made with the Python standard library.

- A target is **up** when the response status is below 400 and arrives within the timeout (`PINGBOARD_TIMEOUT`).
- Redirects are followed; the status of the final response is the one that counts.
- A response with status 400 or above is **down**, and the status is recorded.
- A failure without a response (DNS failure, refused connection, timeout) is **down** with status `0`.

The `Result` of a check has five fields, and they appear under the same names in the JSON output:

| Field | Type | Meaning |
|---|---|---|
| `url` | string | The target. |
| `up` | boolean | Whether the check passed. |
| `status` | integer | The HTTP status, or `0` when there was no response. |
| `millis` | integer | How long the check took, in milliseconds. |
| `error` | string | The error text when the target is down, otherwise empty. |

## The check loop

`pingboard serve` starts `server.loop` in a background thread. One cycle is:

1. Read the target list from the data file.
2. Check every target, one after another.
3. Store each `Result` in memory under its URL, replacing the previous one, and add one to the counter `checks_total`.
4. Log a warning for each target that is down.
5. Sleep for `PINGBOARD_INTERVAL` seconds.

What follows from this:

- The first cycle starts as soon as the process starts.
- Because the list is read again in every cycle, a target added with `pingboard add` is checked from the next cycle on. No restart is needed.
- Checks run one at a time, so a cycle lasts as long as all checks together, and the next one starts `PINGBOARD_INTERVAL` seconds after that. Many slow or unreachable targets stretch the time between two checks of the same target.
- A removed target is no longer checked, but its last result stays in memory. It keeps appearing on the dashboard and in the metrics until the process is restarted.
- Only the latest result of each target is kept. There is no history, and all results are lost when the process stops.
- If the loop meets an error it does not handle, such as a data file that is not valid JSON, the thread ends and the HTTP server keeps answering with the last results. [Troubleshooting](../operations/troubleshooting.md#the-dashboard-shows-old-results) says how to spot this.

## The HTTP server

The same process serves four routes with `ThreadingHTTPServer` from the standard library: the dashboard at `/`, the results as JSON at `/api/status`, metrics at `/metrics` and a health check at `/healthz`. [HTTP routes](../config/http.md) lists them.

The server has no login and no TLS. By default it listens on `127.0.0.1`, so only programs on the same machine can reach it. Before you set `PINGBOARD_BIND` to another address, decide who may see the list of targets, and put a reverse proxy in front if you need a login or HTTPS.

## Settings

Every command calls `config.load()` first, also `add`, `remove` and `list`. The settings are read once; a running `pingboard serve` does not notice a change in the environment until it is restarted.
