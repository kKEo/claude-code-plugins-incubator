# Commands and flags

This page lists every argument csvjoin accepts. csvjoin has one command and no
subcommands. The table follows the argument parser in `csvjoin.py`; `python3 csvjoin.py --help`
prints the same list.

```text
usage: csvjoin [-h] --on ON [--how {inner,left,outer}] [--delimiter DELIMITER]
               [--encoding ENCODING] [--output OUTPUT]
               left right
```

## Positional arguments

| Argument | Required | Purpose |
|---|---|---|
| `left` | yes | Path of the first CSV file. Its columns come first in the output and its row order sets the order of the result. |
| `right` | yes | Path of the second CSV file. Its columns follow, without the key column. |

## Flags

| Flag | Value | Default | Purpose | Example |
|---|---|---|---|---|
| `--delimiter` | one character | `,` | Field separator of both inputs and of the output. | `--delimiter ';'` |
| `--encoding` | a Python codec name | `utf-8` | Text encoding of both inputs. It does not change the encoding of the output. | `--encoding latin-1` |
| `--help`, `-h` | none | | Print the usage text and exit with status 0. | `--help` |
| `--how` | `inner`, `left` or `outer` | `inner` | Which rows to keep. | `--how left` |
| `--on` | column name | none; required | Name of the column both files share. Matched exactly against the header, including upper and lower case. | `--on id` |
| `--output`, `-o` | file path | standard output | Write the result to this file instead of standard output. An existing file is overwritten. The directory must exist. | `-o joined.csv` |

## What `--how` keeps

| Value | Rows in the result |
|---|---|
| `inner` | Rows whose key value is in both files. |
| `left` | Every row of the left file. Columns from the right file are empty where there is no match. |
| `outer` | Every row of both files. Columns from the other file are empty where there is no match. |

[System overview](../intro/overview.md) describes column order, row order and repeated
keys.

## Output encoding

With `--output` the file is always written as UTF-8, whatever `--encoding` says. Without
`--output` the result goes to standard output in the encoding Python chooses for the
terminal or pipe.

## Examples

Join on `id` and print the result:

```bash
python3 csvjoin.py left.csv right.csv --on id
```

Keep every row of both files and write the result to a file:

```bash
python3 csvjoin.py left.csv right.csv --on id --how outer -o joined.csv
```

Join two semicolon-separated files saved by a spreadsheet as Latin-1:

```bash
python3 csvjoin.py left.csv right.csv --on id --delimiter ';' --encoding latin-1
```

Join two tab-separated files from a bash shell:

```bash
python3 csvjoin.py left.tsv right.tsv --on id --delimiter $'\t'
```
