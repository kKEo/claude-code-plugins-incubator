# Automated tests

## Run the suite

    make test          # python -m pytest -q
    make lint          # python -m ruff check pingboard tests

Both must pass before a change is merged. The suite needs no network and
finishes in about a second.

Useful variations:

    python -m pytest -q tests/test_store.py           # one file
    python -m pytest -q -k interval                   # tests whose name matches
    python -m pytest -x -vv                           # stop at the first failure, verbose

## The existing tests

| File | Test | Verifies |
| --- | --- | --- |
| `tests/test_cli.py` | `test_add_rejects_non_http` | `pingboard add ftp://example.org` exits with an error |
| `tests/test_config.py` | `test_defaults` | Without environment variables: port 8080, interval 60, timeout 5.0 |
| `tests/test_config.py` | `test_interval_floor` | `PINGBOARD_INTERVAL=2` makes `config.load()` exit |
| `tests/test_store.py` | `test_roundtrip_sorted_unique` | A written list is read back sorted and without duplicates |
| `tests/test_store.py` | `test_missing_file_is_empty` | A missing targets file reads as an empty list |

## Conventions

- **No real files.** Tests that touch the targets file use the `tmp_path`
  fixture and, for the command line, set `PINGBOARD_DATA` to a path below it.
- **No real environment.** Tests set and remove variables with
  `monkeypatch.setenv` and `monkeypatch.delenv`, so they do not depend on the
  shell they run in.
- **No network.** A test must not call a public website.
- **Exits are expected results.** Error paths end with `SystemExit`; assert
  them with `pytest.raises(SystemExit)`.
- **The command line is called in-process** through `cli.main([...])`, not as
  a subprocess.

## Writing a new test

A command-line test follows this pattern:

    import pytest
    from pingboard import cli, store


    def test_remove_unknown_target(monkeypatch, tmp_path):
        data = tmp_path / "t.json"
        monkeypatch.setenv("PINGBOARD_DATA", str(data))
        store.write(data, ["https://a.example"])
        with pytest.raises(SystemExit):
            cli.main(["remove", "https://b.example"])
        assert store.read(data) == ["https://a.example"]

Hints for the parts that have no tests yet:

- **`check.check`**: start a `http.server.HTTPServer` on port 0 in a thread
  inside the test and check its URL, or replace `urllib.request.urlopen` with
  `monkeypatch.setattr`.
- **`pingboard check`**: replace `check.check` with a function that returns
  prepared `Result` objects, read the output with the `capsys` fixture and
  assert the exit code through `pytest.raises(SystemExit)`. Note that
  `pingboard check` always ends with `SystemExit`, also on success (code 0).
- **HTTP routes**: start `ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)`
  in a thread and request the paths. `server.results` and
  `server.checks_total` are module-level state; reset them in each test.
- **The check loop**: `server.loop` never returns. Test one round by making
  the replaced `time.sleep` raise an exception.

Put new tests into `tests/test_<module>.py`, named after the module they
verify.
