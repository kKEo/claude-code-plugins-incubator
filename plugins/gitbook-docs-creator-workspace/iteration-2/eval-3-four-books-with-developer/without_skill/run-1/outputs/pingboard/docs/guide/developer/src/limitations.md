# Known limitations and ideas

This page lists where the current code falls short. It serves two purposes: it saves you from rediscovering a known problem, and it is a list of possible contributions. Before you start on one, open an issue or look for an existing one, so that the approach can be agreed first.

Items marked **(good first change)** are small and touch one module.

## Robustness

| Limitation | Where | Idea |
| --- | --- | --- |
| An unreadable or invalid data file ends the check loop for good, while the HTTP server keeps serving old results | `server.loop` | Catch the exception, log an error and try again at the next round |
| Non-numeric settings end in a traceback **(good first change)** | `config.load` | Catch `ValueError` and exit with a `pingboard:` message that names the variable |
| An unknown log level ends in a traceback at `serve` **(good first change)** | `config.load` | Validate against the known level names |
| A zero or negative timeout is accepted **(good first change)** | `config.load` | Reject it, as the interval below 5 is rejected |
| `--port 0` is ignored, because the code tests the value for truth | `cli.main` | Compare with `None` |
| Two simultaneous `add` or `remove` commands can lose one change | `cli.main`, `store` | Lock the file for the read-change-write sequence |
| A damaged data file makes every command fail with a traceback | `store.read` | Exit with a message that names the file |

## Correctness of the shown data

| Limitation | Where | Idea |
| --- | --- | --- |
| Results of removed targets stay until the restart | `server.loop` | Drop entries that are no longer in the list, under the lock |
| Target URLs are not escaped in the HTML page | `server.Handler.do_GET` | `html.escape` |
| Target URLs are not escaped in metric labels | `server.Handler.do_GET` | Escape backslash, double quote and newline as the Prometheus text format requires |
| Results carry no time, so their age is invisible | `check.Result` | Add a timestamp field; show it on the dashboard and as a metric |
| `/healthz` says `ok` although the loop may have stopped | `server` | Report unhealthy when the last round is older than expected |
| Routes are matched exactly, so `/healthz?x=1` gives 404 | `server.Handler.do_GET` | Parse the path with `urllib.parse` |
| `add` accepts any text after `http://` | `cli.main` | Parse the URL and require a host name |

## Scale

| Limitation | Where | Idea |
| --- | --- | --- |
| Checks run one after another, so a round with many slow targets takes long | `server.loop`, `cli.main` | A thread pool from `concurrent.futures`; mind the lock and the order of the output |
| The interval is a pause after a round, not a period, so the rhythm drifts with the duration of the round | `server.loop` | Sleep until the next due time |

## Usability

| Limitation | Where | Idea |
| --- | --- | --- |
| The dashboard does not refresh itself **(good first change)** | `server.Handler.do_GET` | A `<meta http-equiv="refresh">` tag |
| The dashboard shows neither status nor error | `server.Handler.do_GET` | Two more columns |
| No `--version` option **(good first change)** | `cli.main` | `importlib.metadata.version("pingboard")` |
| The text output of `check` does not show the error | `cli.main` | A `--verbose` option; the default output is an interface and should stay |
| `/metrics` has no `# HELP` and `# TYPE` lines | `server.Handler.do_GET` | Add them |

## Project

| Limitation | Idea |
| --- | --- |
| `make lint` fails with ruff 0.16.0 and later: six findings (`BLE001` in `check.py`, `UP035` and `UP006` in `store.py`, `I001` in two test files). It passes with ruff 0.14.0. Continuous integration installs the newest ruff **(good first change)** | Fix the findings, and pin ruff or select the rules in `pyproject.toml` |
| `check.py` and `server.py` have no automated tests | See the gap list and the patterns in the tester guide. Tests are the most useful first contribution |
| Development tools are not declared in `pyproject.toml` | An optional dependency group, for example `dev` |
| `pyproject.toml` has no `[build-system]` table | Declare the build backend explicitly |
| No changelog | A `CHANGELOG.md`, updated in each pull request |
| No `LICENSE` file, although the README and `pyproject.toml` say MIT | Add the licence text |
| Continuous integration does not build the documentation | Add a job that runs `make -C docs/guide build` |

## Not planned

These are outside the scope described in [Contributing a change](contributing.md): notifications, authentication, a history of results, a database, and checks other than HTTP GET.
