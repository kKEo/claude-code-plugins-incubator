# The data file

The target list is the only state that pingboard keeps on disk.

## Location

`~/.pingboard/targets.json` of the account that runs the command, unless `PINGBOARD_DATA` names another path. For a service, always set `PINGBOARD_DATA` explicitly, so that the service and the people who manage targets use the same file.

## Format

```json
{
  "targets": [
    "https://example.org",
    "https://example.org/health"
  ]
}
```

One object with one key, `targets`, that holds a list of URL strings. pingboard writes the list sorted and without duplicates.

A missing file is not an error; it means an empty list. pingboard creates the file, and its parent directories, at the first `pingboard add`.

## How pingboard writes the file

Each `add` and `remove` writes the complete new list to a temporary file next to the data file (`targets.tmp` for `targets.json`) and then renames it over the data file. Consequences:

* Readers never see a half-written file. The running service can read while you add targets.
* The account that runs `add` or `remove` needs write permission on the **directory**, not only on the file.
* The directory must be on one file system. Do not mount the data file alone into a container; mount its directory.
* There is no lock. If two people run `add` or `remove` at the same moment, one change can be lost. Run `pingboard list` after a change when several people manage targets.

## Permissions

The service only reads the file. A typical setup:

| Path | Owner | Mode |
| --- | --- | --- |
| `/var/lib/pingboard/` | `pingboard` | `0755` |
| `/var/lib/pingboard/targets.json` | `pingboard` | `0644` |

Target URLs can reveal internal host names. Tighten the modes if that matters on your host.

## Editing by hand

You can generate or edit the file with other tools, for example to load many targets at once. Follow two rules:

1. Write a temporary file and rename it over the data file, as pingboard does. Never edit the file in place while the service runs.
2. Validate before you rename: `python3 -m json.tool < new-targets.json`.

> **Warning:** if the running service reads a file that is not valid JSON, or that lacks the `targets` key, its check loop stops for good while the HTTP server keeps answering with old results. See [Monitoring and logs](monitoring.md) for how to detect this, and restart the service after you repair the file.

pingboard does not validate entries that it reads from the file. An entry that is not a usable URL is reported as down with status 0.

## Backup and restore

The file is small and changes rarely. Copying it is a complete backup:

```
cp /var/lib/pingboard/targets.json /backup/pingboard-targets-$(date +%F).json
```

To restore, copy the backup to a temporary name in the data directory and rename it:

```
cp /backup/pingboard-targets-2026-11-25.json /var/lib/pingboard/targets.new
mv /var/lib/pingboard/targets.new /var/lib/pingboard/targets.json
```

No restart is needed. Keeping the file in version control is a good alternative, because it also records who changed the list.

Check results are not on disk and cannot be backed up. After a restart the first round rebuilds them.
