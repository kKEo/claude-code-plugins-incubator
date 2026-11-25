# Adding tests

This page says where a new test goes, what it has to look like and what to check before you
open a pull request. The rule of the project is that new behaviour needs a test.

## Where the test goes

| Change | File | Run it |
|---|---|---|
| A setting, a default, the database schema, the HTTP handler | `tests/test_api.py` | `python3 -m pytest -q tests/test_api.py` |
| A command, its output or its exit status | `tests/test_cli.py` | `python3 -m pytest -q tests/test_cli.py` |

`run-tests.sh` runs everything under `tests/`, so a test in either file runs in CI without
any other change.

## Two conventions every test keeps

1. **Use a temporary database.** Set `NOTEKEEP_DB` to a file under pytest's `tmp_path`
   before the code runs, so that the test never opens `~/.notekeep/notes.db`.
2. **Reload the module after changing a setting.** `notekeep.py` reads its environment
   variables once, when it is imported. A test that sets a variable has to import the
   module again. `tests/test_api.py` has a helper for both steps:

```python
def load(tmp_path, **env):
    os.environ["NOTEKEEP_DB"] = str(tmp_path / "n.db")
    os.environ.update(env)
    import notekeep
    return importlib.reload(notekeep)
```

## A minimal test for a setting or the database

Copied from `tests/test_api.py`:

```python
def test_schema_created(tmp_path):
    nk = load(tmp_path)
    assert nk.db().execute("SELECT count(*) FROM notes").fetchone()[0] == 0
```

## A minimal test for a command

Copied from `tests/test_cli.py`. Call `notekeep.main` with the arguments as a list:

```python
def test_show_missing_note_exits(tmp_path):
    os.environ["NOTEKEEP_DB"] = str(tmp_path / "n.db")
    import notekeep
    with pytest.raises(SystemExit):
        notekeep.main(["show", "nope"])
```

> **Note.** No existing test starts the HTTP server, so there is no example to copy for a
> request test. The first one has to set that pattern.

## Before you open the pull request

- The new test fails without your change and passes with it.
- `./run-tests.sh` passes from the root of the repository.
- The test sets `NOTEKEEP_DB` to a path under `tmp_path`.
- If you added a setting or a command, it is on its reference page in the operator guide;
  `make docs-check` fails when it is not.
