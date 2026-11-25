# Choosing which rows to keep

The `--how` option decides what happens to rows that have no match in the other file.

| `--how` | Keeps |
| --- | --- |
| `inner` (default) | Only rows whose join value appears in both files |
| `left` | Every row of the left file, matched or not |
| `outer` | Every row of both files |

The examples use the files from [Your first join](first-join.md).

## inner

```sh
python3 csvjoin.py people.csv orders.csv --on id --how inner
```

```csv
id,name,item
1,Ada,keyboard
1,Ada,mouse
```

## left

```sh
python3 csvjoin.py people.csv orders.csv --on id --how left
```

```csv
id,name,item
1,Ada,keyboard
1,Ada,mouse
2,Grace,
3,Linus,
```

Grace and Linus are kept. Their `item` is empty because no order matched.

There is no `right` choice. To keep every row of the right file instead, swap the two files on the command line.

## outer

```sh
python3 csvjoin.py people.csv orders.csv --on id --how outer
```

```csv
id,name,item
1,Ada,keyboard
1,Ada,mouse
2,Grace,
3,Linus,
4,,monitor
```

Rows that exist only in the right file come last, in the order of the right file.

## How rows are matched

* Values are compared as exact text. `1` does not match `01`, `1.0` or `1 ` with a trailing space, and `abc` does not match `ABC`.
* Empty values match each other. If both files have rows with an empty join column, those rows are joined.
* If a value appears several times in both files, you get every combination. Two rows on the left and three on the right give six rows.

## Columns with the same name in both files

Only the join column is merged. If the two files share another column name, for example both have `city`, the output has that column twice and both copies hold the same value: the right file's value when the row matched, otherwise the value from the file the row came from.

To keep both values, rename the column in one of the files before you join.
