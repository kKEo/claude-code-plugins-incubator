# Everyday use

This page shows the common jobs you do with csvjoin, one at a time, each with one example.

In every example, `left.csv` and `right.csv` stand for your own two files. The file you name
first is the *left file*; the one you name second is the *right file*. Type the commands in
a terminal, in the folder that holds `csvjoin.py`.

## Combine two files that share a column

Use this when two files describe the same things and you want one table. Name both files,
then say which column they share with `--on`.

```bash
python3 csvjoin.py left.csv right.csv --on id
```

The result appears in the terminal. It has the columns of the left file, then the columns of
the right file. You get the rows whose value in the shared column is in both files.

## Save the result to a file

Add `-o` and a file name. Without it, the result is only shown in the terminal.

```bash
python3 csvjoin.py left.csv right.csv --on id -o joined.csv
```

csvjoin tells you how many rows it wrote.

> **Warning.** If `joined.csv` already exists, it is replaced without a question.

## Keep rows that have no match

Normally a row is left out when the other file has nothing for it. To keep such rows, say
which ones with `--how`.

| You want | Add |
|---|---|
| Only rows found in both files | nothing, or `--how inner` |
| Every row of the left file | `--how left` |
| Every row of both files | `--how outer` |

```bash
python3 csvjoin.py left.csv right.csv --on id --how left
```

Where a row has no match, the cells from the other file are empty.

## Join files that use semicolons or tabs

Some programs separate values with a semicolon or a tab instead of a comma. Tell csvjoin
with `--delimiter`. Both files must use the same separator, and the result uses it too.

```bash
python3 csvjoin.py left.csv right.csv --on id --delimiter ';'
```

## Join files with accented letters that come out wrong

Files are read as UTF-8, the most common way of storing text. If a file was saved in another
way, name it with `--encoding`. Both files must be saved the same way.

```bash
python3 csvjoin.py left.csv right.csv --on id --encoding latin-1
```

For a file saved from a spreadsheet as "CSV UTF-8", use `--encoding utf-8-sig`.

## Join on a column whose name has a space

Put the name in quotes, spelled exactly as in the first line of the files.

```bash
python3 csvjoin.py left.csv right.csv --on "Customer ID"
```

## See all options

```bash
python3 csvjoin.py --help
```

The [operator guide](../operator/config/commands.md) explains every option in full.
