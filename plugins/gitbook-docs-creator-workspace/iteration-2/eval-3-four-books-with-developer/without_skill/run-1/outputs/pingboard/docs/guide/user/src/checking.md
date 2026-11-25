# Checking once

`pingboard check` requests every target once, prints the results and exits.

```
pingboard check
```

```
up   200   142 ms  https://example.org
DOWN 503    87 ms  https://example.org/health
DOWN   0  5003 ms  https://unreachable.example
```

## Reading a line

| Column | Meaning |
| --- | --- |
| `up` or `DOWN` | The state of the target |
| Number | The HTTP status of the answer. `0` means there was no answer at all: the name did not resolve, the connection was refused or the request timed out |
| `ms` | How long the request took, in milliseconds |
| URL | The target |

Details that help you interpret the result:

* pingboard sends a GET request with the header `User-Agent: pingboard`.
* Redirects are followed. The status shown is the status of the final page.
* A target is up when the status is below 400. Statuses from 400 upwards, for example 404 or 503, count as down.
* Targets are checked one after another, in the order of the list.

## Exit status

| Exit status | Meaning |
| --- | --- |
| `0` | Every target is up, or the list is empty |
| `1` | At least one target is down |

This makes the command usable in scripts:

```
pingboard check || echo "something is down"
```

## Stop at the first failure

```
pingboard check --fail-fast
```

With `--fail-fast`, pingboard stops as soon as one target is down. Targets later in the list are not checked.

## JSON output

```
pingboard check --json
```

```json
[{"url": "https://example.org", "up": true, "status": 200, "millis": 142, "error": ""},
 {"url": "https://unreachable.example", "up": false, "status": 0, "millis": 5003, "error": "<urlopen error timed out>"}]
```

With `--json`, pingboard prints nothing until all checks are done, and then prints one JSON array on a single line. (The example above is wrapped for readability.) Each entry has these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The target |
| `up` | boolean | `true` when the target is up |
| `status` | number | HTTP status, or `0` when there was no answer |
| `millis` | number | Response time in milliseconds |
| `error` | string | The reason for a failure; empty when the target is up |

The `error` field is the quickest way to learn why a target is down, because the plain output does not show it.

## Change the timeout

A check waits 5 seconds for an answer. Set `PINGBOARD_TIMEOUT` to a number of seconds to change this:

```
PINGBOARD_TIMEOUT=2 pingboard check
```
