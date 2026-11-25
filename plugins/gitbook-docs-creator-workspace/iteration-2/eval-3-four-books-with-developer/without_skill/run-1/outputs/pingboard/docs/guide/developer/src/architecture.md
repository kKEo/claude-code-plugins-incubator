# Architecture

## The modules

pingboard has five modules. Three of them are small building blocks that know nothing about each other; two combine them.

```
                 cli.py
        (parses the command line)
          |      |       |      \
          v      v       v       v
     config.py store.py check.py server.py
     (settings) (target  (one     (check loop and
                 list)    check)   HTTP server)
                   ^        ^        |
                   +--------+--------+
                    server.py uses store.py and check.py
```

| Module | Responsibility | Depends on |
| --- | --- | --- |
| `config.py` | Read the settings from the environment into a `Config` object | nothing |
| `store.py` | Read and write the target list as a JSON file | nothing |
| `check.py` | Check one URL and return a `Result` | nothing |
| `server.py` | Check all targets in a loop; serve the results over HTTP | `check`, `store` |
| `cli.py` | Parse arguments and run one of the five commands | all of the above |

The rule behind this structure: **the building blocks stay independent.** `config`, `store` and `check` do not import each other and do not import `cli` or `server`. Settings reach them as function arguments (`check(url, timeout)`, `read(path)`), never through a global. This keeps them easy to test in isolation.

## Data flow

### `pingboard add` and `pingboard remove`

```
cli.main -> config.load() -> store.read(data_file) -> change the list -> store.write(data_file, list)
```

### `pingboard check`

```
cli.main -> config.load() -> store.read(data_file)
         -> for each URL: check.check(url, timeout) -> print
         -> exit with 1 if any target is down
```

### `pingboard serve`

```
cli.main -> config.load() -> server.serve(cfg)
                                 |
            +--------------------+---------------------+
            v                                          v
   thread "loop" (daemon)                    main thread: ThreadingHTTPServer
   forever:                                  for each request, in its own thread:
     store.read(data_file)                     Handler.do_GET
     for each URL:                               reads results / checks_total
       check.check(url, timeout)                 under the lock
       results[url] = result   (under the lock)
       checks_total += 1
     sleep(interval)
```

## State

| State | Where | Lifetime |
| --- | --- | --- |
| Target list | JSON file, path from `PINGBOARD_DATA` | Permanent |
| Latest result per URL | `server.results`, a module-level dictionary | Until the process ends |
| Number of checks | `server.checks_total`, a module-level integer | Until the process ends |
| Settings | A frozen `Config` object, created once per command | Until the process ends |

There is no database and no history. Each new result replaces the previous result of the same URL.

## Threads and locking

`pingboard serve` runs these threads:

* The **main thread** runs `ThreadingHTTPServer.serve_forever()`.
* The **loop thread** runs `server.loop(cfg)`. It is a daemon thread, so it does not keep the process alive when the main thread ends.
* One short-lived **request thread** per HTTP request.

`server.results` and `server.checks_total` are shared between the loop thread and the request threads. One lock, `server.lock`, protects them. Two rules apply to every change in `server.py`:

1. Read and write the shared state only inside `with lock:`.
2. Do nothing slow inside the lock. In particular, the network request of a check happens outside the lock, and only the assignment of its result happens inside. A request handler builds its response body inside the lock and sends it after the lock is released.

The target list needs no lock inside the process. Other processes change it (`pingboard add` in another terminal), and `store.write` makes that safe by writing a temporary file and renaming it over the data file, which is atomic. A reader sees the old or the new file, never a mixture.

## Design decisions

These decisions explain why the code looks the way it does. Discuss in an issue before you propose to reverse one.

| Decision | Reason |
| --- | --- |
| Standard library only | Installation never fails on a dependency, and there is nothing to keep up to date |
| Settings from the environment only | One mechanism that works the same in a shell, a service unit and a container |
| One JSON file as storage | The data is a short list of strings; a human can read, back up and repair it |
| The list is re-read at every round | Targets can be changed without a restart and without a signal or an API |
| Checks run one after another | The simplest correct loop. It limits the number of targets; see [Known limitations and ideas](limitations.md) |
| "Up" means a status below 400 | Redirects that end on a working page count as up; client and server errors count as down |
| `check` never raises | Every failure becomes a `Result` with `up=False`, so no caller needs error handling |
| Server binds to `127.0.0.1` by default | The server has no authentication, so exposing it must be a deliberate step |

## Error handling

The command line reports problems that a user can cause with `sys.exit("pingboard: <message>")`, which prints the message to standard error and exits with status 1. `config.load` does the same with `raise SystemExit(...)`. Follow this pattern for new validation. Everything else currently ends in a Python traceback.
