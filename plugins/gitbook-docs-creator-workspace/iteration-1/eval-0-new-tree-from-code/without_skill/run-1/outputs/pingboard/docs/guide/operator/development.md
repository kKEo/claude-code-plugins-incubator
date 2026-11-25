# Development

## Set up a working copy

    git clone https://github.com/example/pingboard.git
    cd pingboard
    python3 -m venv .venv
    . .venv/bin/activate
    pip install -e . pytest ruff

`pytest` and `ruff` are development tools. They are not declared in
`pyproject.toml`, so install them by hand as shown.

## Repository layout

| Path | Content |
| --- | --- |
| `pingboard/` | The package; see [Architecture](architecture.md) |
| `tests/` | The pytest suite; see the Tester guide |
| `docs/guide/` | This documentation |
| `pyproject.toml` | Package metadata, version and the `pingboard` entry point |
| `Makefile` | Shortcuts for testing, linting and running |
| `.github/workflows/ci.yml` | The CI pipeline |

## Make targets

| Command | What it runs |
| --- | --- |
| `make test` | `python -m pytest -q` |
| `make lint` | `python -m ruff check pingboard tests` |
| `make run` | `python -m pingboard.cli serve` |

Ruff runs with its default rules; the repository has no Ruff configuration.

## Running a development instance

Use a separate targets file so that you do not touch your own list, and a
short interval so that you see results quickly:

    export PINGBOARD_DATA=/tmp/pingboard-dev/targets.json
    export PINGBOARD_INTERVAL=5
    export PINGBOARD_LOG_LEVEL=debug
    pingboard add https://example.org
    make run

At the `debug` level every HTTP request to the dashboard is logged.

## Continuous integration

The workflow `.github/workflows/ci.yml` runs on every pull request and on
every push to `main`. For Python 3.9 and 3.12 it installs the package with
`pytest` and `ruff`, then runs `make lint` and `make test`. Run the same two
commands locally before you open a pull request.

## Conventions worth keeping

- **No runtime dependencies.** The package uses only the standard library.
- **Python 3.9 compatibility.** CI tests 3.9, so avoid newer syntax.
- **Settings come from the environment** and are read in one place,
  `config.load()`.
- **The targets file is written atomically**, through a temporary file and a
  rename.

## Changing the version

The version is the `version` field in `pyproject.toml`. The repository has no
release automation.

## Documentation

When you change behaviour, update the pages under `docs/guide/` in the same
pull request. `docs/guide/README.md` explains the layout and how to build the
books.
