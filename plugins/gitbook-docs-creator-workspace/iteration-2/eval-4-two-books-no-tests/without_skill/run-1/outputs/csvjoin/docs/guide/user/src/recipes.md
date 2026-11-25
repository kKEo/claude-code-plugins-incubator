# Recipes

## Semicolon-separated files

```sh
python3 csvjoin.py left.csv right.csv --on id --delimiter ';'
```

Quote the semicolon, otherwise the shell treats it as the end of the command. The output uses semicolons too.

## Tab-separated files

Pass a real tab character. In bash and zsh:

```sh
python3 csvjoin.py left.tsv right.tsv --on id --delimiter $'\t'
```

## Files exported from Excel

Excel's "CSV UTF-8" export starts the file with an invisible marker (a byte order mark). csvjoin then sees the first column as `﻿id` instead of `id` and reports that the column is missing. Read such files with the `utf-8-sig` encoding:

```sh
python3 csvjoin.py left.csv right.csv --on id --encoding utf-8-sig
```

Older Excel exports on Windows are often in `cp1252`:

```sh
python3 csvjoin.py left.csv right.csv --on id --encoding cp1252 --output joined.csv
```

## The two files differ in delimiter or encoding

`--delimiter` and `--encoding` apply to both inputs. Convert one file first so that both match.

## The join column has different names

`--on` takes one name that must exist in both files. Rename the header in one file before joining. For example, to rename `customer_id` to `id` in the first line of a file:

```sh
sed '1s/customer_id/id/' orders.csv > orders-renamed.csv
```

## Keep every row of the right file

Swap the files and use `--how left`:

```sh
python3 csvjoin.py orders.csv people.csv --on id --how left
```

## Find rows without a match

Run a left join and look for rows whose right-hand columns are empty. With the example files, where the right file adds one column, those are the lines that end with a comma:

```sh
python3 csvjoin.py people.csv orders.csv --on id --how left | tr -d '\r' | grep ',$'
```

## Join three files

Join two, save the result, then join it with the third:

```sh
python3 csvjoin.py a.csv b.csv --on id --output ab.csv
python3 csvjoin.py ab.csv c.csv --on id --output abc.csv
```
