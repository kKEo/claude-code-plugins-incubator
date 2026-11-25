# Troubleshooting runbook

This page goes from a symptom to its cause and fix. Each section starts with the exact text you see, so that a search finds it.

## PINGBOARD_INTERVAL must be at least 5 seconds

**You see:** any command exits with status 1 and `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`.

**Cause:** `PINGBOARD_INTERVAL` is set to a value below 5. Every command loads all settings, so `add` and `list` fail as well.

**Fix:** set a value of 5 or more, or unset the variable to get the default of 60.

```bash
unset PINGBOARD_INTERVAL
pingboard list
```

**Check:** the command runs without the message.

## ValueError when a command starts

**You see:** a Python traceback that ends in `ValueError: invalid literal for int() with base 10`, `ValueError: could not convert string to float` or `ValueError: Unknown level`.

**Cause:** a setting has a value of the wrong type: `PINGBOARD_PORT` or `PINGBOARD_INTERVAL` is not an integer, `PINGBOARD_TIMEOUT` is not a number, or `PINGBOARD_LOG_LEVEL` is not a logging level name.

**Fix:** print the settings and correct the one that is wrong; [Environment variables and settings](../config/environment.md) has the types.

```bash
env | grep PINGBOARD_
```

**Check:** `pingboard list` prints the list.

## Address already in use

**You see:** `pingboard serve` stops at once with a traceback that ends in `OSError: [Errno 48] Address already in use`. The number differs between operating systems; the text does not.

**Cause:** another process listens on the port, often an earlier `pingboard serve`.

**Fix:** stop the other process, or choose another port.

```bash
pingboard serve --port 9090
```

**Check:** the log shows `listening on http://127.0.0.1:9090`.

## The dashboard cannot be reached from another machine

**You see:** the dashboard opens on the machine that runs pingboard, but a browser elsewhere cannot connect.

**Cause:** `PINGBOARD_BIND` defaults to `127.0.0.1`, which accepts connections from the same machine only.

**Fix:** set `PINGBOARD_BIND` to an address of the machine that the other side can reach, or to `0.0.0.0` for all of them, and restart. The server has no login and no TLS, so think about who can reach the port first.

**Check:** the log line `listening on http://<bind>:<port>` shows the new address, and `curl http://<address>:<port>/healthz` from the other machine prints `ok`.

## The dashboard shows old results

**You see:** the dashboard and `/healthz` answer, but the results do not change, and `pingboard_checks_total` in `/metrics` stays the same from one interval to the next.

**Confirm:** look at standard error of the process for a traceback that starts with `Exception in thread`.

**Causes, most likely first:**

1. The data file is not valid JSON or has no `targets` key, for example after an edit by hand. The traceback ends in `json.decoder.JSONDecodeError` or `KeyError: 'targets'`, and `pingboard list` fails the same way.
2. The data file cannot be read by the user that runs the process.
3. The target list is empty. Then nothing is wrong: there is nothing to check.

**Fix:** repair the data file or restore it from a backup ([Back up and restore](backup.md)), then restart `pingboard serve`. The check loop does not start again by itself.

**Check:** `pingboard_checks_total` increases again after one interval.

## The dashboard is empty

**You see:** the page shows the heading `pingboard` and no rows.

**Causes, most likely first:**

1. The process has just started and the first cycle has not finished a check yet. Reload after a few seconds.
2. The target list is empty. `pingboard list` prints nothing but an empty line.
3. `pingboard serve` reads another data file than the one you added targets to, because `PINGBOARD_DATA` differs between the two shells or users.

**Fix:** for the third cause, run `pingboard add` with the same `PINGBOARD_DATA` as the server, as the same user if you rely on the default path.

**Check:** the target appears after the next cycle.

## A removed target is still shown

**You see:** a target you removed with `pingboard remove` stays on the dashboard, in `/api/status` and in `/metrics`, with its last result.

**Cause:** the check loop stops checking a removed target, but its last result stays in memory.

**Fix:** restart `pingboard serve`.

**Check:** after the first cycle the dashboard lists only the current targets.

## A target is DOWN but opens in a browser

**You see:** `DOWN` for a URL that works when you open it yourself.

**Confirm:** run a single check and read the status and the error.

```bash
pingboard check --json
```

**Causes, most likely first:**

1. Status `0` and an error that mentions a timeout: the target answers more slowly than `PINGBOARD_TIMEOUT` (default 5 seconds). Raise the timeout.
2. Status `0` and a DNS or connection error: the machine that runs pingboard cannot reach the target, although yours can. Test from that machine.
3. A status of 400 or above, such as 401 or 403: the target wants a login or refuses the client. pingboard sends a plain GET request with `User-Agent: pingboard` and nothing else, and counts every status of 400 or above as down.

**Check:** `pingboard check` prints `up` for the target and exits with status 0 when everything is up.

## Results arrive less often than the interval

**You see:** the time between two checks of the same target is longer than `PINGBOARD_INTERVAL`.

**Cause:** targets are checked one after another, and the pause starts when the cycle ends. A cycle with unreachable targets can take up to `PINGBOARD_TIMEOUT` seconds for each of them.

**Fix:** lower `PINGBOARD_TIMEOUT`, or remove targets that are permanently down.

**Check:** compare two readings of `pingboard_checks_total` taken a known time apart.

## is not in the list

**You see:** `pingboard: <url> is not in the list` from `pingboard remove`.

**Cause:** the URL does not match an entry exactly. A trailing slash or `http` instead of `https` makes it a different target.

**Fix:** copy the URL from the output of `pingboard list`.
