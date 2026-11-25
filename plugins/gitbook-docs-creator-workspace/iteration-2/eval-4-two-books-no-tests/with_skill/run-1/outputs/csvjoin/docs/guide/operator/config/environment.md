# Environment variables and settings

This page lists every setting csvjoin reads from its environment. There is one. csvjoin
reads no configuration file; everything else is set per run with the flags in
[Commands and flags](commands.md).

The values come from `csvjoin.py`, which reads the environment once, when the process
starts.

| Variable | Type | Default | Effect |
|---|---|---|---|
| `CSVJOIN_MAX_ROWS` | integer | `1000000` | The largest number of data rows allowed in each input file. The header line is not counted. The limit applies to each file separately, not to the result. A file with more rows stops the run with exit status 1 and the message `csvjoin: <file> has <n> rows, more than CSVJOIN_MAX_ROWS=<limit>`. |

## Notes on `CSVJOIN_MAX_ROWS`

- The limit is checked after the whole file has been read into memory. It stops a join that
  is too large from running; it does not cap the memory used to read the file.
- A file with exactly the limit is accepted.
- The value must be a whole number. Anything else stops the process at start with a Python
  traceback that ends in `ValueError: invalid literal for int() with base 10`, before any
  file is read and even for `--help`.

Set it for one run:

```bash
CSVJOIN_MAX_ROWS=5000000 python3 csvjoin.py left.csv right.csv --on id
```
