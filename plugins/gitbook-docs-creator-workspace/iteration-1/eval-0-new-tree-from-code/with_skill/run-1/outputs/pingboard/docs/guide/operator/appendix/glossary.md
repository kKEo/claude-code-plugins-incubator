# Glossary

The project words this guide uses, in alphabetical order, with the name each has in the code.

**Check.** One GET request to one target, and its outcome. In the code: `check.check`, which returns a `Result`.

**Check loop.** The background thread of `pingboard serve` that runs one cycle after another. In the code: `server.loop`.

**Cycle.** One pass of the check loop over the whole target list, followed by a pause of `PINGBOARD_INTERVAL` seconds.

**Dashboard.** The HTML page at `/` that shows the latest result of every target.

**Data file.** The JSON file that holds the target list. Its path is `PINGBOARD_DATA`; in the code: `Config.data_file`.

**Down.** The state of a target whose latest check got a status of 400 or above, or no response within the timeout. Shown as `DOWN`.

**Interval.** The pause between two cycles, in seconds. The setting `PINGBOARD_INTERVAL`.

**Result.** The outcome of one check: `url`, `up`, `status`, `millis` and `error`. In the code: the dataclass `check.Result`.

**Setting.** One of the six environment variables that `config.load()` reads.

**Target.** One URL in the list, starting with `http://` or `https://`.

**Target list.** All targets, stored sorted and without duplicates under the key `targets` in the data file.

**Timeout.** How long one check waits for the target, in seconds. The setting `PINGBOARD_TIMEOUT`.

**Up.** The state of a target whose latest check got a status below 400 within the timeout.
