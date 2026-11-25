# System overview

This chapter describes what happens on the machine when csvjoin runs, so that the later
chapters on settings, signals and failures have something to refer to.

csvjoin is one Python script, `csvjoin.py`, that runs as one short-lived process. It reads
two CSV files, matches their rows on one shared column, writes the joined rows as CSV, and
exits. There is no server, no background process, no configuration file and no state kept
between runs. The script imports only the Python standard library and opens no network
connection.

## One run, step by step

1. **Start.** Python loads the script. The row limit `CSVJOIN_MAX_ROWS` is read from the
   environment at this point, before the arguments are parsed.
2. **Read the left file, then the right file.** Each file is opened with the encoding from
   `--encoding`, parsed with the separator from `--delimiter`, and loaded completely into
   memory. The first line of each file is its header. A file with more data rows than the
   row limit stops the run.
3. **Check the key column.** The column named by `--on` must be in the header of each file
   that has at least one data row. A file with a header and no data rows is not checked.
4. **Join.** The rows of the right file are grouped by their key value. Each left row is
   then paired with every right row that has the same key value.
5. **Write.** The header and all result rows are written in one go, to standard output or to
   the file named by `--output`. Nothing is written before both inputs have been read and
   joined.
6. **Exit.** The exit status says whether the run succeeded; see
   [Metrics and logs](../monitoring/signals.md).

## What the join produces

| Aspect | Behaviour |
|---|---|
| Key comparison | Exact text comparison. `1`, `01` and ` 1` are three different keys; nothing is trimmed or converted to a number. |
| Columns | All columns of the left file in their order, then the columns of the right file in their order without the key column. |
| Row order | The order of the left file. A left row with several matches produces one row per match, in the order of the right file. With `--how outer`, the right rows that matched nothing come last, in the order of the right file. |
| Repeated keys | Every matching pair is written. Two left rows and three right rows with the same key give six rows. |
| `--how inner` | Only left rows that have at least one match. |
| `--how left` | As `inner`, plus every left row without a match, with the right-hand columns empty. |
| `--how outer` | As `left`, plus every right row whose key is not in the left file, with the left-hand columns empty. |
| Rows shorter than the header | The missing cells are written as empty. |
| A non-key column name used in both files | The name appears twice in the output header and both cells carry the value from the right file. The left value is lost; rename the column in one file first. |

## Resources and state

| Resource | Use |
|---|---|
| Memory | Both input files and the complete result are held in memory at the same time. Memory use grows with the size of the inputs and of the result. |
| Disk | Reads the two input files. Writes only the file named by `--output`, which is created or overwritten. No temporary files, no cache. |
| Network | None. |
| State between runs | None. Running the same command on the same files gives the same output. |
