# Quick start

This page takes you from nothing to your first joined file. It takes about five minutes.

## Before you start

You need:

- A computer with Python 3. To check, open a terminal (the window where you type commands)
  and type `python3 --version`. If you see a version number, you are ready.
- The file `csvjoin.py` from the [csvjoin repository](https://github.com/example/csvjoin).
  The [operator guide](../operator/install/install.md) describes installing in more detail.

## Steps

1. Open a terminal and go to the folder that holds `csvjoin.py`.

   ```bash
   cd csvjoin
   ```

2. Make two small files to try with. The first lists people, the second lists the city each
   person lives in. Both have a column called `id`.

   ```bash
   printf 'id,name\n1,Ada\n2,Grace\n3,Linus\n' > people.csv
   printf 'id,city\n1,London\n2,New York\n' > cities.csv
   ```

   You should now have `people.csv` and `cities.csv` in the folder.

3. Join them on the `id` column.

   ```bash
   python3 csvjoin.py people.csv cities.csv --on id
   ```

   You should see:

   ```text
   id,name,city
   1,Ada,London
   2,Grace,New York
   ```

   Each person now has their city next to their name. Linus is missing because the cities
   file has no line for him.

4. Keep everyone, including people without a city, and save the result to a file.

   ```bash
   python3 csvjoin.py people.csv cities.csv --on id --how left -o joined.csv
   ```

   You should see `csvjoin: wrote 3 rows to joined.csv`. Open `joined.csv` in your
   spreadsheet program: Linus is there, with an empty city.

## Next

- [Everyday use](everyday-use.md) shows the common jobs with your own files.
- [Questions and troubleshooting](faq.md) helps when a command prints an error.
- [Glossary](glossary.md) explains the words used in this guide.
