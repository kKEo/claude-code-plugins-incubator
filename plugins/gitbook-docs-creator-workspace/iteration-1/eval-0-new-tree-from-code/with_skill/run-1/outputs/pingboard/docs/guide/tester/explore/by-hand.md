# Exploring by hand

This page shows how to try pingboard by hand in a sandbox, and where it is most worth looking. Use it for changes to `pingboard/check.py` and `pingboard/server.py`, which have no automated tests, and whenever you want to see a change work for real.

## Set up a sandbox

The sandbox uses its own data file, a short interval and its own port, so that it touches neither your target list in `~/.pingboard` nor a pingboard that is already running.

1. In a first terminal, set the sandbox settings. Use the same three lines in every terminal you open for the sandbox.

   ```bash
   export PINGBOARD_DATA=/tmp/pingboard-sandbox/targets.json
   export PINGBOARD_INTERVAL=5
   export PINGBOARD_PORT=18080
   ```

2. Start a target that you control. This serves the current directory on port 18081.

   ```bash
   python3 -m http.server 18081 --bind 127.0.0.1
   ```

3. In a second terminal, with the sandbox settings, add three targets: one that is up, one that answers 404, and one where nothing listens.

   ```bash
   pingboard add http://127.0.0.1:18081/
   pingboard add http://127.0.0.1:18081/missing
   pingboard add http://127.0.0.1:1/
   ```

4. Check once. You should see one `up` line with status 200, one `DOWN` line with status 404 and one `DOWN` line with status 0, and exit status 1.

   ```bash
   pingboard check
   echo $?
   ```

5. Start the server, with the log at its most detailed.

   ```bash
   PINGBOARD_LOG_LEVEL=debug pingboard serve
   ```

6. In a third terminal, look at each route.

   ```bash
   curl http://127.0.0.1:18080/healthz
   curl http://127.0.0.1:18080/metrics
   curl http://127.0.0.1:18080/api/status
   ```

   The dashboard is at `http://127.0.0.1:18080/` in a browser.

To clean up, stop both processes with Ctrl+C and delete `/tmp/pingboard-sandbox`.

## Areas worth probing

Each area names the code it exercises. What the product is meant to do in each case is described in the operator guide: [System overview](../../operator/intro/overview.md), [Commands and flags](../../operator/config/commands.md) and [HTTP routes](../../operator/config/http.md).

### What counts as up

Code: `pingboard/check.py`.

- A target that redirects to a page that works, and one that redirects to a page that does not.
- A target that answers more slowly than `PINGBOARD_TIMEOUT`. Set the timeout to `0.5` and use a slow target.
- A host name that does not exist, and an `https://` target with a certificate problem. Both should be `DOWN` with status 0 and an error text.
- Statuses just below and at the limit: 399 and 400.

### What the command line accepts

Code: `pingboard/cli.py`.

- `add` checks only that the URL starts with `http://` or `https://`. Try URLs with spaces, quotes, `<` and `>`, a very long URL, and `http://` alone. Then look at how each appears in `pingboard list`, on the dashboard and in `/metrics`: the dashboard and the metrics insert the URL as it is.
- `add` the same URL twice, and two URLs that differ only in a trailing slash.
- `remove` a URL that is not in the list.
- `check` with an empty list, `check --json`, `check --fail-fast` and both flags together. Compare the exit status with the table in the operator guide.
- `serve --port 0`.

### The target list on disk

Code: `pingboard/store.py`.

- Run several `pingboard add` commands at the same moment and count the targets afterwards. The list is read, changed and written back without a lock.
- Edit the data file by hand into something that is not valid JSON, or remove the `targets` key, while `pingboard serve` runs. Watch standard error of the server, `/healthz` and `pingboard_checks_total`.
- Make the data file or its directory unreadable or read-only.
- Point `PINGBOARD_DATA` at a path whose directory does not exist yet, then `add`.

### The check loop over time

Code: `server.loop` in `pingboard/server.py`.

- Add a target while the server runs; it should appear after the next cycle.
- Remove a target while the server runs, and watch the dashboard, `/api/status` and `/metrics` over the next cycles.
- Add several targets that time out, and measure how long it takes until the same target is checked again.
- Stop the target server and start it again; watch the state change and the log.

### The HTTP server

Code: `Handler` in `pingboard/server.py`.

- Paths that are almost right: `/healthz/`, `/metrics?x=1`, `/API/status`.
- Methods other than GET.
- Many requests at once while a cycle is running.
- `PINGBOARD_BIND` set to another address of the machine, and a port that is already taken.

### Settings

Code: `pingboard/config.py`.

- Each variable with an empty value, with text where a number is expected, and with a negative number.
- `PINGBOARD_INTERVAL` at 4, 5 and 6.
- A bad value for a setting that the command you run does not use, such as `PINGBOARD_PORT=abc pingboard list`.

## Report what you find

Open an issue at <https://github.com/example/pingboard/issues> with:

- the exact commands, including the `PINGBOARD_` variables you had set;
- what you expected, and where the documentation says so;
- what happened: the output, the exit status, and the lines from standard error of `pingboard serve`;
- your Python release and operating system.

If the finding is in an area that can be tested without a network, add a test that fails because of it; [Adding tests](../contributing/adding-tests.md) shows the pattern.
