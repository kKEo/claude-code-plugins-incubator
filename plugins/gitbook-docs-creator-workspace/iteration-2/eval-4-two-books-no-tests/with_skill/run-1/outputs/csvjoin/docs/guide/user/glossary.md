# Glossary

The words this guide uses, in alphabetical order.

**Column.** One kind of value in a table, such as all the names or all the cities. Each
has a name, given in the first line of the file.

**CSV file.** A table saved as plain text: one line per entry, with the values on a line
separated by commas. Spreadsheet programs can open and save such files.

**Encoding.** The way letters are stored in a file. The usual one is called UTF-8. When the
wrong one is assumed, accented letters come out wrong.

**Join.** To combine two tables into one by putting together the entries that have the same
value in the shared column.

**Left file.** The file you name first in the command.

**Match.** Two entries match when they have exactly the same value in the shared column.

**Right file.** The file you name second in the command.

**Row.** One line of a table after the first line: one person, one order, one entry.

**Separator.** The character between two values on a line. Usually a comma, sometimes a
semicolon or a tab.

**Shared column.** The column that both files have, under the same name, and that tells
csvjoin which entries belong together. You name it with `--on`.

**Terminal.** The window on your computer where you type commands instead of clicking.
