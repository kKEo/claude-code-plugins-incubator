# Test environment

## Install

    git clone https://github.com/example/pingboard.git
    cd pingboard
    python3 -m venv .venv
    . .venv/bin/activate
    pip install -e . pytest ruff

CI uses Python 3.9 and 3.12. Test with one of them, and with 3.9 when a
change touches syntax or the standard library.

## Isolate the test from your own data

pingboard reads its settings from the environment. Point it at a throwaway
targets file and choose values that make a test quick:

    export PINGBOARD_DATA="$(mktemp -d)/targets.json"
    export PINGBOARD_INTERVAL=5
    export PINGBOARD_TIMEOUT=2
    export PINGBOARD_PORT=18080
    export PINGBOARD_LOG_LEVEL=debug

Without `PINGBOARD_DATA` the commands change `~/.pingboard/targets.json`, the
real list of the user who runs them.

Clear leftover settings before you run the automated tests in the same shell,
because an invalid value stops every command:

    unset PINGBOARD_INTERVAL PINGBOARD_TIMEOUT PINGBOARD_PORT PINGBOARD_LOG_LEVEL

## Local test targets

Do not depend on public websites in a test. Start a local web server and use
its URLs as targets:

    mkdir -p /tmp/pingboard-site && echo hello > /tmp/pingboard-site/index.html
    python3 -m http.server 18081 --bind 127.0.0.1 --directory /tmp/pingboard-site

This gives a target for each outcome:

| Outcome | Target | Expected result |
| --- | --- | --- |
| Up | `http://127.0.0.1:18081/` | `up`, status 200 |
| HTTP error | `http://127.0.0.1:18081/missing` | `DOWN`, status 404 |
| Connection refused | `http://127.0.0.1:18082/` (nothing listens there) | `DOWN`, status 0 |
| Name does not resolve | `http://pingboard-test.invalid/` | `DOWN`, status 0 |
| Timeout | A listener that accepts and never answers, see below | `DOWN`, status 0, duration close to the timeout |

A listener that never answers:

    python3 -c "import socket,time; s=socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.bind(('127.0.0.1',18083)); s.listen(); time.sleep(3600)"

Its target is `http://127.0.0.1:18083/`.

## Tools

| Tool | Used for |
| --- | --- |
| `pytest` | Automated tests |
| `ruff` | Static checks |
| `curl` | Calling the HTTP endpoints |
| A browser | Looking at the dashboard |
