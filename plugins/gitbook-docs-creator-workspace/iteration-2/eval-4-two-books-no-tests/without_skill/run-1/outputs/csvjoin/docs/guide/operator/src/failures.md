# Failures and exit codes

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The join completed and the result was written. |
| `1` | The run failed: a csvjoin error message or a Python traceback is on standard error. |
| `2` | The command line was wrong. A usage summary is on standard error. |

`--help` exits with 0.

## Failures csvjoin reports itself

These print one line that starts with `csvjoin:` and exit with 1. No output is written.

| Message | Cause | Action |
| --- | --- | --- |
| `csvjoin: FILE has no column called NAME` | The first data row of `FILE` has no column named by `--on`. | Check the header, the delimiter and for a byte order mark. |
| `csvjoin: FILE has N rows, more than CSVJOIN_MAX_ROWS=M` | The input exceeds the row limit. | Raise `CSVJOIN_MAX_ROWS` if the machine has the memory, or split the input. |

## Failures that surface as Python tracebacks

csvjoin does not catch these. They exit with 1, and the last line of the traceback names the cause.

| Last line starts with | Cause | Action |
| --- | --- | --- |
| `FileNotFoundError` | An input path does not exist, or the folder of the output path does not exist. | Fix the path. Under cron, use absolute paths. |
| `PermissionError` | No read access to an input or no write access to the output. | Fix ownership or mode. |
| `IsADirectoryError` | A path points to a folder. | Fix the path. |
| `UnicodeDecodeError` | An input is not in the encoding given by `--encoding` (default UTF-8). | Pass the right `--encoding`. |
| `UnicodeEncodeError` | Standard output cannot represent a character. | Use `--output` or set `PYTHONUTF8=1`. |
| `LookupError: unknown encoding` | The `--encoding` name is not a Python codec. | Use a valid codec name. |
| `TypeError: "delimiter" must be a 1-character string` | `--delimiter` is not exactly one character. | Pass one character. |
| `ValueError: invalid literal for int()` | `CSVJOIN_MAX_ROWS` is not a whole number. | Fix the variable. |
| `ValueError: dict contains fields not in fieldnames` | The left file has no data rows and right rows are kept (`--how outer`). The output file is left with a header only. | Put the file that has rows on the left, or skip the join when an input is empty. |
| `MemoryError`, or the process is killed | The inputs or the result do not fit in memory. | See [Limits and resource use](limits.md). |
| `BrokenPipeError` | The program reading csvjoin's output closed the pipe early, for example `head`. | Harmless if intended. |

## State after a failure

* Input files are never modified.
* Failures before writing starts leave an existing `--output` file untouched. That covers both `csvjoin:` messages and all read errors.
* A failure while writing leaves a truncated or partial `--output` file. Write to a temporary name and rename on success, as described in [Running unattended](automation.md).
* A failed run can simply be started again. There is nothing to clean up apart from a partial output file.

## Reporting a problem

Open an issue at <https://github.com/example/csvjoin/issues> with the full command line, the complete error output, the Python version (`python3 --version`) and, if possible, a few lines of each input that reproduce the problem.
