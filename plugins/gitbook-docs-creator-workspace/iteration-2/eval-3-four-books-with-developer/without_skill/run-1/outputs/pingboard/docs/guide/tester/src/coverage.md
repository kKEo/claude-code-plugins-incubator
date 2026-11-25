# What the tests cover

The tests are in the `tests/` folder, one file per module of the `pingboard` package.

## Existing tests

| Test | File | What it proves |
| --- | --- | --- |
| `test_defaults` | `tests/test_config.py` | Without environment variables, the port is 8080, the interval 60 and the timeout 5.0 |
| `test_interval_floor` | `tests/test_config.py` | An interval below 5 seconds stops the program |
| `test_roundtrip_sorted_unique` | `tests/test_store.py` | A written list is read back sorted and without duplicates |
| `test_missing_file_is_empty` | `tests/test_store.py` | A missing data file reads as an empty list |
| `test_add_rejects_non_http` | `tests/test_cli.py` | `pingboard add` refuses a URL that does not start with `http://` or `https://` |

## Coverage by module

| Module | Automated tests | State |
| --- | --- | --- |
| `pingboard/config.py` | 2 | Defaults for three of six settings and the interval limit are covered |
| `pingboard/store.py` | 2 | The normal paths are covered |
| `pingboard/cli.py` | 1 | One validation rule of `add` is covered |
| `pingboard/check.py` | 0 | Not covered |
| `pingboard/server.py` | 0 | Not covered |

## Known gaps

These behaviours have no automated test. They are listed by risk, highest first. Each one is a welcome contribution; [Writing tests](writing.md) shows a pattern for most of them.

### The check (`check.py`)

* A status below 400 gives `up`; a status from 400 gives down with that status.
* A refused connection, an unknown host and a timeout give down with status 0 and an error text.
* Redirects are followed and the final status is reported.
* The request carries `User-Agent: pingboard`.

### The command line (`cli.py`)

* `add` stores an accepted URL; `remove` deletes it; `remove` fails for an unknown URL.
* `list` prints one URL per line.
* `check` prints the text format, and with `--json` a JSON array.
* `check` exits with 1 when a target is down and with 0 otherwise, also for an empty list.
* `check --fail-fast` stops after the first down target.
* `serve --port` overrides `PINGBOARD_PORT`.

### The server (`server.py`)

* `/healthz` answers `ok`; an unknown path answers 404.
* `/api/status`, `/metrics` and `/` show the stored results.
* The loop stores a result per target and counts the checks.
* The loop logs a warning for a down target.

### Configuration (`config.py`)

* Defaults of `PINGBOARD_BIND`, `PINGBOARD_DATA` and `PINGBOARD_LOG_LEVEL`.
* Each variable overrides its default.

### Storage (`store.py`)

* The parent directory is created when it is missing.
* No temporary file is left after a write.

## Behaviour that is not specified

Some behaviour exists in the code but was probably never decided. Do not pin it down with a test without asking in an issue first, because a test turns an accident into a promise:

* Results of removed targets stay in memory until the restart.
* A data file with invalid content stops the check loop permanently.
* Non-numeric settings end in a Python traceback instead of a clean message.
* Target URLs are not escaped in the HTML page and in the metrics output.
