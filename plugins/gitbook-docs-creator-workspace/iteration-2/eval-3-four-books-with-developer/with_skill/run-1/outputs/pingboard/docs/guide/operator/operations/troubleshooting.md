# Troubleshooting runbook

This chapter has one section per symptom: how to confirm it, the likely causes in order, the fix, and how to check that it worked. Error texts are quoted exactly so that a search finds them.

## The dashboard is empty

**Confirm.** `curl http://127.0.0.1:8080/api/status` prints `[]`.

**Causes.**

1. The list is empty. `pingboard list` prints an empty line.
2. The commands and the `serve` process use different targets files: they run as different accounts, or only one of them has `PINGBOARD_DATA` set.
3. The process has just started and the first check has not finished. One check can take up to `PINGBOARD_TIMEOUT` seconds.

**Fix.** Add a target with `pingboard add`, as the account and with the `PINGBOARD_DATA` value of the `serve` process.

**Check.** After the next round, `/api/status` lists the target.

## Results stop changing

**Confirm.** `pingboard_checks_total` in `/metrics` has the same value on two requests that are more than one round apart, while `/healthz` still answers `ok`.

**Causes.**

1. The checker thread has ended. Standard error shows a traceback that starts with `Exception in thread`. It ends this way when the targets file is not valid JSON (`json.decoder.JSONDecodeError`) or has no `targets` key (`KeyError`), for example after an edit by hand.
2. The list is empty, so there is nothing to check.

**Fix.** Repair the targets file so that `pingboard list` prints the targets without an error, or restore it from a copy as described in [Back up and restore](backup.md). Then restart `pingboard serve`; the thread is not started again by itself.

**Check.** `pingboard_checks_total` grows again.

## A removed target is still shown

**Confirm.** `pingboard list` does not print the URL, but the dashboard, `/api/status` and `/metrics` still do, with values that no longer change.

**Cause.** The `serve` process keeps the last result of every URL it has checked until it stops.

**Fix.** Restart `pingboard serve`.

**Check.** After the first round, only the current targets are shown.

## A target is DOWN but works in a browser

**Confirm.** Run `pingboard check --json` and read `status` and `error` for the target.

**Causes.**

1. `status` is 400 or higher: the site answered, with an error status. Some sites answer differently to a program than to a browser; pingboard sends `User-Agent: pingboard`.
2. `status` is `0` and `error` mentions a timeout: the response took longer than `PINGBOARD_TIMEOUT` seconds.
3. `status` is `0` with another `error`: the machine that runs pingboard cannot resolve the name, cannot connect, or does not accept the site's certificate.

**Fix.** For a timeout, raise `PINGBOARD_TIMEOUT`. For a network error, test from the same machine and account, for example with `curl -I <url>`.

**Check.** `pingboard check` prints `up` for the target and exits with status 0 when every target is up.

## The dashboard cannot be reached from another machine

**Confirm.** `curl http://127.0.0.1:8080/healthz` works on the machine itself and fails from elsewhere.

**Cause.** The default bind address is `127.0.0.1`.

**Fix.** Put a reverse proxy in front, or set `PINGBOARD_BIND` to an address of the machine. Read the warning in [Install](../install/install.md) first: there is no authentication.

**Check.** `/healthz` answers from the other machine.

## Rounds take longer than the interval

**Confirm.** `pingboard_checks_total` grows more slowly than targets ÷ `PINGBOARD_INTERVAL` per second.

**Cause.** Checks run one after another and the pause comes after them. Slow or timing-out targets lengthen every round by up to `PINGBOARD_TIMEOUT` seconds each.

**Fix.** Lower `PINGBOARD_TIMEOUT`, or remove targets that always time out.

**Check.** `pingboard_check_duration_ms` shows which targets take the time.

## A command fails at start

| Error text | Cause | Fix |
|---|---|---|
| `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` | The variable is set below `5`. Every command fails, not only `serve` | Set it to `5` or more, or unset it |
| `ValueError: invalid literal for int() with base 10: …` | `PINGBOARD_PORT` or `PINGBOARD_INTERVAL` is not an integer | Correct the value |
| `ValueError: Unknown level: …` | `PINGBOARD_LOG_LEVEL` is not a level name | Use `debug`, `info`, `warning`, `error` or `critical` |
| `json.decoder.JSONDecodeError: …` | The targets file is not valid JSON | Repair or restore the file; see [Back up and restore](backup.md) |
| `OSError: … Address already in use` | Another process, often a second `pingboard serve`, listens on the port | Stop it, or choose another port with `--port` |
