# Data and backup

## The targets file

The only persistent data is the list of targets. Its location is
`PINGBOARD_DATA`, by default `~/.pingboard/targets.json` in the home directory
of the user who runs the command.

Format:

    {
      "targets": [
        "https://example.com",
        "https://example.org"
      ]
    }

The list is stored sorted and without duplicates.

## How it is written

`pingboard add` and `pingboard remove` read the file, change the list and
write it back:

1. The parent folder is created when it is missing.
2. The new content is written to a temporary file next to the targets file,
   with the suffix `.tmp` in place of `.json`.
3. The temporary file replaces the targets file with an atomic rename.

A reader therefore never sees a half-written file. There is no locking,
however: when two `add` or `remove` commands run at the same moment, the
change of one of them can be lost. Run them one after another.

## Editing the file by hand

You may edit or generate the file yourself, for example from configuration
management. Keep to these rules:

- The file must be valid JSON with a top-level `targets` array of strings.
- Replace the file atomically (write a new file, then rename it). The service
  reads the file at every round, and **an unreadable or invalid file ends the
  check loop** until the service is restarted.
- The checks made by `pingboard add` do not apply. Make sure every entry
  starts with `http://` or `https://`; other entries are reported as down.

A missing file is not an error. It means an empty list.

## Permissions

The user who runs `pingboard add` and `pingboard remove` needs write access to
the folder of the targets file. The service user needs read access to the
file.

## Backup and restore

Back up the targets file; nothing else needs a backup. To restore, put the
file back. A running service picks it up at the next round.

Check results are not stored. If you need history, collect `/metrics` in a
metrics system.
