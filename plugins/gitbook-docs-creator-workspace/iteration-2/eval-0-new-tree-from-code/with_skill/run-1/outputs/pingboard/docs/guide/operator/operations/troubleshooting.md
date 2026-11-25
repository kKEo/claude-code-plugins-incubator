# Troubleshooting runbook

This page has one section per symptom, with how to confirm it, the cause, the fix and how to check that the fix worked. The last section covers backup and restore.

## `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`

Any command prints this and exits with status 1.

- **Cause.** `PINGBOARD_INTERVAL` is set to a number below `5`.
- **Fix.** Set it to `5` or more, or unset it to get the default of `60`.
- **Check.** `pingboard list` prints the list.

## A command ends with `ValueError: invalid literal for int()`

Any command prints a Python traceback that ends with this line, or with `ValueError: could not convert string to float`.

- **Cause.** `PINGBOARD_INTERVAL` or `PINGBOARD_PORT` is not a whole number, or `PINGBOARD_TIMEOUT` is not a number.
- **Fix.** Correct the value. The traceback quotes it.
- **Check.** `pingboard list` prints the list.

## `serve` ends with `ValueError: Unknown level`

- **Cause.** `PINGBOARD_LOG_LEVEL` is not one of `debug`, `info`, `warning`, `error`, `critical`.
- **Fix.** Use one of these names, in any case.
- **Check.** `serve` logs `listening on`.

## `serve` ends with `OSError: ... Address already in use`

- **Confirm.** The traceback ends with `OSError: [Errno 48] Address already in use`; the number differs between operating systems.
- **Cause.** Another process, often a second `pingboard serve`, listens on the same address and port.
- **Fix.** Stop the other process, or pick another port with `pingboard serve --port 9090` or `PINGBOARD_PORT`.
- **Check.** `curl http://127.0.0.1:9090/healthz` prints `ok`.

## The dashboard cannot be reached from another machine

- **Confirm.** `curl http://127.0.0.1:8080/healthz` works on the machine that runs `serve`, and the same request from elsewhere is refused.
- **Cause.** The default `PINGBOARD_BIND` is `127.0.0.1`.
- **Fix.** Start `serve` with `PINGBOARD_BIND=0.0.0.0`, or with the address of one interface. Read the warning in [Install](../install/install.md) first.
- **Check.** The log line at start names the new address.

## The dashboard is empty

- **Confirm.** `curl http://127.0.0.1:8080/api/status` prints `[]`.
- **Causes, most likely first.**
  1. The list is empty. `pingboard list` prints nothing.
  2. `serve` reads another targets file than the one you added to, because `PINGBOARD_DATA` differs between the two shells.
  3. `serve` has just started and the first cycle has not finished.
- **Fix.** Add a target with the same `PINGBOARD_DATA` as `serve`, then wait one interval.
- **Check.** `pingboard_checks_total` in `/metrics` grows.

## Results no longer change

- **Confirm.** `pingboard_checks_total` in `/metrics` stays the same for longer than the interval, while `/healthz` still returns `ok`. Standard error of `serve` shows a traceback, typically ending in `json.decoder.JSONDecodeError` or `KeyError: 'targets'`.
- **Cause.** The check loop has stopped because it could not read the targets file: the file is not valid JSON, or has no `targets` key. This happens after a faulty edit by hand. The HTTP server keeps running and keeps showing the old results.
- **Fix.** Repair the file so that it has the form shown in [Files on disk](../config/files.md), or restore it from a backup. Then restart `serve`: the loop does not start again by itself.
- **Check.** `pingboard list` prints the list, and `pingboard_checks_total` grows again.

## A removed target is still shown

- **Confirm.** `pingboard list` does not print the URL, but the dashboard does.
- **Cause.** `serve` keeps the last result of every target it has checked since it started.
- **Fix.** Restart `serve`.
- **Check.** After the first cycle the dashboard shows only the targets in `pingboard list`.

## A target shows `DOWN` but opens in a browser

- **Confirm.** Run `pingboard check --json` and read the `status` and `error` fields of the target.
- **Causes, most likely first.**
  1. `status` is `0` and `error` mentions a timeout: the target answers more slowly than `PINGBOARD_TIMEOUT`, by default 5 seconds.
  2. `status` is 400 or above: the target answers, but with an error status. Some sites answer differently to a request that carries `User-Agent: pingboard` and no cookies than to a browser.
  3. `status` is `0` with another `error`: the machine that runs pingboard cannot resolve or reach the target, even if your own machine can.
- **Fix.** Raise `PINGBOARD_TIMEOUT`, or point the target at a URL that answers a plain GET request with a status below 400.
- **Check.** `pingboard check` prints `up` for the target.

## `pingboard: <url> is not in the list`

- **Cause.** `remove` needs the URL exactly as stored, including a trailing slash.
- **Fix.** Copy the URL from the output of `pingboard list`.

## Back up and restore

The targets file is the only thing to back up. The default path is `~/.pingboard/targets.json`; `PINGBOARD_DATA` overrides it.

```bash
# Back up
cp ~/.pingboard/targets.json targets.backup.json

# Restore
cp targets.backup.json ~/.pingboard/targets.json
```

`serve` does not have to be stopped for either. It reads the restored file in its next cycle. Results are not stored, so there is nothing else to restore.
