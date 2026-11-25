# Limits and resource use

## Memory

csvjoin reads both input files completely into memory, builds the whole result in memory, and only then writes it. Nothing is streamed.

Plan for peak memory of several times the combined size of the two input files, and more when the join multiplies rows. Python stores every row as a dictionary of strings, which takes much more space than the same row on disk. Measure with your own data before you settle on a row limit:

```sh
/usr/bin/time -v csvjoin left.csv right.csv --on id -o /dev/null   # Linux: "Maximum resident set size"
/usr/bin/time -l csvjoin left.csv right.csv --on id -o /dev/null   # macOS: "maximum resident set size"
```

## The row limit is not a memory limit

`CSVJOIN_MAX_ROWS` is checked after a file has been loaded. An oversized file is therefore read fully before it is rejected, and the limit says nothing about row width or about the size of the result. Described in [Configuration](configuration.md).

To bound memory reliably, use the operating system:

```sh
# shell: cap address space at about 2 GB for this run
( ulimit -v 2097152; csvjoin left.csv right.csv --on id -o joined.csv )

# systemd
systemd-run --scope -p MemoryMax=2G csvjoin left.csv right.csv --on id -o joined.csv

# container
docker run --rm --memory 2g -v "$PWD:/data" csvjoin /data/l.csv /data/r.csv --on id
```

## Result size

The number of output rows is not capped. If a join value appears `m` times on the left and `n` times on the right, it produces `m × n` rows. Empty join values match each other too, so two files that each have thousands of rows with an empty key produce millions of rows. Check key quality on new data sources before scheduling a join.

## CPU and disk

csvjoin uses one CPU core. Matching uses a hash index on the right file, so run time grows with input size plus output size. With `--how outer`, each unmatched candidate on the right is checked against a set, which is equally cheap.

Disk is used only for the output file. No temporary files are created.

## Input assumptions

csvjoin does not validate its input beyond the join column. Know these before you feed it data you do not control:

| Input | Behaviour |
| --- | --- |
| File with a header but no data rows on the right | Works. The right file adds no columns. |
| File with a header but no data rows on the left | Output loses the left columns, including the join column. With `--how outer` and rows on the right, csvjoin fails with a `ValueError` traceback. |
| Row with fewer fields than the header | Missing fields are written as empty. |
| Row with more fields than the header | Not rejected. The output gets a nameless column holding text such as `['extra']`. |
| Same column name in both files, other than the join column | Column appears twice in the output with the same value in both. |
| Byte order mark at the start | Becomes part of the first column name unless `--encoding utf-8-sig` is used. |
| Inputs with different delimiters or encodings | Not supported. One `--delimiter` and one `--encoding` apply to both. |

The existence of the join column is checked on the first data row of each file, so a file without data rows passes the check.
