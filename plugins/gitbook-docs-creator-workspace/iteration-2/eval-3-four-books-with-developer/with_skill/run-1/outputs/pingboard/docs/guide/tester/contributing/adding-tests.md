# Adding tests

This chapter says which test to write for which kind of change, where the file goes, what a test looks like in this repository, and what to check before you open a pull request.

## Which test for which change

| Change | Test file | Pattern to follow |
|---|---|---|
| A setting or its default | `tests/test_config.py` | Set or delete the variable with `monkeypatch`, call `config.load()`, compare fields |
| The targets file | `tests/test_store.py` | Write and read a file under `tmp_path` |
| A command, a flag, an error message | `tests/test_cli.py` | Call `cli.main([...])` with the arguments as a list |
| The check or the up rule | `tests/test_check.py` (does not exist yet) | No existing pattern |
| An HTTP path, a metric, the checker loop | `tests/test_server.py` (does not exist yet) | No existing pattern |

For the last two rows there is no test to copy from. The existing suite needs no network and starts no server; a new test that needs an HTTP response should get it from a server it starts itself on `127.0.0.1`, not from the internet, so that the suite keeps passing offline.

## Conventions the existing tests follow

- One file per module, named `tests/test_<module>.py`.
- Plain functions named `test_<what_is_checked>`; no classes, no shared fixtures file.
- Only pytest's built-in fixtures: `monkeypatch` for environment variables and `tmp_path` for files.
- A test never uses the real targets file. A test that reaches `store` through the command line sets `PINGBOARD_DATA` to a path under `tmp_path` first.
- A command that should fail is expected to raise `SystemExit`.

## A minimal example

This is `tests/test_cli.py` as it stands. It shows all of the conventions at once:

```python
import pytest
from pingboard import cli


def test_add_rejects_non_http(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    with pytest.raises(SystemExit):
        cli.main(["add", "ftp://example.org"])
```

Run a new test alone while you write it:

```bash
python -m pytest -q tests/test_cli.py::test_add_rejects_non_http
```

## Pull-request checklist

- The change has a test that fails without it and passes with it, or the description says why it cannot have one.
- `make lint` and `make test` pass locally.
- New tests need no network access and leave no files outside `tmp_path`.
- A test that sets an environment variable does it with `monkeypatch`, so the value does not leak into other tests.
- [What is tested where](../start/map.md) is updated when a new area gets its first test.
- `make docs-check` passes when the change adds or renames a setting, command, flag or metric.
