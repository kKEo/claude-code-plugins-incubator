# Manual test plan

Use this plan to verify the parts that have no automated tests: the check, the command output and the HTTP server. Run it before a version is deployed and after any change to `check.py`, `cli.py` or `server.py`. It takes about fifteen minutes.

## Preparation

Work in a clone with pingboard installed (see [Running the tests](running.md)). Use a separate data file and short timings, so that your own target list is untouched and you do not wait long:

```
export PINGBOARD_DATA=/tmp/pingboard-test/targets.json
export PINGBOARD_INTERVAL=5
export PINGBOARD_TIMEOUT=2
rm -rf /tmp/pingboard-test
```

Start a local target that is up, in a second terminal:

```
python -m http.server 9001 --bind 127.0.0.1
```

The plan uses three targets:

| Target | Expected state |
| --- | --- |
| `http://127.0.0.1:9001/` | up, status 200 |
| `http://127.0.0.1:9001/missing` | down, status 404 |
| `http://127.0.0.1:9009/` | down, status 0 (nothing listens on this port) |

## 1. Target list

| # | Step | Expected result |
| --- | --- | --- |
| 1.1 | `pingboard list` | No URL is printed; exit status 0 |
| 1.2 | `pingboard add example.org` | Message `pingboard: a target must start with http:// or https://`; exit status 1 |
| 1.3 | `pingboard add http://127.0.0.1:9009/` then `pingboard add http://127.0.0.1:9001/` | No output |
| 1.4 | `pingboard add http://127.0.0.1:9001/` again, then `pingboard list` | Two lines, port 9001 first, no duplicate |
| 1.5 | `pingboard remove http://nowhere.example` | Message `... is not in the list`; exit status 1 |
| 1.6 | `cat $PINGBOARD_DATA` | JSON object with the key `targets`; no `targets.tmp` file next to it |

## 2. Checking once

| # | Step | Expected result |
| --- | --- | --- |
| 2.1 | `pingboard check; echo $?` | One `up   200` line and one `DOWN   0` line; exit status 1 |
| 2.2 | `pingboard check --json` | One JSON array with two objects; the down one has a non-empty `error` |
| 2.3 | `pingboard add http://127.0.0.1:9001/missing`, then `pingboard check` | A third line, `DOWN 404` |
| 2.4 | `pingboard check --fail-fast` | Stops after the first `DOWN` line; later targets are missing from the output |
| 2.5 | `pingboard remove` both down targets, then `pingboard check; echo $?` | One `up` line; exit status 0 |
| 2.6 | `PINGBOARD_INTERVAL=2 pingboard list` | Message `PINGBOARD_INTERVAL must be at least 5 seconds`; exit status 1 |

Add the two down targets again before you continue.

## 3. Dashboard

Start the server in a third terminal, with the same three `export` lines: `pingboard serve --port 9002`.

| # | Step | Expected result |
| --- | --- | --- |
| 3.1 | Read the terminal | `INFO listening on http://127.0.0.1:9002`, then every 5 seconds or so two `WARNING target down` lines |
| 3.2 | `curl -i http://127.0.0.1:9002/healthz` | Status 200, body `ok` |
| 3.3 | Open `http://127.0.0.1:9002/` in a browser | Table with three rows: one `up`, two `DOWN` |
| 3.4 | `curl -s http://127.0.0.1:9002/api/status` | JSON array with three objects, same fields as in step 2.2 |
| 3.5 | `curl -s http://127.0.0.1:9002/metrics` | `pingboard_checks_total` with a number; three `pingboard_target_up` lines, one with value 1; three `pingboard_check_duration_ms` lines |
| 3.6 | Repeat 3.5 after ten seconds | `pingboard_checks_total` is higher |
| 3.7 | `curl -i http://127.0.0.1:9002/nothing` | Status 404, body `not found` |

## 4. Changes while the server runs

| # | Step | Expected result |
| --- | --- | --- |
| 4.1 | Stop the local target on port 9001 (`Ctrl+C`), wait ten seconds, reload the dashboard | The first row changes to `DOWN`; a third warning appears per round |
| 4.2 | Start the local target again, wait, reload | The row is `up` again |
| 4.3 | `pingboard add http://127.0.0.1:9001/README.md` (any path that exists), wait, reload | A fourth row appears without a restart |
| 4.4 | `pingboard remove http://127.0.0.1:9009/`, wait | The warnings for this target stop. Its row stays on the dashboard; this is the current, known behaviour |
| 4.5 | Restart `pingboard serve --port 9002`, reload | The row of the removed target is gone |

## 5. Settings

Stop the server first.

| # | Step | Expected result |
| --- | --- | --- |
| 5.1 | `PINGBOARD_PORT=9003 pingboard serve` | Listens on port 9003 |
| 5.2 | `PINGBOARD_PORT=9003 pingboard serve --port 9004` | Listens on port 9004 |
| 5.3 | `PINGBOARD_LOG_LEVEL=debug pingboard serve --port 9002`, then request `/healthz` | A `DEBUG http` line appears for the request |
| 5.4 | `PINGBOARD_LOG_LEVEL=error pingboard serve --port 9002` | No `listening` line and no warnings; `/healthz` still answers |

## Clean up

Stop the server and the local target, then:

```
rm -rf /tmp/pingboard-test
unset PINGBOARD_DATA PINGBOARD_INTERVAL PINGBOARD_TIMEOUT
```

## Recording the result

Note the commit, the Python version, the operating system and the number of every step that failed. A failed step is a defect; see [Reporting a defect](reporting.md).
