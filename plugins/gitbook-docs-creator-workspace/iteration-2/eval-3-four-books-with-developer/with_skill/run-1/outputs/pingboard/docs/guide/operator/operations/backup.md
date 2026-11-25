# Back up and restore

This chapter explains how to copy and restore the one file that holds pingboard's state, and how to edit it by hand.

The only state is the targets file: `~/.pingboard/targets.json`, or the path in `PINGBOARD_DATA`. Check results are held in memory and cannot be backed up.

## Back up

```bash
cp ~/.pingboard/targets.json ~/targets.backup.json
```

The copy can be made while `pingboard serve` runs. Changes replace the file by a rename, so a copy is always one complete version of the list.

## Restore

```bash
cp ~/targets.backup.json ~/.pingboard/targets.json
pingboard list
```

`pingboard list` prints the restored targets. A running `serve` process reads the file at its next round; restart it if its checker thread had ended, as described in the [Troubleshooting runbook](troubleshooting.md#results-stop-changing).

## Move to another machine

Copy the file to the same path on the new machine, or to any path and set `PINGBOARD_DATA` to it. The file contains nothing specific to a machine.

## Edit by hand

The file is JSON with one key, `targets`, whose value is an array of URL strings; the [System overview](../intro/overview.md) shows an example. A hand-edited file does not have to be sorted. It does have to be valid JSON with the `targets` key, or every command and the checker thread fail. `pingboard add` and `pingboard remove` are the safer way.

> **Note.** A file named `targets.tmp` in the same directory is left over from a change that was interrupted. It can be deleted.
