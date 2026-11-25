# Exploring by hand

This page shows how to set up a pingboard that cannot touch your real list, which areas are worth probing by hand, what to try in each, and how to report what you find. Most of the product has no automated test, so this is where its behaviour gets checked.

## Set up a sandbox

Point pingboard at a throwaway targets file and a spare port. Use the same variables in every terminal you open.

```bash
export PINGBOARD_DATA="$(mktemp -d)/targets.json"
export PINGBOARD_PORT=18080
export PINGBOARD_INTERVAL=5
```

`PINGBOARD_INTERVAL=5` is the shortest interval allowed and keeps the waiting short.

You need a target that is up and one that is down, without depending on the internet. pingboard's own health check is a convenient up target, and a closed local port is a down target:

```bash
pingboard add http://127.0.0.1:18080/healthz
pingboard add http://127.0.0.1:1/
pingboard serve
```

In a second terminal, with the same three variables:

```bash
pingboard check
curl http://127.0.0.1:18080/api/status
curl http://127.0.0.1:18080/metrics
```

`pingboard check` prints one `DOWN` line with status `0` and one `up` line with status `200`, and exits with status 1.

## Areas worth probing

### The list of targets

Code: `pingboard/cli.py`, `pingboard/store.py`.

- Add the same URL twice, and the same URL with and without a trailing slash. The first is stored once, the second as two targets.
- Add values that pass the only check there is, the `http://` or `https://` prefix: `http://` alone, a URL with spaces, a URL with a very long path.
- Remove a URL that is not in the list. Expect `pingboard: <url> is not in the list` and exit status 1.
- Run `pingboard list` on an empty list.
- Run `add` in two terminals at the same moment and see whether both URLs end up in the file.

### Changes while `serve` runs

Code: `pingboard/server.py`, function `loop`.

- Add a target and watch it appear after the next cycle without a restart.
- Remove a target. It is no longer checked, but it stays on the dashboard, in `/api/status` and in `/metrics` until `serve` is restarted. This is the current behaviour; report it if a change makes it worse, for example a removed target that is still checked.
- Edit the targets file by hand into invalid JSON. The check loop stops with a traceback on standard error, `/healthz` keeps answering `ok`, and `pingboard_checks_total` stops growing. Repairing the file does not restart the loop.

### What counts as up

Code: `pingboard/check.py`.

- Targets that answer with a redirect, with status 404 and with status 500. Up means a final status below 400.
- A target that answers more slowly than `PINGBOARD_TIMEOUT`. Set the timeout to `0.5` to make this easy to reach.
- A host name that does not resolve.
- Several slow targets in one list. Checks run one after another, so each slow target delays the ones after it.

### The pages and routes

Code: `pingboard/server.py`, class `Handler`.

- A target whose URL contains HTML, such as `http://127.0.0.1:1/<b>x</b>`. The dashboard writes the URL into the page without escaping it.
- A target whose URL contains a double quote. `/metrics` writes the URL into the label without escaping it.
- A path that does not exist, which returns 404, and a POST request, which returns 501.
- The dashboard right after a start, before the first cycle has finished: the table is empty.

### Settings

Code: `pingboard/config.py`.

- `PINGBOARD_INTERVAL` at `4` and at `5`: the first is refused, the second accepted.
- Non-numeric values for `PINGBOARD_INTERVAL`, `PINGBOARD_PORT` and `PINGBOARD_TIMEOUT`. They end in a Python traceback, not in a `pingboard:` message.
- An unknown `PINGBOARD_LOG_LEVEL`, and `debug`, which logs every HTTP request.
- `pingboard serve --port 0`, which is ignored in favour of `PINGBOARD_PORT`.
- A port that is already in use.

The operator guide states the expected behaviour for each of these: [Environment variables and settings](../../operator/config/environment.md), [Commands and flags](../../operator/config/commands.md) and [HTTP routes](../../operator/config/routes.md). A difference between those pages and what you see is a finding, in the code or in the page.

## Report what you find

Open an issue at <https://github.com/example/pingboard/issues> with:

- the command you ran and the `PINGBOARD_` variables that were set;
- the content of the targets file;
- what you expected, and what happened, including the output and the exit status;
- your Python version, from `python --version`.

## Clean up

Stop `serve`, then remove the sandbox and the variables.

```bash
rm -r "$(dirname "$PINGBOARD_DATA")"
unset PINGBOARD_DATA PINGBOARD_PORT PINGBOARD_INTERVAL
```
