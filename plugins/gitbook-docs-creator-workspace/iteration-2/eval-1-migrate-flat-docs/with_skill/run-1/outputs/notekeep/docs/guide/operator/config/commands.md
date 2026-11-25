# Commands and flags

This page lists every command `notekeep.py` accepts. A command is required; the only flag is
`-h` / `--help`, on the script and on each command.

Only `serve` starts the server. The other commands open the database file named by
`NOTEKEEP_DB` directly, so run them on the machine that holds the file and with the same
`NOTEKEEP_DB` value as the server.

| Command | Arguments | Purpose | Example |
|---|---|---|---|
| `export` | `dir` | Write every note to the directory `dir` as `<title>.md`. The directory is created when missing; existing files with the same name are overwritten. | `python3 notekeep.py export ./backup` |
| `list` | none | Print the title of every note, one per line, sorted. | `python3 notekeep.py list` |
| `serve` | none | Start the server. Prints `notekeep listening on :<port>, database <path>` and runs until stopped. | `python3 notekeep.py serve` |
| `show` | `title` | Print the text of one note. Exits with status 1 and `notekeep: no note called <title>` when there is none. | `python3 notekeep.py show shopping` |
| `vacuum` | none | Compact the database file. | `python3 notekeep.py vacuum` |

There is no command that deletes a note.
