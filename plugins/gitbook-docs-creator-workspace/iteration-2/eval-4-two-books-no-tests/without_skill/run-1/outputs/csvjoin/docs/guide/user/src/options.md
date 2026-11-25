# Options

```text
csvjoin [-h] --on ON [--how {inner,left,outer}] [--delimiter DELIMITER]
        [--encoding ENCODING] [--output OUTPUT]
        left right
```

## Arguments

| Argument | Meaning |
| --- | --- |
| `left` | Path to the first CSV file. Its columns come first in the output and its row order is kept. |
| `right` | Path to the second CSV file. |

Both files must have a header row. csvjoin reads files only; it does not read from standard input.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `--on NAME` | required | Name of the column both files share. The name is case sensitive. |
| `--how inner\|left\|outer` | `inner` | Which rows to keep. See [Choosing which rows to keep](join-types.md). |
| `--delimiter CHAR` | `,` | Field separator, a single character. Applies to both inputs and to the output. |
| `--encoding NAME` | `utf-8` | Text encoding of both input files, as a [Python codec name](https://docs.python.org/3/library/codecs.html#standard-encodings). |
| `--output FILE`, `-o FILE` | standard output | Write the result to this file, always as UTF-8. |
| `-h`, `--help` | | Show the usage summary and exit. |

## Output format

* The first line is a header.
* Lines end with a carriage return and line feed (CRLF), which is the CSV standard and what spreadsheet programs expect.
* Values that contain the delimiter, a quote or a line break are quoted.
* With `--output`, the file is UTF-8 whatever `--encoding` says. Without it, the terminal's encoding is used.
