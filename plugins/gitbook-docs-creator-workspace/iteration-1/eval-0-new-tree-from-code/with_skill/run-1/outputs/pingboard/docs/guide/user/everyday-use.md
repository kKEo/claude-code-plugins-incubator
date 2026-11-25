# Everyday use

This page shows the things you will do with pingboard most often, one at a time. Each one is a single command typed in a terminal.

## Add an address to watch

Do this for every web address you want on your dashboard.

```bash
pingboard add https://example.org
```

The address must start with `http://` or `https://`. If the dashboard is running, the new target appears there within about a minute; you do not need to restart anything. Adding an address twice does no harm: it is kept once.

## See what you are watching

```bash
pingboard list
```

This prints your targets, one per line, in alphabetical order.

## Check everything right now

Do this when you do not want to wait for the dashboard, or when it is not running.

```bash
pingboard check
```

```text
up   200    84 ms  https://example.org
DOWN 404    35 ms  https://example.org/old-page
```

Each line shows a target, whether it is `up` or `DOWN`, the number the website answered with, and how long it took. A `0` in place of that number means the website did not answer at all.

## Keep a dashboard open

Do this when you want to see the state of all your targets at a glance.

```bash
pingboard serve
```

Then open `http://127.0.0.1:8080` in your browser. pingboard checks every target once a minute while this command runs.

The page shows the result of the most recent check and does not update by itself. Reload it to see the newest results.

To stop, press Ctrl+C in the terminal.

## Stop watching an address

```bash
pingboard remove https://example.org
```

Type the address exactly as `pingboard list` shows it. If the dashboard is running, the removed target stays on the page with its last result until you stop pingboard and start it again.

## Check more or less often

pingboard checks once a minute unless you tell it otherwise. To change that, say how many seconds to wait between checks before you start the dashboard. Five seconds is the shortest wait it accepts.

```bash
PINGBOARD_INTERVAL=300 pingboard serve
```

This example checks every five minutes. The [operator guide](../operator/config/environment.md) lists the other things you can change this way.
