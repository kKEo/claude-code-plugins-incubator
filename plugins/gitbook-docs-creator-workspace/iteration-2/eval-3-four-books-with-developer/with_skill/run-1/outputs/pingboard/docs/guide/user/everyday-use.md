# Everyday use

This page shows the things you do with pingboard day to day, one job per section. Each has the shortest way to do it and one example.

## Add an address to watch

Use this when there is a new website you want to keep an eye on. The address must start with `http://` or `https://`.

```bash
pingboard add https://example.org/shop
```

If the dashboard is running, the new address appears on it within about a minute. You do not need to restart anything. Adding an address that is already in the list changes nothing.

## See which addresses you are watching

```bash
pingboard list
```

It prints your addresses, one per line, in alphabetical order.

## Stop watching an address

Type the address exactly as `pingboard list` shows it.

```bash
pingboard remove https://example.org/shop
```

pingboard stops checking it. A running dashboard keeps showing the last result of that address until you stop and start it again.

## Check everything right now

Use this when you do not want to wait for the dashboard, or do not have it running.

```bash
pingboard check
```

You get one line per address:

```text
up   200    87 ms  https://example.org
DOWN 404    52 ms  https://example.org/missing-page-404
```

From left to right: `up` or `DOWN`, the code the website answered with (`0` when it did not answer at all), how long the answer took, and the address.

## Watch the dashboard

Start it and leave it running:

```bash
pingboard serve
```

Then open <http://127.0.0.1:8080/> in a browser on the same computer. Each row shows an address, `up` or `DOWN`, and how long the last check took. pingboard checks every address once a minute. The page does not refresh by itself, so reload it to see new results.

If something else on your computer already uses that address, choose another number:

```bash
pingboard serve --port 9090
```

Then open <http://127.0.0.1:9090/> instead.

## Use the result in a script

`pingboard check` tells the script that ran it whether everything is up: it ends with status 0 when every address is up and with status 1 when at least one is down.

```bash
pingboard check || echo "Something is down"
```

Two options help in scripts:

```bash
# Stop at the first address that is down
pingboard check --fail-fast

# Print the results in JSON, a format other programs can read
pingboard check --json
```

## Change how often and how patiently it checks

By default pingboard checks once a minute and waits five seconds for an answer. Both can be changed before you start it; the operator guide lists [every setting](../operator/config/environment.md).
