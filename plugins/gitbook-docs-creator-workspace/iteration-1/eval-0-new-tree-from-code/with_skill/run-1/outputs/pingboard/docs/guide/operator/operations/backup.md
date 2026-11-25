# Back up and restore

This page shows how to save the target list and how to put it back. The target list is the only state pingboard keeps on disk; check results live in memory and cannot be backed up.

## What to back up

One file: the data file named by `PINGBOARD_DATA`, by default `~/.pingboard/targets.json`. It is small, plain JSON, and safe to copy while pingboard runs, because every change replaces the whole file in one step.

## Back up

```bash
cp ~/.pingboard/targets.json ~/targets.backup.json
```

`pingboard list` gives the same information as plain text, one URL per line, if you prefer to keep the list in another system.

## Restore

1. Copy the saved file back to the path that `PINGBOARD_DATA` names.

   ```bash
   mkdir -p ~/.pingboard
   cp ~/targets.backup.json ~/.pingboard/targets.json
   ```

2. Check that pingboard can read it.

   ```bash
   pingboard list
   ```

   You should see the saved URLs.

A running `pingboard serve` reads the restored list in its next cycle. Restart it only if its check loop had stopped; see [The dashboard shows old results](troubleshooting.md#the-dashboard-shows-old-results).

## Move to another machine

Install pingboard on the new machine, copy the data file to the path `PINGBOARD_DATA` names there, and start `pingboard serve`. Nothing else has to move.

## Rebuild a lost list

The file has one key, `targets`, with a list of URLs. If no backup exists, add each target again with `pingboard add`; the file is created on the first one.
