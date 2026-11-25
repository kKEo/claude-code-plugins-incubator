# Manual test cases

Run these cases in the environment from
[Test environment](test-environment.md): a throwaway `PINGBOARD_DATA`, the
local web server on port 18081, `PINGBOARD_INTERVAL=5`, `PINGBOARD_TIMEOUT=2`
and `PINGBOARD_PORT=18080`. Show the exit code of a command with `echo $?`.

The URLs used below:

| Name | URL |
| --- | --- |
| UP | `http://127.0.0.1:18081/` |
| MISSING | `http://127.0.0.1:18081/missing` |
| REFUSED | `http://127.0.0.1:18082/` |
| HANGING | `http://127.0.0.1:18083/` |

## Targets

| ID | Steps | Expected result |
| --- | --- | --- |
| T-1 | With no targets file, run `pingboard add` with UP | No output, exit code 0. The targets file and its folder exist; the file holds a `targets` array with the URL. No `.tmp` file is left |
| T-2 | Add MISSING, add UP a second time, run `pingboard list` | Two lines, sorted alphabetically, UP only once |
| T-3 | `pingboard add example.org` and `pingboard add ftp://example.org` | Message `pingboard: a target must start with http:// or https://`, exit code 1, list unchanged |
| T-4 | `pingboard remove` with MISSING, then the same command again | First: no output, exit code 0, URL gone from the list. Second: message `pingboard: <url> is not in the list`, exit code 1 |
| T-5 | Point `PINGBOARD_DATA` at a file that does not exist, run `pingboard list` and `pingboard check` | `list` prints an empty line; `check` prints nothing; both exit with 0; the file is not created |

## One-off check

Start with a list that holds UP, MISSING and REFUSED.

| ID | Steps | Expected result |
| --- | --- | --- |
| K-1 | `pingboard check` | Three lines in list order. UP: `up`, 200. MISSING: `DOWN`, 404. REFUSED: `DOWN`, 0. Each line shows a duration in ms and the URL. Exit code 1 |
| K-2 | Remove MISSING and REFUSED, `pingboard check` | One `up` line, exit code 0 |
| K-3 | Start the hanging listener, add HANGING, `pingboard check` | HANGING is `DOWN` with status 0 and a duration of about 2000 ms. Exit code 1 |
| K-4 | List with UP, MISSING, REFUSED; `pingboard check --json` | One line of valid JSON: an array of three objects with `url`, `up`, `status`, `millis`, `error`. `error` is empty for UP and filled for the others. No human-readable lines. Exit code 1 |
| K-5 | Same list, `pingboard check --fail-fast` | Output stops after the first `DOWN` line; later targets are not checked. Exit code 1 |
| K-6 | Same list, `pingboard check --json --fail-fast` | The array ends with the first target that is down. Exit code 1 |

## Configuration

| ID | Steps | Expected result |
| --- | --- | --- |
| C-1 | Unset every `PINGBOARD_` variable except `PINGBOARD_DATA`, run `pingboard serve` | Log line `listening on http://127.0.0.1:8080`. Stop with `Ctrl+C` |
| C-2 | `PINGBOARD_INTERVAL=4 pingboard list`, then with `5` | With 4: message `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`, exit code 1. With 5: the list |
| C-3 | `PINGBOARD_PORT=abc pingboard list` | The command fails with a `ValueError`. Known weakness: a traceback instead of a clear message |
| C-4 | `PINGBOARD_LOG_LEVEL=debug pingboard serve`, request `/healthz` | The log shows an `http` line for the request. With `info` it does not |

## Dashboard and endpoints

Start with a list that holds UP and MISSING, then run `pingboard serve`.
`BASE` stands for `http://127.0.0.1:18080`.

| ID | Steps | Expected result |
| --- | --- | --- |
| S-1 | `pingboard serve --port 18090` | The log line and the listening port show 18090, although `PINGBOARD_PORT` is 18080. Restart without the option for the next cases |
| S-2 | Watch the log for 15 seconds | One `listening on` line at start. One `target down` warning for MISSING in every round, with `status=404`. No line for UP |
| S-3 | Open `BASE/` in a browser | Heading `pingboard` and a table with two rows: UP with `up`, MISSING with `DOWN`, each with a duration |
| S-4 | `curl -i` on `BASE/healthz`, `BASE/api/status`, `BASE/metrics`, `BASE/nope` | `/healthz`: 200, `ok`. `/api/status`: 200, `application/json`, array of two results. `/metrics`: 200, `pingboard_checks_total` plus `pingboard_target_up` and `pingboard_check_duration_ms` for both URLs, with values 1 and 0 for UP and MISSING. `/nope`: 404, `not found` |
| S-5 | Request `BASE/metrics` twice, 15 seconds apart | `pingboard_checks_total` has grown by a multiple of the number of targets |
| S-6 | While the service runs, add REFUSED; after two rounds remove MISSING | REFUSED appears within one round without a restart. MISSING stays on the dashboard with its last result but produces no new warnings. After a restart MISSING is gone |
| S-7 | While the service runs, overwrite the targets file with the text `broken` | A traceback starting with `Exception in thread` appears. `/healthz` still answers `ok`, `pingboard_checks_total` no longer grows, old results stay. Known weakness, documented in the Operator guide. Restoring the file does not help until the service is restarted |
| S-8 | Stop the local web server while the service runs, wait one round, start it again | UP changes to `DOWN` after the next round and back to `up` after the round that follows the restart |
| S-9 | Start a second `pingboard serve` on the same port | The second process fails with `Address already in use`; the first keeps working |

## Recording results

Record for each run: the commit or version tested, the Python version, the
operating system, and pass or fail per case ID. For a failed case, add the
command, its full output and the exit code.
