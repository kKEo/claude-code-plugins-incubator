# Running a one-off check

`pingboard check` tests every target once, one after another, prints the
results and exits.

    pingboard check

## Reading the output

    up   200   142 ms  https://example.com
    DOWN 404    87 ms  https://example.org/missing
    DOWN   0  5003 ms  https://slow.example.net

| Column | Meaning |
| --- | --- |
| State | `up` or `DOWN` |
| Status | The HTTP status code. `0` means that no HTTP answer arrived at all: the host name did not resolve, the connection was refused or the request timed out |
| Time | How long the check took, in milliseconds |
| Target | The URL that was checked |

## Exit code

| Exit code | Meaning |
| --- | --- |
| `0` | Every target is up, or the list is empty |
| `1` | At least one target is down |

This makes the command easy to use in scripts:

    pingboard check || echo "something is down"

## Stop at the first failure

    pingboard check --fail-fast

pingboard stops as soon as one target is down and does not check the remaining
targets. Use it when you only need a yes-or-no answer quickly.

## JSON output

    pingboard check --json

The human-readable lines are replaced by one JSON array, printed after all
checks have finished:

    [{"url": "https://example.com", "up": true, "status": 200, "millis": 142, "error": ""},
     {"url": "https://example.org/missing", "up": false, "status": 404, "millis": 87, "error": "HTTP Error 404: Not Found"}]

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The target |
| `up` | boolean | `true` when the target is up |
| `status` | number | HTTP status code, or `0` when no HTTP answer arrived |
| `millis` | number | Duration of the check in milliseconds |
| `error` | string | Reason for a failure; empty when the target is up |

The exit code is the same as without `--json`. With `--fail-fast`, the array
holds only the targets that were checked before pingboard stopped.

## Changing the timeout

A target has 5 seconds to answer. Set `PINGBOARD_TIMEOUT` to change that:

    PINGBOARD_TIMEOUT=10 pingboard check
