# Files on disk

This page lists every file pingboard writes. There are two, and only `add` and `remove` write them.

| File | Written by | Content |
|---|---|---|
| `targets.json` | `add`, `remove` | The list of targets. The path is the value of `PINGBOARD_DATA`, by default `~/.pingboard/targets.json`. |
| `targets.tmp` | `add`, `remove` | The new content while it is being written, in the same directory. It replaces `targets.json` in one step and does not remain afterwards. The name is the name of the targets file with its extension changed to `.tmp`. |

## Format of the targets file

A JSON object with one key, `targets`, that holds an array of URL strings, sorted and without duplicates.

```json
{
  "targets": [
    "https://example.org",
    "https://example.org/status"
  ]
}
```

The file can be edited by hand. pingboard reads it at the start of every command and of every cycle, so a running `serve` sees the change in its next cycle. It must stay valid JSON with a `targets` key: [Troubleshooting runbook](../operations/troubleshooting.md) describes what happens when it does not.

`serve` and `check` only read the file. pingboard writes no log file, no cache and no results.
