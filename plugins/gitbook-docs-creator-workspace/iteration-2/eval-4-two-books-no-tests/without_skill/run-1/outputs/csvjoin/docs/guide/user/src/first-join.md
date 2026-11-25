# Your first join

This page joins two small files so you can see exactly what csvjoin does.

## The input files

`people.csv`:

```csv
id,name
1,Ada
2,Grace
3,Linus
```

`orders.csv`:

```csv
id,item
1,keyboard
1,mouse
4,monitor
```

Both files have a column called `id`. That is the column to join on.

## Run the join

```sh
python3 csvjoin.py people.csv orders.csv --on id
```

Output:

```csv
id,name,item
1,Ada,keyboard
1,Ada,mouse
```

## What happened

* The first file on the command line is the **left** file, the second is the **right** file.
* The output has all columns of the left file, then the columns of the right file except the join column.
* Ada has two orders, so she appears twice: once per matching row.
* Grace and Linus have no orders, and order `4` has no person. By default rows without a match are dropped. [Choosing which rows to keep](join-types.md) shows how to keep them.
* Rows come out in the order of the left file.

## Save the result

The result goes to the terminal. To save it, name an output file:

```sh
python3 csvjoin.py people.csv orders.csv --on id --output joined.csv
```

csvjoin then reports what it wrote:

```text
csvjoin: wrote 2 rows to joined.csv
```

An existing `joined.csv` is overwritten without asking.
