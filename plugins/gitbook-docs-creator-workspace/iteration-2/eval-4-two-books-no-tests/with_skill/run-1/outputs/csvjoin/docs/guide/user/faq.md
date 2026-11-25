# Questions and troubleshooting

This page answers common questions and explains the messages you may see when something
goes wrong. Find the heading that matches your question or the last line of the message.

## Why are some of my rows missing?

Rows are left out when the other file has no row with the same value in the shared column.
To keep them, add `--how left` or `--how outer`; see [Everyday use](everyday-use.md).

If the rows should have matched, the values are not exactly the same. `1` and `01`, or
`Ada` and `ada`, do not match. Neither does a value with a space before or after it.

## Why do I get more rows than I started with?

A value in the shared column is in one of the files more than once. Each row is combined
with every row it matches, so one person with two cities becomes two rows.

## "has no column called …"

csvjoin could not find the column you named with `--on` in the first line of that file.
Try these in order:

1. Check the spelling, including capital letters. Put the name in quotes if it has a space.
2. If the file uses semicolons or tabs, add `--delimiter`; see [Everyday use](everyday-use.md).
3. If the file was saved from a spreadsheet as "CSV UTF-8", add `--encoding utf-8-sig`.

## "has … rows, more than CSVJOIN_MAX_ROWS=1000000"

The file is larger than csvjoin accepts by default, which is 1,000,000 rows per file. You
can raise the limit for one run by putting the new limit in front of the command:

```bash
CSVJOIN_MAX_ROWS=5000000 python3 csvjoin.py left.csv right.csv --on id
```

Very large files need a lot of memory. If the computer becomes slow, ask the person who
looks after it, and point them to the
[operator guide](../operator/config/environment.md).

## "No such file or directory"

A file name is wrong, or the file is in another folder. Check the two names you typed. If
you used `-o` with a folder in the name, that folder has to exist already.

## "codec can't decode byte …"

The file was not saved as UTF-8. Add `--encoding` with the way it was saved, for example
`--encoding latin-1`; see [Everyday use](everyday-use.md).

## "the following arguments are required"

Something is missing from the command. csvjoin always needs two file names and `--on` with
the name of the shared column.

## Why does a column appear twice with the same values?

Both files have a column with that name. Rename the column in one of the files and join
again; see [Trust and privacy](trust.md).

## Can I join more than two files?

Not in one go. Join two, save the result with `-o`, then join that result with the third
file.

## Does csvjoin change my original files?

No. It only reads them. The only file it writes is the one you name with `-o`.

## The message is not listed here

The [operator guide](../operator/operations/troubleshooting.md) lists every message with
its cause and fix.
