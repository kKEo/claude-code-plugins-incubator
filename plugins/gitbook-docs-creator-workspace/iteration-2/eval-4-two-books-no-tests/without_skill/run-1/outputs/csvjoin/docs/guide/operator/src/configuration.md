# Configuration

csvjoin has one setting, an environment variable. Everything else is a command line option, described in the User Guide.

## `CSVJOIN_MAX_ROWS`

| | |
| --- | --- |
| Meaning | Largest number of data rows allowed in each input file |
| Default | `1000000` |
| Value | A whole number |

When an input has more data rows than the limit, csvjoin stops with exit code 1 and writes no output:

```text
csvjoin: big.csv has 1500000 rows, more than CSVJOIN_MAX_ROWS=1000000
```

Details that matter when you choose a value:

* The limit applies to each input separately. The header row does not count.
* A file with exactly the limit is accepted.
* The output is not limited. A join on a value that repeats in both files can produce far more rows than either input.
* The check runs after the file has been read into memory. The limit stops an oversized join, not the read. See [Limits and resource use](limits.md).
* A value that is not a whole number makes csvjoin fail at start-up with a Python `ValueError` traceback and exit code 1.
* `0` rejects every file that has data rows. There is no value that means "unlimited"; set a large number.

## Set it for one run

```sh
CSVJOIN_MAX_ROWS=5000000 csvjoin left.csv right.csv --on id -o joined.csv
```

## Set it for all users

Export it from a profile script, for example `/etc/profile.d/csvjoin.sh`:

```sh
export CSVJOIN_MAX_ROWS=250000
```

This is a default, not an enforcement: any user can override an environment variable. To cap resource use for real, limit memory at the operating system level, as shown in [Limits and resource use](limits.md).

## Set it in a container

```sh
docker run --rm -e CSVJOIN_MAX_ROWS=250000 -v "$PWD:/data" csvjoin /data/l.csv /data/r.csv --on id
```

## Output encoding on standard output

With `--output`, the result is always UTF-8. On standard output, Python picks the encoding from the environment, which under cron or in a minimal container may be ASCII and then fails on non-ASCII data with `UnicodeEncodeError`. For unattended runs, either use `--output` or force UTF-8:

```sh
PYTHONUTF8=1 csvjoin left.csv right.csv --on id > joined.csv
```
