# Glossary

The terms this guide uses, in alphabetical order, with the name each has on the command
line where that differs.

**Data row.** Any line of a CSV file after the header. `CSVJOIN_MAX_ROWS` counts data rows.

**Delimiter.** The single character that separates the cells of a row. Set with
`--delimiter`; the default is a comma.

**Header.** The first line of a CSV file, which names the columns.

**Inner join.** A join that keeps only the rows whose key value is in both files.
`--how inner`, the default.

**Key column.** The column both files share and on which rows are matched. Named with
`--on`.

**Key value.** The text in the key column of one row. Two rows match when their key values
are identical as text.

**Left file.** The first file on the command line. Its columns come first and its row order
sets the order of the result.

**Left join.** A join that keeps every row of the left file, matched or not. `--how left`.

**Outer join.** A join that keeps every row of both files, matched or not. `--how outer`.

**Right file.** The second file on the command line.

**Row limit.** The largest number of data rows csvjoin accepts in one input file. Set with
`CSVJOIN_MAX_ROWS`.

**Standard error.** The output stream csvjoin uses for messages, separate from the result.

**Standard output.** The output stream the result goes to when `--output` is not used.
