# Adding tests

This page says where a new test goes, shows a minimal example taken from the existing tests,
and ends with the checklist for a pull request.

The project's rule is that new behaviour needs a test in one of the two test files.

## Where the test goes

| The change touches | Put the test in |
|---|---|
| Settings and their defaults, the database, the server | [`tests/test_api.py`](https://github.com/example/notekeep/blob/HEAD/tests/test_api.py) |
| A command, its output or its exit status | [`tests/test_cli.py`](https://github.com/example/notekeep/blob/HEAD/tests/test_cli.py) |

## The conventions the existing tests follow

- Every test takes pytest's `tmp_path` and points `NOTEKEEP_DB` at a file inside it, so no
  test touches real notes.
- `notekeep.py` reads its settings when it is imported. A test that changes a setting must
  reload the module; `tests/test_api.py` has the helper `load(tmp_path, **env)` for this.
- A command is tested by calling `notekeep.main([...])` with the arguments as a list.

## A minimal example

This is `tests/test_cli.py::test_show_missing_note_exits`:

```python
def test_show_missing_note_exits(tmp_path):
    os.environ["NOTEKEEP_DB"] = str(tmp_path / "n.db")
    import notekeep
    with pytest.raises(SystemExit):
        notekeep.main(["show", "nope"])
```

A test for a setting uses the helper, as `tests/test_api.py::test_default_port` does:

```python
def test_default_port(tmp_path):
    os.environ.pop("NOTEKEEP_PORT", None)
    assert load(tmp_path).PORT == 7070
```

Run your new test alone while you write it:

```bash
python3 -m pytest -q tests/test_cli.py::test_show_missing_note_exits
```

## Before you open a pull request

- The new behaviour has a test in `tests/test_api.py` or `tests/test_cli.py`.
- `./run-tests.sh` passes.
- When you added a setting or a command, it is in the operator guide's
  [configuration reference](../../operator/config/README.md), and `make docs-check` passes.
