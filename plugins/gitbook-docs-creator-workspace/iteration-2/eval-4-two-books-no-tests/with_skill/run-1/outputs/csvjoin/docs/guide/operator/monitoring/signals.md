# Metrics and logs

This page lists the signals csvjoin gives about a run. csvjoin has no log file, no metrics,
no health check and no traces. A run is healthy when it exits with status 0; the exit status
and standard error are the only signals, so a script or scheduler that runs csvjoin has to
check them.

## Exit status

| Status | Meaning |
|---|---|
| `0` | The join finished and the result was written. Also returned by `--help`. |
| `1` | The run failed. Either csvjoin stopped with a message that starts with `csvjoin:`, or Python stopped with a traceback. |
| `2` | The command line was wrong: a required argument is missing or a value is not allowed. The usage text and a line that starts with `csvjoin: error:` are printed. |

## Standard error

Everything csvjoin says about a run goes to standard error, so it never mixes with the CSV
on standard output.

| Message | When |
|---|---|
| `csvjoin: wrote <n> rows to <file>` | Success, when `--output` is used. `<n>` counts data rows, not the header. Without `--output` a successful run prints nothing to standard error. |
| `csvjoin: <file> has <n> rows, more than CSVJOIN_MAX_ROWS=<limit>` | An input file is over the row limit. Exit status 1. |
| `csvjoin: <file> has no column called <name>` | The column named by `--on` is not in that file's header. Exit status 1. |
| `csvjoin: error: …` after the usage text | The command line was wrong. Exit status 2. |
| A Python traceback | Any other failure, such as a missing file or a wrong encoding. Exit status 1. The last line names the cause. |

[Troubleshooting runbook](../operations/troubleshooting.md) has the fix for each message.

## What to alert on

When csvjoin runs unattended, alert on any exit status other than 0 and keep standard error
with the alert.

A run that fails before the write step leaves the `--output` file untouched. A run that fails
during the write step can leave it empty or with the header only. Treat the output file as
valid only after exit status 0.

```bash
python3 csvjoin.py left.csv right.csv --on id -o joined.csv 2> csvjoin.err || echo "csvjoin failed: $(tail -n 1 csvjoin.err)"
```
