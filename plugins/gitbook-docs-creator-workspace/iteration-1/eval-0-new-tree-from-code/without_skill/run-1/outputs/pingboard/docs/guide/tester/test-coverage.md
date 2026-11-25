# Test coverage

The suite has five tests. This page shows which behaviour they protect and
which behaviour is verified only by hand. The repository has no coverage
measurement; the table comes from reading the tests against the code.

## Coverage by module

| Module | Behaviour | Automated | Manual case |
| --- | --- | --- | --- |
| `config` | Defaults for port, interval and timeout | Yes | |
| `config` | Interval below 5 is rejected | Yes | C-2 |
| `config` | Defaults for bind address, data file and log level | No | C-1 |
| `config` | Non-numeric values | No | C-3 |
| `store` | Write and read back, sorted and unique | Yes | T-2 |
| `store` | Missing file is an empty list | Yes | T-5 |
| `store` | Parent folder is created, write is atomic | No | T-1 |
| `store` | Invalid file content | No | S-7 |
| `cli` | `add` rejects a URL that is not HTTP or HTTPS | Yes | T-3 |
| `cli` | `add`, `remove`, `list` on valid input | No | T-1, T-2, T-4 |
| `cli` | `remove` of an unknown URL | No | T-4 |
| `cli` | `check`: output, `--json`, `--fail-fast`, exit code | No | K-1 to K-6 |
| `cli` | `serve --port` | No | S-1 |
| `check` | Up, HTTP error, connection error, timeout, redirect | No | K-1 to K-3 |
| `server` | Check loop | No | S-2, S-5, S-6, S-7 |
| `server` | `/`, `/api/status`, `/metrics`, `/healthz`, 404 | No | S-3, S-4 |

## Where to add tests first

In order of risk:

1. **`check.check`**. It decides what "up" means and is the core of the
   product, but it has no test at all.
2. **`pingboard check`**. Scripts depend on its exit code and its JSON output.
3. **The HTTP routes**, above all `/metrics` and `/api/status`, because
   monitoring systems parse them.
4. **The check loop**, including what happens when the targets file is
   invalid.

[Automated tests](automated-tests.md#writing-a-new-test) gives hints for each
of them.

## Measuring coverage

To get numbers, install `pytest-cov` and run:

    pip install pytest-cov
    python -m pytest --cov=pingboard --cov-report=term-missing

This is not part of `make test` or of CI.
