# Glossary

The words this guide uses with a fixed meaning, in alphabetical order, with the name each has in the code where it differs.

**Check.** One HTTP GET request to one target, and its result. In the code: `check.check()`, which returns a `Result`.

**Check loop.** The background thread of `pingboard serve` that runs one cycle after another. In the code: `server.loop()`.

**Cycle.** One pass of the check loop: read the targets file, check every target in turn, sleep for the interval.

**Dashboard.** The HTML page that `pingboard serve` returns at `/`.

**Down.** The state of a target whose last check returned a status of 400 or above, or no response. Shown as `DOWN`, as `"up": false` and as `pingboard_target_up` `0`.

**Interval.** The time the check loop sleeps between two cycles, set with `PINGBOARD_INTERVAL`.

**Result.** What one check records: `url`, `up`, `status`, `millis` and `error`.

**Target.** One URL in the list that pingboard checks.

**Targets file.** The JSON file that holds the list of targets, by default `~/.pingboard/targets.json`. In the code: `Config.data_file`.

**Timeout.** How long one check waits for the target, set with `PINGBOARD_TIMEOUT`.

**Up.** The state of a target whose last check returned a status below 400.
