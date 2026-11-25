# Adding tests

This page says which test to write for which change, where the file goes and what the existing tests look like, and ends with the checklist for a pull request.

## Which test for which change

| You changed | Add a test in | Pattern to copy |
|---|---|---|
| A setting, a default or its validation in `pingboard/config.py` | `tests/test_config.py` | `test_defaults`, `test_interval_floor` |
| How the targets file is read or written in `pingboard/store.py` | `tests/test_store.py` | `test_roundtrip_sorted_unique` |
| A subcommand or flag in `pingboard/cli.py` | `tests/test_cli.py` | `test_add_rejects_non_http` |
| The check in `pingboard/check.py` | a new `tests/test_check.py` | none yet |
| The loop or a route in `pingboard/server.py` | a new `tests/test_server.py` | none yet |

For the last two rows there is no existing test to copy, and the project has no agreed way to fake a target or to start the server in a test. Until one exists, describe in the pull request how you checked the change by hand, following [Exploring by hand](../explore/by-hand.md).

## Conventions the existing tests follow

- One file per module, named `tests/test_<module>.py`.
- Plain functions named `test_<what is checked>`. No classes, no shared fixtures file.
- Only the two fixtures built into pytest: `tmp_path` for files and `monkeypatch` for environment variables.
- A test never touches the real targets file. It either passes a path under `tmp_path` to `store`, or sets `PINGBOARD_DATA` to one.
- A command is called in process as `cli.main([...])` with its arguments as a list.
- An expected exit is asserted with `pytest.raises(SystemExit)`.
- No test uses the network.

## A minimal example

This is `tests/test_cli.py` as it is. It shows the fixture use, the in-process call and the exit assertion in one test.

```python
import pytest
from pingboard import cli


def test_add_rejects_non_http(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    with pytest.raises(SystemExit):
        cli.main(["add", "ftp://example.org"])
```

A test for a setting clears the variables it depends on first, as `test_defaults` in `tests/test_config.py` does with `monkeypatch.delenv(k, raising=False)`, so that it passes on a machine where they are set.

Run the new test alone, then the whole suite:

```bash
python -m pytest -q tests/test_cli.py::test_add_rejects_non_http
make test
```

## Pull-request checklist

- The change has a test in the file named in the table above, or the description says how it was checked by hand.
- The new test fails without the change and passes with it.
- The test uses `tmp_path` or `PINGBOARD_DATA`, never `~/.pingboard`.
- `make test` passes.
- `make lint` reports nothing new for the files you touched.
- When behaviour that the documentation describes has changed, the page in the operator guide is updated in the same pull request.
