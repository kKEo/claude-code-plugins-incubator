# Commands and flags

This is every command `notekeep.py` accepts, as defined by its argument parser. The program
is run as `python3 notekeep.py <command>`. A command is required.

| Command | Arguments | Purpose | Example |
|---|---|---|---|
| `export` | `dir` | Write every note to `dir` as `<title>.md`. Creates `dir` when missing and overwrites files of the same name. | `python3 notekeep.py export ./backup` |
| `list` | none | Print the title of every note, one per line, sorted. | `python3 notekeep.py list` |
| `serve` | none | Start the HTTP server and run until stopped. | `python3 notekeep.py serve` |
| `show` | `title` | Print the body of one note. | `python3 notekeep.py show shopping` |
| `vacuum` | none | Run SQLite `VACUUM` to compact the database file. | `python3 notekeep.py vacuum` |

## Flags

The only flag is `-h` (`--help`), on the program and on each command. Everything else is
set with [environment variables](environment.md).

```bash
python3 notekeep.py --help
```

## Exit status

| Status | When |
|---|---|
| `0` | The command succeeded. |
| `1` | `show` was given a title that does not exist. It prints `notekeep: no note called <title>`. |
| `2` | The command line is wrong: no command, an unknown command or a missing argument. |

## What is not there

There is no command to save a note and none to delete one. Notes are saved through the
[HTTP API](http-api.md); removing one is described in
[Backup and maintenance](../operations/backup.md).
