# System overview

This page describes what runs when pingboard is in use, what each part owns and where state is kept. The later chapters assume this picture.

pingboard is one Python process with no dependencies outside the Python standard library. It keeps a list of URLs, called targets, in one JSON file. `pingboard serve` starts a background loop that sends a GET request to every target, and an HTTP server that shows the latest result for each one. The results live in memory only: there is no database and no history.

## The `pingboard` command

Every use of pingboard goes through the one command, `pingboard`. The subcommands `add`, `remove` and `list` change or print the targets file and exit. `check` checks every target once, prints the results and exits. `serve` is the only long-running one. [Commands and flags](../config/commands.md) lists all of them.

Each subcommand reads its settings from environment variables once, when it starts. There is no configuration file. [Environment variables and settings](../config/environment.md) lists every setting.

## The targets file

The list of targets is the only state pingboard keeps on disk. It is one JSON file, by default `~/.pingboard/targets.json`, and `PINGBOARD_DATA` moves it.

- `add` and `remove` rewrite the whole file: the new content goes to a temporary file next to it, which then replaces the original in one step. A reader never sees a half-written file.
- The list is stored sorted and without duplicates.
- When the file does not exist, the list is empty. `add` creates the file and its directory.

[Files on disk](../config/files.md) shows the format.

## The check loop

`pingboard serve` starts one background thread, the check loop. One pass of the loop is a cycle:

1. Read the targets file.
2. Check each target in turn, one at a time, and store the result in memory under the target's URL.
3. Sleep for `PINGBOARD_INTERVAL` seconds, then start again.

The first cycle starts as soon as `serve` starts. Because the file is read at the start of every cycle, a target added with `pingboard add` is picked up in the next cycle without a restart.

Two consequences are worth knowing:

- The checks in a cycle run one after another, so the time between two checks of the same target is the interval plus the time the whole cycle took. A slow or unreachable target delays the ones after it by up to its timeout.
- A removed target is no longer checked, but its last result stays in memory and stays on the dashboard, in `/api/status` and in `/metrics` until `serve` is restarted.

## One check

A check is one HTTP GET request to the target, sent with the header `User-Agent: pingboard` and the timeout from `PINGBOARD_TIMEOUT`. Redirects are followed, and the status of the final response counts.

| Outcome | `up` | `status` | `error` |
|---|---|---|---|
| A response with a status below 400 | true | the HTTP status | empty |
| A response with status 400 or above | false | the HTTP status | the HTTP error text |
| No response: DNS failure, refused connection, timeout | false | `0` | the error text |

Every result also records `millis`, the time the check took in milliseconds.

## The HTTP server

`serve` listens on `PINGBOARD_BIND`:`PINGBOARD_PORT`, by default `127.0.0.1:8080`, and answers four GET routes from the results in memory: the dashboard at `/`, `/api/status`, `/metrics` and `/healthz`. [HTTP routes](../config/routes.md) describes each one.

The server has no authentication and no TLS. With the default bind address it can be reached only from the machine it runs on.

## What leaves the machine

The only outgoing traffic is the GET request to each target. pingboard sends nothing else anywhere: the code contains no other network client.

## What is lost on restart

Everything except the targets file: the latest results and the `pingboard_checks_total` counter start from nothing. After a restart the dashboard is empty until the first cycle has checked each target.
