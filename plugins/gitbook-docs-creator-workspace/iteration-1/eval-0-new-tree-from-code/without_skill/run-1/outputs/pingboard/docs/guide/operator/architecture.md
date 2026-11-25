# Architecture

pingboard is a single Python package with five small modules and no
third-party dependencies.

## Modules

| Module | Responsibility |
| --- | --- |
| `pingboard/cli.py` | Command line: `add`, `remove`, `list`, `check`, `serve`. Entry point `pingboard.cli:main` |
| `pingboard/config.py` | Reads the settings once from the environment into an immutable `Config` |
| `pingboard/store.py` | Reads and writes the list of targets, one JSON file |
| `pingboard/check.py` | Performs one check and returns a `Result` |
| `pingboard/server.py` | The check loop and the HTTP server |

## Data flow

    pingboard add/remove ──writes──▶ targets file ◀──reads every round── check loop
                                                                            │
                                                              one GET per target
                                                                            ▼
    browser, Prometheus ──GET──▶ HTTP server ──reads──▶ results in memory ◀─┘

The command-line tool and the running service do not talk to each other. They
share only the targets file.

## One check

`check.check(url, timeout)` sends one `GET` request with the header
`User-Agent: pingboard` and returns a `Result`:

| Field | Meaning |
| --- | --- |
| `url` | The target |
| `up` | `true` when the final status is below 400 |
| `status` | HTTP status code; `0` when no HTTP response arrived |
| `millis` | Wall-clock duration of the check in milliseconds |
| `error` | Text of the exception for a failed check, otherwise empty |

Details that matter in operation:

- Redirects are followed by the standard library, so a target that redirects
  to a working page is up, and `status` is the status of the final response.
- Any status from 400 upwards counts as down, including 401 and 403. A target
  behind a login is reported as down.
- DNS failures, refused connections, TLS errors and timeouts all give
  `status` 0. The `error` field tells them apart.
- The response body is not read or inspected.
- TLS certificates are verified with the defaults of the Python installation.
- The standard library honours the proxy environment variables
  (`http_proxy`, `https_proxy`, `no_proxy`).

## The check loop

`pingboard serve` starts one daemon thread that repeats forever:

1. Read the targets file.
2. Check the targets one after another, in alphabetical order.
3. Store each result in memory, keyed by URL, and increase the check counter.
4. Log a warning for each target that is down.
5. Sleep for `PINGBOARD_INTERVAL` seconds.

Consequences:

- **The first round starts immediately** at start-up.
- **The period is longer than the interval.** The interval is the pause
  between two rounds, so one cycle lasts the duration of the round plus the
  interval.
- **Checks are sequential.** One slow target delays all the following ones. In
  the worst case a round lasts about the number of targets multiplied by
  `PINGBOARD_TIMEOUT`.
- **Changes to the targets file are picked up at the next round** without a
  restart.
- **Results of removed targets are never dropped.** They stay in memory, on
  the dashboard and in `/metrics` until the process restarts.
- **The loop has no error handling.** If reading the targets file fails, for
  example because the file is not valid JSON, the thread ends. The HTTP server
  keeps running and keeps serving the last results, and `/healthz` still
  answers `ok`. See [Monitoring](monitoring.md) for how to detect this.

## The HTTP server

The server is a `ThreadingHTTPServer` from the standard library: one thread
per request, `GET` only, four fixed paths. Access to the shared results is
guarded by one lock. See [HTTP endpoints](http-endpoints.md).

## State

| State | Where | Lifetime |
| --- | --- | --- |
| List of targets | Targets file | Until changed |
| Latest result per target | Memory | Until the process stops |
| Check counter | Memory | Until the process stops |

There is no history and no database.
