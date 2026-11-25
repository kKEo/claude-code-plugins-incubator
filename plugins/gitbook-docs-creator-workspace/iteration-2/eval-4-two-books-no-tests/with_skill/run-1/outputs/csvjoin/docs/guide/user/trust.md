# Trust and privacy

This page says what csvjoin does with your files, so you can decide whether to use it on
data you care about.

## Your data stays on your computer

csvjoin does not use the internet. It sends nothing anywhere, collects no usage data, and
needs no account.

## What it reads

- The two files you name. It only reads them; it never changes them.
- One optional setting, the row limit, described in
  [Questions and troubleshooting](faq.md).

## What it writes

- The result, in the terminal.
- With `-o`, one file: the one you name. If that file already exists, it is replaced without
  a question, so check the name before you press Enter.

It writes nothing else. It keeps no history, no copies of your data and no settings, and it
remembers nothing from one run to the next.

## What to keep in mind

- **Values must be exactly the same to match.** `1` and `01` are different to csvjoin, and
  so are `Ada` and `ada`, or a value with a space in front of it. Rows that look alike to
  you can be left out for this reason.
- **A repeated value gives repeated rows.** If a value in the shared column is in a file
  twice, you get a row for each combination.
- **Columns with the same name clash.** If both files have a column with the same name, apart
  from the shared column, the result shows the right file's values in both and the left file's
  values are lost. Rename one of the columns first.
- **Large files need memory.** csvjoin loads both files completely before it writes
  anything. A file with more than 1,000,000 rows is refused unless you raise the limit.

csvjoin is free to use under the MIT licence.
