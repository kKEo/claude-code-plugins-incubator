# Troubleshooting

## `csvjoin: FILE has no column called NAME`

The header of that file has no column with exactly that name. Check:

* **Spelling and case.** `ID` and `id` are different.
* **Spaces.** A header written as `id, name` has a column called ` name`, with a leading space.
* **The delimiter.** If the file uses semicolons or tabs and you did not pass `--delimiter`, the whole header is read as one column.
* **An Excel export.** See [Files exported from Excel](recipes.md#files-exported-from-excel).

## `csvjoin: FILE has N rows, more than CSVJOIN_MAX_ROWS=...`

The file is larger than the configured limit, one million rows unless changed. Raise the limit for one run:

```sh
CSVJOIN_MAX_ROWS=5000000 python3 csvjoin.py big.csv other.csv --on id
```

csvjoin holds both files in memory, so a very large file can still exhaust your machine. The Operator Guide covers the limit in detail.

## `csvjoin: error: the following arguments are required: ...`

Something is missing from the command line. You need two file paths and `--on`.

## `FileNotFoundError: ... No such file or directory`

csvjoin prints a Python traceback when it cannot open a file. The last line names the path it tried. Check the path and the folder you are running in.

## `UnicodeDecodeError`

The file is not in the encoding csvjoin expected, UTF-8 by default. Pass the right one with `--encoding`, for example `--encoding cp1252`.

## `TypeError: "delimiter" must be a 1-character string`

`--delimiter` accepts exactly one character. For a tab, see [Tab-separated files](recipes.md#tab-separated-files).

## `ValueError: dict contains fields not in fieldnames`

This happens when the left file has a header but no data rows and the right file has rows that are kept (`--how outer`). csvjoin takes the output columns from the first data row of each file, so an empty left file contributes none. Put the file that has rows on the left, or skip the join when a file is empty.

## The output is empty or has fewer rows than expected

* Values must match exactly. Look for leading zeros, trailing spaces and upper or lower case differences. See [How rows are matched](join-types.md#how-rows-are-matched).
* The default keeps only matched rows. Use `--how left` or `--how outer` to keep the rest.

## The output has more rows than either input

The join value repeats in both files, and you get every combination. Remove duplicates from one file first if that is not what you want.

## A column shows up twice

Both files have a column with that name. See [Columns with the same name in both files](join-types.md#columns-with-the-same-name-in-both-files).

## A value looks like `['x']` or a column has no name

A data row has more fields than the header. csvjoin does not reject such rows. Fix the row in the input file.
