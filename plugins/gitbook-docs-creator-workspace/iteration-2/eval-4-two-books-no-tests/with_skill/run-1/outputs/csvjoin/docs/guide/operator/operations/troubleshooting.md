# Troubleshooting runbook

This page has one section per failure, named by the text csvjoin or Python prints, with the
cause and the fix. csvjoin keeps no state, so there is nothing to back up or restore: after
a fix, run the same command again.

For a traceback, the last line is the one to search for on this page.

## `csvjoin: <file> has no column called <name>`

Confirm: print the header of the file that the message names.

```bash
head -n 1 left.csv
```

Causes, most likely first:

1. The name given to `--on` differs from the header, for example in upper and lower case or
   by a space. Fix: pass the name exactly as the header has it, in quotes if it contains a
   space.
2. The file uses another separator, so the whole header is read as one column. Fix: pass
   the separator with `--delimiter`, for example `--delimiter ';'`.
3. The file starts with a byte order mark, which spreadsheet programs add when they save
   "CSV UTF-8". The mark becomes part of the first column name. Fix: pass
   `--encoding utf-8-sig`.

Check: the command prints a header line that contains the key column once.

## `csvjoin: <file> has <n> rows, more than CSVJOIN_MAX_ROWS=<limit>`

Cause: the file has more data rows than the limit, which is `1000000` unless it was set.

Fix: when the machine has the memory for it, raise the limit for the run. Both files and the
result are held in memory.

```bash
CSVJOIN_MAX_ROWS=5000000 python3 csvjoin.py left.csv right.csv --on id
```

See [Environment variables and settings](../config/environment.md).

## `ValueError: invalid literal for int() with base 10`

Cause: `CSVJOIN_MAX_ROWS` is set to something that is not a whole number. The traceback
points at the line that reads `CSVJOIN_MAX_ROWS`.

Confirm and fix:

```bash
echo "$CSVJOIN_MAX_ROWS"
unset CSVJOIN_MAX_ROWS
```

## `FileNotFoundError: [Errno 2] No such file or directory`

Cause: an input path does not exist, or the directory of the `--output` path does not
exist. The message ends with the path that was not found.

Fix: correct the path, or create the output directory first. csvjoin does not create
directories.

## `UnicodeDecodeError: 'utf-8' codec can't decode byte …`

Cause: an input file is not UTF-8, which is the default for `--encoding`.

Fix: pass the encoding the file was saved in, for example `--encoding latin-1`. The same
encoding is used for both inputs, so convert one file first when the two differ.

## `LookupError: unknown encoding`

Cause: the value of `--encoding` is not a codec name Python knows.

Fix: use a Python codec name such as `utf-8`, `utf-8-sig` or `latin-1`.

## `TypeError: "delimiter" must be a 1-character string`

Cause: the value of `--delimiter` is empty or longer than one character.

Fix: pass exactly one character. For a tab in bash, write `--delimiter $'\t'`.

## `ValueError: dict contains fields not in fieldnames: None`

Cause: a data row has more cells than the header of its file.

Fix: repair the file so that every row has at most as many cells as the header. Unquoted
separators inside a value are the usual reason.

> **Note.** When the first data row of a file is the one with too many cells, the run does
> not fail. The output then has a column with an empty name, and the extra cells appear in
> it as text such as `['extra']`. The fix is the same.

## `ValueError: dict contains fields not in fieldnames: '<name>'`

Here `<name>` is the key column.

Cause: `--how outer` was used and the left file has a header but no data rows. csvjoin
takes the left-hand columns from the first data row of the left file, so with no rows it
has no key column to write the right-hand rows under.

Fix: swap the two files on the command line and use `--how left`. The result has the same
rows; the columns of the file that has data come first.

## The result has fewer rows than expected

Confirm: look at the key values of a row that is missing, in both files.

Causes, most likely first:

1. The default `--how inner` drops rows without a match. Fix: use `--how left` or
   `--how outer`.
2. The key values differ as text. `1` and `01` do not match, and neither do `1` and ` 1`.
   Fix: make the values identical in the files before joining.

## The result has more rows than expected

Cause: a key value occurs more than once in a file. Every matching pair is written.

Fix: remove the repeated rows from the input, or accept the extra rows. See
[System overview](../intro/overview.md).

## A column appears twice with the same values

Cause: both files have a column with the same name that is not the key column. The output
repeats the name, and both cells carry the value from the right file.

Fix: rename the column in one of the files before joining.

## Accented letters are wrong in the result

Cause: the inputs were read with the wrong encoding, or the program that opens the result
expects another encoding. A file written with `--output` is always UTF-8.

Fix: pass the encoding of the inputs with `--encoding`, and open the result as UTF-8.
