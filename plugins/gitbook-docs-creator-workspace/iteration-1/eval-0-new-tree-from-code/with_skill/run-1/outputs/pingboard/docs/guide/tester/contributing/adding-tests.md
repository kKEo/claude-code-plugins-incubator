# Adding tests

This page shows which test to write for a change, where the file goes and what it looks like, using the conventions of the tests that exist in `tests/`.

## Which test for which change

| You changed | Write | In |
|---|---|---|
| A setting: a new variable, a default, a limit | A test that sets or removes the variable and calls `config.load()` | `tests/test_config.py` |
| How the target list is read or written | A test that writes and reads a file in a temporary directory | `tests/test_store.py` |
| A command, a flag, an exit status, a message | A test that calls `cli.main([...])` with the arguments | `tests/test_cli.py` |
| The rule for up and down, or the fields of a result | A test of `check.check`. None exists yet; it needs a target that does not depend on the network, such as a server the test starts on `127.0.0.1`. | a new `tests/test_check.py` |
| A route, a metric, the check loop | A test of `pingboard/server.py`. None exists yet. | a new `tests/test_server.py` |

A change to settings, commands, flags, routes or metrics also needs its row in the operator guide, or `make docs-check` fails; see [Continuous integration](../gates/ci.md#the-docs-workflow).

## Conventions

The existing tests all follow these, and a new test should too.

- One file per module, named `tests/test_<module>.py`.
- Plain functions named `test_<what it proves>`. No classes, no shared fixture file.
- Import the module under test from the package: `from pingboard import store`.
- Never touch the real target list. Use pytest's `tmp_path` for files, and point the product at it with `monkeypatch.setenv("PINGBOARD_DATA", ...)`.
- Change the environment only through `monkeypatch`, so that it is restored after the test.
- Call the command line in-process with `cli.main([...])`, not as a subprocess.
- An expected exit is caught with `pytest.raises(SystemExit)`.
- No network access.

## An example to copy

This is `tests/test_store.py::test_roundtrip_sorted_unique`. It shows the whole pattern: a temporary file, one action, one assertion.

```python
from pingboard import store


def test_roundtrip_sorted_unique(tmp_path):
    f = tmp_path / "t.json"
    store.write(f, ["https://b.example", "https://a.example", "https://b.example"])
    assert store.read(f) == ["https://a.example", "https://b.example"]
```

And this is the pattern for a command, from `tests/test_cli.py`:

```python
import pytest
from pingboard import cli


def test_add_rejects_non_http(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    with pytest.raises(SystemExit):
        cli.main(["add", "ftp://example.org"])
```

> **Tip.** `pytest.raises(SystemExit)` accepts any exit. When the message or the status matters, keep the exception and assert on it: `with pytest.raises(SystemExit) as e:` and then compare `e.value.code`, which holds the message for an exit with text and the number for an exit with a status.

## Run your test

```bash
# The new test alone, then everything.
python -m pytest -q tests/test_store.py::test_roundtrip_sorted_unique
make test
make lint
```

## Pull-request checklist

- The change has a test that fails without it and passes with it, or the description says why it cannot have one and how you checked it by hand.
- `make test` passes.
- `make lint` reports nothing new in the files you touched.
- A new or changed setting, command, flag, route or metric is in the operator guide, and `make docs-check` passes.
- The new test uses no network and no file outside `tmp_path`.
