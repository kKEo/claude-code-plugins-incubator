# Everyday use

This page shows the things you will do most often with pingboard, one at a time. Each one is a single command.

## Watch another website

Add its address. The address must start with `http://` or `https://`.

```bash
pingboard add https://example.org/status
```

If the dashboard is running, the new target appears there within about a minute. You do not have to restart anything.

## Stop watching a website

Remove its address, written exactly as it is in your list.

```bash
pingboard remove https://example.org/status
```

pingboard stops checking it. The dashboard keeps showing its last result until you stop and start `pingboard serve` again.

## See what you are watching

```bash
pingboard list
```

The addresses are printed one per line, in alphabetical order.

## Check everything right now

You do not need the dashboard for a quick look.

```bash
pingboard check
```

You get one line per target, starting with `up` or `DOWN`, then a number called the status, the time the answer took, and the address. A status of `0` means the website did not answer at all.

## Keep the dashboard open

```bash
pingboard serve
```

Then open <http://127.0.0.1:8080> in your browser. The command has to keep running for the dashboard to work. The page does not update by itself; reload it to see the newest results.

## Check more often or less often

pingboard checks every 60 seconds. To change that, put the number of seconds in front of the command. The smallest number allowed is 5.

```bash
PINGBOARD_INTERVAL=30 pingboard serve
```

## Give slow websites more time

pingboard waits 5 seconds for an answer before it calls a website down. To wait longer, for example 15 seconds:

```bash
PINGBOARD_TIMEOUT=15 pingboard serve
```

## Use another address for the dashboard

If something else on your computer already uses the number 8080, pick another one:

```bash
pingboard serve --port 9090
```

The dashboard is then at <http://127.0.0.1:9090>.

## Show the dashboard to other people

Out of the box, only your own computer can open the dashboard. Making it visible to others is a job for the person who runs pingboard for your team; the operator guide explains it in [Install](../operator/install/install.md).
