# Troubleshooting

## The service does not start

| Message | Cause | Fix |
| --- | --- | --- |
| `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` | Interval below 5 | Set it to 5 or more |
| `ValueError: invalid literal for int()` | `PINGBOARD_PORT` or `PINGBOARD_INTERVAL` is not an integer | Correct the value |
| `ValueError: could not convert string to float` | `PINGBOARD_TIMEOUT` is not a number | Correct the value |
| `ValueError: Unknown level` | Unknown `PINGBOARD_LOG_LEVEL` | Use `debug`, `info`, `warning`, `error` or `critical` |
| `OSError: ... Address already in use` | Another process uses the port | Change `PINGBOARD_PORT` or stop the other process |
| `PermissionError` at start | A port below 1024 without the privilege to bind it | Use a higher port |

## Results no longer change

Symptom: the dashboard and `/api/status` show the same values for a long
time, `pingboard_checks_total` stays constant, `/healthz` still answers `ok`.

Cause: the check loop has ended. The usual reason is a targets file that could
not be read: invalid JSON, a missing `targets` key or missing read permission.
Look for a traceback that starts with `Exception in thread` in the log.

Fix: repair the file, then restart the service. The loop does not recover on
its own. Validate the file with:

    python3 -m json.tool "$PINGBOARD_DATA"

A constant counter is also normal when the list of targets is empty.

## New targets do not appear

- The command-line tool and the service use different targets files. Compare
  `PINGBOARD_DATA` of both. Without the variable, each user gets a file in
  their own home directory.
- The service user cannot read the file.
- The current round has not finished. With many slow targets a round can take
  a long time.

## A removed target is still shown

This is how pingboard works: results of removed targets stay in memory.
Restart the service.

## Rounds take too long

Checks run one after another, and every target that hangs costs a full
timeout. Lower `PINGBOARD_TIMEOUT`, remove dead targets or split the list
over several instances.

## A target is reported as down although it works

Run the check from the same host and as the same user as the service:

    pingboard check --json

Read `status` and `error` of the target:

| Observation | Likely cause |
| --- | --- |
| `status` 0, error mentions a timeout | Target slower than `PINGBOARD_TIMEOUT`, or blocked by a firewall |
| `status` 0, error mentions name resolution | DNS on the host cannot resolve the name |
| `status` 0, error mentions a certificate | Certificate not trusted by the Python installation |
| `status` 401 or 403 | Target needs a login or blocks the user agent `pingboard` |
| `status` 405 | Target does not accept `GET` |

## The dashboard is reachable only on the host itself

The default bind address is `127.0.0.1`. See [Deployment](deployment.md#expose-the-dashboard).
