# csvjoin User Guide

csvjoin takes two CSV files that share a column, matches their rows on that column, and prints the combined rows as CSV.

```sh
python3 csvjoin.py people.csv orders.csv --on id
```

This guide is for anyone who has two CSV files and wants one. You need to be able to run a command in a terminal; you do not need to know Python.

| If you want to | Read |
| --- | --- |
| Get the tool onto your machine | [Install](install.md) |
| See a complete example with its output | [Your first join](first-join.md) |
| Keep rows that have no match | [Choosing which rows to keep](join-types.md) |
| Look up an option | [Options](options.md) |
| Handle semicolons, tabs, Excel exports | [Recipes](recipes.md) |
| Understand an error message | [Troubleshooting](troubleshooting.md) |

If you install csvjoin for other people or run it from scheduled jobs, see the Operator Guide.

The source code is at <https://github.com/example/csvjoin>. csvjoin is released under the MIT licence.
