# Managing targets

A target is a URL that pingboard checks. The list of targets is stored in one
file on your machine, `~/.pingboard/targets.json` by default.

## Add a target

    pingboard add https://example.org/health

Rules:

- The URL must start with `http://` or `https://`. Otherwise pingboard stops
  with `pingboard: a target must start with http:// or https://`.
- Adding a URL that is already in the list changes nothing; the list never
  holds duplicates.
- URLs are compared as plain text. `https://example.org` and
  `https://example.org/` are two different targets.
- pingboard does not check the URL when you add it. A typing mistake shows up
  later as a target that is DOWN.

## Remove a target

    pingboard remove https://example.org/health

Type the URL exactly as `pingboard list` prints it. If the URL is not in the
list, pingboard stops with `pingboard: <url> is not in the list`.

## List the targets

    pingboard list

The targets are printed one per line in alphabetical order. An empty list
prints an empty line.

## Changes while the dashboard is running

You do not need to restart `pingboard serve` after a change, as long as the
dashboard uses the same targets file:

- A new target appears on the dashboard after the next round of checks.
- A removed target is no longer checked, but its last result **stays on the
  dashboard until the dashboard is restarted**.

## Keeping more than one list

Set the `PINGBOARD_DATA` environment variable to use a different file:

    PINGBOARD_DATA=~/lists/staging.json pingboard add https://staging.example.org
    PINGBOARD_DATA=~/lists/staging.json pingboard check

Use the same value for every command that should work on that list, including
`pingboard serve`.
