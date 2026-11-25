# Architecture and code layout

This chapter is the code view of pingboard: which module owns what, what it may call, the main data types, and the path of a typical command through the functions.

The whole program is the Python package `pingboard/`, five small modules that use only the standard library. What the program does at run time (processes, threads, the targets file) is described in the operator guide's [System overview](../../operator/intro/overview.md); this chapter says where the code for each of those lives.

## Layout

```text
pingboard/
  __init__.py   empty
  cli.py        argument parser and dispatch; the entry point
  config.py     settings from the environment
  store.py      the targets file
  check.py      one check of one URL
  server.py     the checker loop and the HTTP handler
tests/          pytest tests, one file per module
pyproject.toml  package metadata and the console script
Makefile        test, lint, run and the docs targets
```

## Modules

| Module | Owns | Imports from the package |
|---|---|---|
| `pingboard/cli.py` | `main(argv=None)`: builds the `argparse` parser, loads the settings, runs the chosen command | `check`, `config`, `server`, `store` |
| `pingboard/config.py` | The `Config` dataclass and `load()` | nothing |
| `pingboard/store.py` | `read(path)` and `write(path, targets)` for the targets file | nothing |
| `pingboard/check.py` | The `Result` dataclass and `check(url, timeout)` | nothing |
| `pingboard/server.py` | `loop(cfg)`, the `Handler` class, `serve(cfg)` and the shared state `results`, `checks_total`, `lock` | `check`, `store` |

The imports point one way: `cli` uses everything, `server` uses `check` and `store`, and `config`, `store` and `check` use nothing from the package. Keep it so; the three leaf modules can then be tested without a server or a parser.

## Data types

`Config` (`pingboard/config.py`) is a frozen dataclass with the fields `port`, `bind`, `interval`, `timeout`, `data_file` and `log_level`. `load()` is the only place that reads `os.environ`; every other function receives the values it needs as arguments (`cfg`, `cfg.data_file`, `cfg.timeout`). Because `Config` is frozen, the `--port` flag does not change it: `cli.main()` builds a new `Config` with the other fields copied.

`Result` (`pingboard/check.py`) is a dataclass with `url`, `up`, `status`, `millis` and `error`. Its `__dict__` is what `pingboard check --json` and `/api/status` print, so adding or renaming a field changes both outputs.

The targets are a plain `List[str]`. `store.write()` sorts and removes duplicates, writes a `.tmp` file and renames it with `os.replace()`, so that a reader in another process never sees a partial file.

## Path of a command

Every command starts the same way. The console script `pingboard`, declared under `[project.scripts]` in `pyproject.toml`, calls `cli.main()`. `main()` parses the arguments and then calls `config.load()`, before it looks at the command; this is why an invalid setting stops every command.

`pingboard check`:

1. `cli.main()` calls `store.read(cfg.data_file)` to get the targets.
2. For each target it calls `check.check(url, cfg.timeout)`, which opens the URL with `urllib.request.urlopen()` and returns a `Result`. An `HTTPError` becomes a `Result` with the error status; any other exception becomes a `Result` with status `0`. `check()` never raises.
3. `main()` prints a line per result, or collects `res.__dict__` for `--json`, and calls `sys.exit(1)` when any target was down.

`pingboard serve`:

1. `cli.main()` applies `--port` and calls `server.serve(cfg)`.
2. `serve()` configures logging, starts `loop(cfg)` on a daemon thread and runs a `ThreadingHTTPServer` with `Handler` on the main thread.
3. `loop()` runs forever: `store.read()`, then `check.check()` per target, storing each `Result` in the module-level dictionary `results` and incrementing `checks_total`, both under `lock`; then `time.sleep(cfg.interval)`.
4. `Handler.do_GET()` compares `self.path` with the four known paths, reads `results` under `lock`, and answers through `Handler._send()`.

## Things that are the way they are for a reason

- **Module-level state in `server.py`.** `results`, `checks_total` and `lock` are globals because `ThreadingHTTPServer` creates a new `Handler` per request; the handler has no other place to find the shared state. Every read and write takes `lock`.
- **The checker is a daemon thread.** The process exits when the main thread does, without waiting for a check in flight.
- **`Handler.log_message()` is overridden.** It sends the standard request log to the `pingboard` logger at debug level, so requests do not appear at the default level.
- **`loop()` has no `try`.** An exception from `store.read()` ends the thread. The operator guide documents this as current behaviour; a change here needs a change in its [Troubleshooting runbook](../../operator/operations/troubleshooting.md).
