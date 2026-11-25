# Development setup

## Tools

* Python 3.9 or later. Use 3.9 if you have it, because it is the oldest supported version and continuous integration tests it.
* git
* make (optional; the Makefile only wraps three short commands)

## Get the code

Fork <https://github.com/example/pingboard> on GitHub, then clone your fork:

```
git clone https://github.com/<your-account>/pingboard.git
cd pingboard
git remote add upstream https://github.com/example/pingboard.git
```

## Install

```
python -m venv .venv
. .venv/bin/activate
pip install -e . pytest ruff
```

`-e` installs in editable mode: the `pingboard` command runs the code in your working copy, so a change takes effect without a new install.

## Daily commands

| Command | What it does |
| --- | --- |
| `make test` | Runs the unit tests: `python -m pytest -q` |
| `make lint` | Runs the linter: `python -m ruff check pingboard tests` |
| `make run` | Starts the dashboard: `python -m pingboard.cli serve` |

Run `make lint test` before every commit. Both finish in about a second. With a recent ruff, `make lint` reports six findings that exist before your change; see [Known limitations and ideas](limitations.md).

## Try your change by hand

Use a data file inside the working copy and short timings, so that you neither touch your own target list nor wait a minute for each round:

```
export PINGBOARD_DATA=$PWD/.dev/targets.json
export PINGBOARD_INTERVAL=5
export PINGBOARD_LOG_LEVEL=debug

pingboard add https://example.org
pingboard check
make run
```

Then open <http://127.0.0.1:8080/>. The server does not reload code; stop it with `Ctrl+C` and start it again after a change.

Do not commit the `.dev` folder.

## Repository layout

```
pingboard/
├── .github/workflows/ci.yml   continuous integration: lint and tests on Python 3.9 and 3.12
├── Makefile                   test, lint and run targets
├── README.md
├── pyproject.toml             package name, version and the pingboard command
├── docs/guide/                the documentation, four books and a landing page
├── pingboard/                 the package
│   ├── __init__.py            empty
│   ├── check.py               one check of one URL
│   ├── cli.py                 the command line
│   ├── config.py              settings from the environment
│   ├── server.py              the check loop and the HTTP server
│   └── store.py               the target list on disk
└── tests/
    ├── test_cli.py
    ├── test_config.py
    └── test_store.py
```

## Editor

Any editor works. If yours supports ruff, enable it; the project uses ruff's default rules and has no ruff configuration, so no setup is needed.
