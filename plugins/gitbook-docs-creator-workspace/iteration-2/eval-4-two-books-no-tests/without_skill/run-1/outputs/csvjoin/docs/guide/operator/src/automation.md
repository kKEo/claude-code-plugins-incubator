# Running unattended

## What goes where

| Stream | Content |
| --- | --- |
| Standard output | The joined CSV, unless `--output` is given |
| Standard error | Error messages, and with `--output` the line `csvjoin: wrote N rows to FILE` |

csvjoin never prompts and never reads standard input, so it is safe to run without a terminal.

## Check the exit code

Exit code 0 means the join completed. Anything else means the result must not be used. See [Failures and exit codes](failures.md).

```sh
#!/bin/sh
set -eu
csvjoin /data/in/customers.csv /data/in/orders.csv --on customer_id --how left \
    --output /data/out/report.csv.tmp
mv /data/out/report.csv.tmp /data/out/report.csv
```

## Write to a temporary name, then rename

csvjoin opens the `--output` file and writes into it directly. It overwrites an existing file without asking, and a run that fails while writing leaves a partial file behind. Writing to a temporary name and renaming on success, as in the script above, keeps consumers from picking up half a result.

The same applies to shell redirection: `csvjoin ... > report.csv` empties `report.csv` before csvjoin starts, even if csvjoin then fails.

## cron

```cron
CSVJOIN_MAX_ROWS=2000000
15 2 * * * /usr/local/bin/csvjoin /data/in/a.csv /data/in/b.csv --on id -o /data/out/ab.csv.tmp 2>>/var/log/csvjoin.log && mv /data/out/ab.csv.tmp /data/out/ab.csv
```

cron runs with a minimal environment. Use absolute paths, set `CSVJOIN_MAX_ROWS` in the crontab if you rely on a non-default value, and prefer `--output` over redirection so the output encoding is fixed to UTF-8.

## Logging

csvjoin writes no log file. Capture standard error if you want a record. A successful run with `--output` logs one line:

```text
csvjoin: wrote 48211 rows to /data/out/ab.csv
```

A run without `--output` logs nothing on success. The row count is the number of data rows, without the header.

## Concurrent runs

Runs share nothing, so any number can run at once as long as they write to different output files and the machine has memory for all of them.

## Output format for downstream tools

* Header row first, then data rows.
* CRLF line endings. Tools that expect LF only may need `tr -d '\r'`.
* The delimiter is the one given with `--delimiter`.
* Row order is deterministic: left file order, then for `--how outer` the unmatched right rows in right file order.
