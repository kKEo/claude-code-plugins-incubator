# System overview

This chapter describes what runs when pingboard is in use, what each piece owns and where state is kept. Every later chapter assumes it.

pingboard is one Python program with no dependencies outside the standard library. It is used in two ways: as short commands that edit or check a list of URLs and then exit, and as one long-running process, `pingboard serve`, that checks the list on a schedule and answers HTTP requests. The only state on disk is the targets file; check results live in the memory of the `serve` process.

## The pieces

| Piece | Lifetime | Owns | Talks to |
|---|---|---|---|
| `pingboard add`, `remove`, `list` | Exits at once | Nothing | Reads and rewrites the targets file |
| `pingboard check` | One pass over the list, then exits | Nothing | Reads the targets file, sends one request per target |
| `pingboard serve`, checker thread | Until the process stops | The latest result per target and a count of checks, in memory | Reads the targets file, sends requests to the targets |
| `pingboard serve`, HTTP server | Until the process stops | The listening socket | Answers browsers and scrapers from the results in memory |
| Targets file | Permanent | The list of URLs | Nothing |

## The targets file

The list of URLs is one JSON file, by default `~/.pingboard/targets.json`; `PINGBOARD_DATA` moves it. It has this shape, with the URLs sorted and without duplicates:

```json
{
  "targets": [
    "https://example.org",
    "https://example.org/status"
  ]
}
```

Every change writes a complete new file next to it (same name, extension `.tmp`) and renames it over the old one, so a reader never sees a half-written file. The directory is created on the first `pingboard add`. A file that does not exist is an empty list.

Nothing locks the file. Two `add` or `remove` commands that run at the same moment each read the list, change it and write it back, and the later write wins.

## One check

A check is one HTTP `GET` request to the target with the header `User-Agent: pingboard`. The target is **up** when a response with a status below 400 arrives within `PINGBOARD_TIMEOUT` seconds. Redirects are followed, so the status that counts is the one of the final response. Only the status is used; the response body is not kept.

A result has five fields, which appear unchanged in `pingboard check --json` and in `/api/status`:

| Field | Meaning |
|---|---|
| `url` | The target as stored in the targets file |
| `up` | `true` or `false` |
| `status` | The HTTP status, or `0` when no HTTP response arrived (name not found, connection refused, timeout) |
| `millis` | How long the check took, in milliseconds |
| `error` | Empty when up; otherwise the error text |

## The serve process

`pingboard serve` starts a checker thread and then serves HTTP on `PINGBOARD_BIND`:`PINGBOARD_PORT` (default `127.0.0.1:8080`).

The checker thread repeats one round for as long as the process lives:

1. Read the targets file. A target added while the process runs is picked up at the next round, without a restart.
2. Check the targets one after another, in file order, and store each result under its URL.
3. Sleep `PINGBOARD_INTERVAL` seconds.

The first round starts immediately. Because checks run one at a time and the sleep comes after them, a round takes the sum of the check times plus the interval; with every target timing out, that is targets × `PINGBOARD_TIMEOUT` + `PINGBOARD_INTERVAL` seconds.

The HTTP server answers four paths from the results in memory; [HTTP endpoints](../config/http.md) lists them. Each request is handled on its own thread. There is no authentication and no TLS, which is why the default bind address is the loopback interface.

Things an operator should know about this design:

- Results are not written to disk. After a restart the dashboard is empty until the first round has checked each target, and there is no history.
- A result is stored per URL and never deleted. A target removed from the list keeps its last result on the dashboard and in the metrics until the process restarts.
- The checker thread has no error handling around a round. If the targets file cannot be parsed, the thread ends with a traceback on standard error while the HTTP server keeps answering with the last results. [Metrics and logs](../monitoring/signals.md) says how to detect this.

## What crosses the network

| Direction | What |
|---|---|
| Outbound | One `GET` per target per round, to the URLs in the targets file. Nothing else: no telemetry, no update check |
| Inbound | Plain HTTP on the bind address and port, `serve` only |

The code view of the same system, module by module, is in the [developer guide](../../developer/code/overview.md).
