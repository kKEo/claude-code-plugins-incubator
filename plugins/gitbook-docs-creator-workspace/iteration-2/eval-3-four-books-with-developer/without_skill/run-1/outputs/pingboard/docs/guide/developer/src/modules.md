# Module reference

This page describes every public name of the package. pingboard does not promise a stable Python API; the names can change between versions. The stable interfaces are the command line, the environment variables, the HTTP routes and the format of the data file.

## `pingboard.config`

### `Config`

A frozen data class with the settings.

| Field | Type | Environment variable | Default |
| --- | --- | --- | --- |
| `port` | `int` | `PINGBOARD_PORT` | `8080` |
| `bind` | `str` | `PINGBOARD_BIND` | `127.0.0.1` |
| `interval` | `int` | `PINGBOARD_INTERVAL` | `60` |
| `timeout` | `float` | `PINGBOARD_TIMEOUT` | `5` |
| `data_file` | `Path` | `PINGBOARD_DATA` | `~/.pingboard/targets.json` |
| `log_level` | `str` | `PINGBOARD_LOG_LEVEL` | `info` |

Because the class is frozen, a changed copy must be built as a new object. `cli.py` does this for `--port`.

### `load() -> Config`

Reads the environment and returns a `Config`. Raises `SystemExit` with a message when the interval is below 5. Raises `ValueError` when a numeric variable is not a number.

`load` reads the environment at each call and caches nothing, which is what makes it testable with `monkeypatch.setenv`.

## `pingboard.store`

### `read(path: Path) -> List[str]`

Returns the list under the key `targets` of the JSON file. Returns an empty list when the file does not exist. Raises `json.JSONDecodeError` or `KeyError` when the file is damaged.

### `write(path: Path, targets: List[str]) -> None`

Writes the list, sorted and without duplicates, as `{"targets": [...]}`. Creates missing parent directories. Writes to a sibling file with the suffix `.tmp` first and then replaces the data file with `os.replace`, so that the change is atomic.

## `pingboard.check`

### `Result`

A data class with the outcome of one check.

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | `str` | The checked URL |
| `up` | `bool` | `True` when the status is below 400 |
| `status` | `int` | HTTP status; `0` when no HTTP response arrived |
| `millis` | `int` | Duration in milliseconds, measured with a monotonic clock |
| `error` | `str` | Text of the exception for a failed check; empty by default |

The fields of `Result` are part of two external interfaces: `pingboard check --json` and `/api/status` both serialise `Result.__dict__`. Adding a field changes both outputs; renaming or removing a field breaks their users.

### `check(url: str, timeout: float) -> Result`

Sends one GET request with the header `User-Agent: pingboard` through `urllib.request.urlopen` and returns a `Result`. It never raises:

| Outcome | `up` | `status` | `error` |
| --- | --- | --- | --- |
| Response with a status below 400 | `True` | the status | empty |
| `HTTPError` (status 400 or above) | `False` | the status | text of the error |
| Any other exception: DNS failure, refused connection, timeout, TLS error, invalid URL | `False` | `0` | text of the exception |

`urlopen` follows redirects, so `status` is the status of the final response. The body of the response is not read.

## `pingboard.server`

### Module state

| Name | Type | Meaning |
| --- | --- | --- |
| `results` | `dict` of URL to `Result` | Latest result per URL |
| `checks_total` | `int` | Number of checks since the start |
| `lock` | `threading.Lock` | Protects the two names above |
| `log` | `logging.Logger` | The logger named `pingboard` |

### `loop(cfg)`

Runs for ever: reads the target list, checks each target, stores each result under the lock, logs a warning for each down target and sleeps for `cfg.interval` seconds. It never removes an entry from `results`. An exception from `store.read` ends the loop, and with it the thread.

### `Handler`

A `BaseHTTPRequestHandler` with one method per concern:

* `do_GET` compares `self.path` with the four known paths (`/healthz`, `/metrics`, `/api/status`, `/`) and answers 404 for anything else.
* `_send(code, ctype, body)` writes a complete response from a status, a content type and a text body.
* `log_message` redirects the access log of the standard library to the `pingboard` logger at debug level.

### `serve(cfg)`

Configures logging, starts `loop` in a daemon thread and runs a `ThreadingHTTPServer` on `cfg.bind` and `cfg.port`. It does not return.

## `pingboard.cli`

### `main(argv=None)`

The entry point of the `pingboard` command, registered in `pyproject.toml` under `[project.scripts]`. It builds the argument parser, loads the configuration and runs the chosen command. `argv` is a list of arguments without the program name; `None` means `sys.argv[1:]`. Tests pass a list.

| Command | Implementation in short |
| --- | --- |
| `add <url>` | Validates the prefix, then `store.write(read() + [url])` |
| `remove <url>` | Fails if the URL is absent, then writes the list without it |
| `list` | Prints `store.read()` joined with newlines |
| `check [--json] [--fail-fast]` | Checks each target; prints lines or one JSON array; `sys.exit(1 if down else 0)` |
| `serve [--port]` | Replaces the port in the configuration if given, then `server.serve(cfg)` |

Two details to keep in mind:

* `main` calls `config.load()` before it looks at the command, so every command fails on an invalid setting.
* `check` always ends with `sys.exit`, also on success. A test must expect `SystemExit`.
