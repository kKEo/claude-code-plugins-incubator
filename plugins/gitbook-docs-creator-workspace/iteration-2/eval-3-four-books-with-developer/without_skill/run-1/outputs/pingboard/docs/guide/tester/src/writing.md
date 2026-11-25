# Writing tests

## Conventions

* One test file per module: tests for `pingboard/store.py` go into `tests/test_store.py`.
* Tests are plain functions named `test_<behaviour>`. Name the behaviour, not the function under test: `test_missing_file_is_empty`, not `test_read_2`.
* Use plain `assert` statements and the fixtures that pytest provides. The project uses no other test library.
* One behaviour per test. A test that fails should tell the reader what is broken by its name alone.
* Tests must run on Python 3.9 and pass `make lint`. Recent ruff versions also check the order of imports: standard library first, then third-party packages such as pytest, then `pingboard`, with an empty line between the groups.

## Rules that keep the suite reliable

1. **No real network.** Never check a public URL from a test. Start a local server inside the test, as shown below.
2. **No real home directory.** Without `PINGBOARD_DATA`, pingboard uses `~/.pingboard/targets.json`. Every test that reaches `config.load()` or the command line must set `PINGBOARD_DATA` to a path under `tmp_path`.
3. **No leftover environment.** Change the environment only with the `monkeypatch` fixture, which undoes the change after the test.
4. **No waiting.** Do not call `time.sleep` in a test and do not run the real check loop, which never returns.
5. **No fixed ports.** Bind test servers to port 0 and read the port that the system assigned.

## Patterns

### Settings

`config.load()` reads the environment each time it is called, so set the variables first and call it afterwards.

```python
from pingboard import config


def test_port_from_environment(monkeypatch):
    monkeypatch.setenv("PINGBOARD_PORT", "9000")
    assert config.load().port == 9000
```

### The command line

Call `cli.main` with a list of arguments. Commands that fail, and `check` in every case, end with `SystemExit`; catch it with `pytest.raises` and inspect the code. Read printed output with the `capsys` fixture.

```python
import pytest

from pingboard import cli


def test_remove_unknown_url_fails(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    with pytest.raises(SystemExit) as exit_info:
        cli.main(["remove", "https://example.org"])
    assert "is not in the list" in str(exit_info.value)


def test_list_prints_one_url_per_line(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    cli.main(["add", "https://b.example"])
    cli.main(["add", "https://a.example"])
    cli.main(["list"])
    assert capsys.readouterr().out == "https://a.example\nhttps://b.example\n"
```

### The check, against a local server

Start a small HTTP server on a free port in a fixture. The server answers with the status that the path names, so one fixture serves many tests.

```python
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from pingboard import check


class StatusHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(int(self.path.strip("/")))
        self.end_headers()

    def log_message(self, *args):
        pass


@pytest.fixture
def base_url():
    server = ThreadingHTTPServer(("127.0.0.1", 0), StatusHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
    server.server_close()


def test_status_200_is_up(base_url):
    result = check.check(f"{base_url}/200", timeout=2)
    assert (result.up, result.status, result.error) == (True, 200, "")


def test_status_503_is_down(base_url):
    result = check.check(f"{base_url}/503", timeout=2)
    assert (result.up, result.status) == (False, 503)
```

For "no answer at all", ask the system for a free port, close it again and check that address. Nothing listens there, so the connection is refused:

```python
import socket

from pingboard import check


def test_refused_connection_is_down_with_status_0():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    result = check.check(f"http://127.0.0.1:{port}/", timeout=2)
    assert (result.up, result.status) == (False, 0)
    assert result.error
```

### The command line without the network

To test the output and the exit code of `pingboard check`, replace the check function with a fake. `cli` calls `check.check` through the module, so patch the attribute of the module:

```python
import pytest

from pingboard import check, cli


def test_check_exits_1_when_a_target_is_down(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    cli.main(["add", "https://down.example"])
    monkeypatch.setattr(check, "check", lambda url, timeout: check.Result(url, False, 0, 1, "boom"))
    with pytest.raises(SystemExit) as exit_info:
        cli.main(["check"])
    assert exit_info.value.code == 1
```

### The HTTP routes

The server keeps its results in module-level variables, `server.results` and `server.checks_total`. Fill them with `monkeypatch`, start `ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)` in a thread as in the fixture above, and request the routes with `urllib.request.urlopen`. Do not call `server.serve` or `server.loop`: neither returns.

```python
monkeypatch.setattr(server, "results", {"https://a.example": check.Result("https://a.example", True, 200, 12)})
monkeypatch.setattr(server, "checks_total", 1)
```

## Before you open the pull request

* `make lint` and `make test` pass.
* Each new test fails when you undo the change it belongs to. Try it once; a test that cannot fail proves nothing.
* A fix for a defect comes with a test that reproduces the defect.
* The table in [What the tests cover](coverage.md) is up to date.
