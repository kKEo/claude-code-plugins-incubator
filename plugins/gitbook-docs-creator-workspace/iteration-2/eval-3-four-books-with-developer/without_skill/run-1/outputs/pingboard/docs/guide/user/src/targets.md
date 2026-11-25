# Managing the target list

The target list is the set of URLs that pingboard checks. Three commands work on it.

## Add a target

```
pingboard add https://example.org/health
```

Rules:

* The URL must start with `http://` or `https://`. Anything else is rejected with the message `pingboard: a target must start with http:// or https://`.
* Adding a URL that is already in the list changes nothing.
* URLs are compared as text. `https://example.org` and `https://example.org/` are two different targets.

## Remove a target

```
pingboard remove https://example.org/health
```

Type the URL exactly as `pingboard list` prints it. If the URL is not in the list, the command fails with `pingboard: <url> is not in the list`.

## List the targets

```
pingboard list
```

```
https://example.org
https://example.org/health
```

The list is always sorted alphabetically, whatever the order in which you added the targets.

## Changes while the dashboard is running

You do not need to restart `pingboard serve` after you change the list. The dashboard reads the list at the start of every round of checks:

* A new target appears on the dashboard after the next round.
* A removed target is no longer checked, but its last result stays on the dashboard until you restart `pingboard serve`.

## Where the list is stored

The list is a small JSON file, `~/.pingboard/targets.json` by default:

```json
{
  "targets": [
    "https://example.org",
    "https://example.org/health"
  ]
}
```

To keep the list somewhere else, set the `PINGBOARD_DATA` environment variable to the path of the file. Every command reads this variable, so set it the same way for `add`, `check` and `serve`:

```
export PINGBOARD_DATA=~/work/targets.json
pingboard add https://example.org
pingboard serve
```

You can edit the file by hand, but prefer the commands: a file that is not valid JSON makes every command fail.
