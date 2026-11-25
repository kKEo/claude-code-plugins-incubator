# Exploring by hand

This chapter explains how to set up a safe sandbox, which areas of pingboard are worth probing by hand, what to try in each, and how to report what you find.

Most of pingboard's behaviour has no automated test: the check itself, the dashboard and most commands. Exploring by hand is how those areas get checked.

## Set up a sandbox

Use your own targets file and port so that nothing touches a real list or a running dashboard.

```bash
export PINGBOARD_DATA="$(mktemp -d)/targets.json"
export PINGBOARD_PORT=18080
export PINGBOARD_INTERVAL=5
```

For targets you control, serve a directory locally in a second terminal. It answers `200` for the directory and `404` for a file that does not exist.

```bash
python3 -m http.server 18081 --bind 127.0.0.1
```

```bash
pingboard add http://127.0.0.1:18081/
pingboard add http://127.0.0.1:18081/missing
pingboard check
```

The first target is reported `up` with status 200, the second `DOWN` with status 404, and the command exits with status 1.

## Areas worth probing

| Area | Why | What to try |
|---|---|---|
| The URL given to `add` | The only validation is the `http://` or `https://` prefix | URLs with spaces, quotes, `<` and `>`, very long URLs, the same site with and without a trailing slash. Then look at the dashboard page and `/metrics`: the code inserts the URL into the HTML and into the `url` label without escaping |
| The up rule | No test covers `pingboard/check.py` | Targets that answer just below and at status 400, redirects, a target that answers more slowly than `PINGBOARD_TIMEOUT`, a name that does not resolve, a port nobody listens on. Compare `status` and `error` in `pingboard check --json` |
| `check` exit status and flags | Scripts depend on them | An empty list, all up, one down; `--fail-fast` with the down target first and last; `--json` together with `--fail-fast` |
| The targets file | It is read on every round, without error handling | Edit it by hand while `serve` runs: add a target, remove one, make it invalid JSON. Watch standard error and whether `pingboard_checks_total` still grows. Run two `add` commands at the same moment |
| Dashboard lifetime | Results are kept per URL and never deleted | Remove a target while `serve` runs and look at `/`, `/api/status` and `/metrics`. Restart and look again |
| HTTP paths | No test covers `pingboard/server.py` | The four paths, a path with a query string or a trailing slash, a method other than `GET`, many requests at once |
| Settings | Only the interval is validated | `PINGBOARD_INTERVAL` at 4 and 5, values that are not numbers, an unknown `PINGBOARD_LOG_LEVEL`, a port in use, `serve --port` together with `PINGBOARD_PORT` |

The operator guide states the intended behaviour for all of these: [Commands and flags](../../operator/config/commands.md), [Environment variables and settings](../../operator/config/environment.md) and [HTTP endpoints](../../operator/config/http.md). A difference between those pages and what you see is a finding, in the code or in the page.

## Report what you find

Open an issue at <https://github.com/example/pingboard/issues> with:

- the commands you ran, in order, and the `PINGBOARD_` variables that were set;
- the content of the targets file, when it matters;
- what you expected, with a link to the page that says so;
- what happened: the output, the exit status (`echo $?`) and any traceback from standard error;
- your Python version (`python3 --version`) and operating system.

A finding that can be reproduced with a short test belongs in the suite; see [Adding tests](../contributing/adding-tests.md).
