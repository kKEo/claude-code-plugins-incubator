# Use cases

This page describes typical situations in which csvjoin is the right tool, and what you
type in each. The situations are illustrations, not reports from real users. Each uses the
two sample files from the [Quick start](quick-start.md) or files of the same shape.

## Add details from a second file

You have a list of people and a separate list that gives each person's city. You want one
table with both. Join the two on the column they share:

```bash
python3 csvjoin.py people.csv cities.csv --on id -o people-with-cities.csv
```

## Find out which rows have no match

You want to know which people have no city on record. Keep every row of the left file; the
rows with an empty city are the ones without a match.

```bash
python3 csvjoin.py people.csv cities.csv --on id --how left
```

## Merge two lists without losing anything

Two lists overlap in part, and you want every row from both in one table. Rows found in
only one list keep their own columns and get empty cells for the other's.

```bash
python3 csvjoin.py people.csv cities.csv --on id --how outer -o everything.csv
```

## Combine exports from a spreadsheet

Your spreadsheet program saved two files with semicolons between the values. Tell csvjoin
about the separator, and the result uses semicolons too, so the spreadsheet opens it again.

```bash
python3 csvjoin.py left.csv right.csv --on id --delimiter ';' -o joined.csv
```

## When csvjoin is not the right tool

- You want to join more than two files at once. csvjoin takes two; join the result with the
  third file in a second run.
- The two files call the shared column by different names. Rename it in one file first.
- You need to match on more than one column. csvjoin matches on one.
