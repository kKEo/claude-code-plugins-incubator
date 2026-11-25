# Troubleshooting

## `pingboard: command not found`

The shell cannot find the program. If you installed into a virtual
environment, activate it first (`. .venv/bin/activate`). You can also start
pingboard through Python: `python -m pingboard.cli --help`.

## `pingboard: a target must start with http:// or https://`

Add the scheme to the URL: `pingboard add https://example.org`, not
`pingboard add example.org`.

## `pingboard: <url> is not in the list`

`pingboard remove` needs the URL exactly as it was stored. Run
`pingboard list` and copy the line, including any trailing `/`.

## `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`

The `PINGBOARD_INTERVAL` environment variable is set to a value below 5. Every
command reads the settings, so this message can appear even for
`pingboard list`. Set the variable to 5 or more, or unset it.

## A target is DOWN but opens fine in my browser

- Run `pingboard check --json` and read the `error` field of the target.
- A status of `0` with a time close to the timeout means the target was too
  slow. Try a longer timeout: `PINGBOARD_TIMEOUT=15 pingboard check`.
- Some sites answer with an error status to programs that are not browsers.
  pingboard identifies itself with the user agent `pingboard`.
- pingboard runs on your machine. If the machine needs a VPN or a proxy to
  reach the target, pingboard needs it too.

## The dashboard does not open

- Check that `pingboard serve` is still running and note the address it
  printed.
- By default the dashboard is reachable only from the machine it runs on. See
  [The dashboard](dashboard.md#common-settings) to open it to other machines.
- `Address already in use` at start means another program uses the port. Pick
  another one: `pingboard serve --port 9000`.

## The dashboard is empty

- Right after the start, wait for the first round of checks and reload.
- Run `pingboard list`. If it prints nothing, add targets.
- If you use `PINGBOARD_DATA`, make sure `pingboard serve` was started with
  the same value as your `pingboard add` commands.

## The dashboard shows old results

Reload the page; it does not refresh itself. If the results still do not
change, the background checks may have stopped. Restart `pingboard serve` and
tell your operator; the Operator guide explains the cause.

## A removed target is still on the dashboard

This is expected. Restart `pingboard serve` to clear it.
