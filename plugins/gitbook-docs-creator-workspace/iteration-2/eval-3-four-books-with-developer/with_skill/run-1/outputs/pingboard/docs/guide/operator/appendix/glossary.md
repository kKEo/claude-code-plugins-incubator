# Glossary

These are the project words this guide uses, with the name each has in the code where that differs.

| Term | Meaning |
|---|---|
| Check | One HTTP `GET` request to a target and the decision whether it is up. `check()` in the code. |
| Checker thread | The background thread of `pingboard serve` that runs the rounds. `loop()` in the code. |
| Dashboard | The HTML page at `/` of the `serve` process; also used for the process as a whole. |
| Down | The state of a target whose latest check did not get a response with a status below 400 in time. Printed as `DOWN`. |
| Interval | The pause between two rounds, `PINGBOARD_INTERVAL` seconds. |
| Result | The outcome of one check: `url`, `up`, `status`, `millis` and `error`. `Result` in the code. |
| Round | One pass of the checker thread over the list: read the targets file, check every target, sleep. The code has no name for it. |
| Target | One URL in the list. |
| Targets file | The JSON file that holds the list, at `PINGBOARD_DATA`. `data_file` in the code. |
| Timeout | The longest one check waits for a response, `PINGBOARD_TIMEOUT` seconds. |
| Up | The state of a target whose latest check got a response with a status below 400 within the timeout. |
