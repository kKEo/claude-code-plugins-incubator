# notekeep

notekeep is a tiny notes server for a team. It keeps notes in one SQLite file and gives you a
JSON API and a command line tool. Source: https://github.com/example/notekeep (Apache-2.0).

## Quick start

You need Python 3.9 or newer. Nothing else.

    python3 notekeep.py serve
    curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping
    curl http://localhost:7070/notes

## Documentation

The documentation lives in [docs/guide](docs/guide) as three books, one per reader:

| Book | For | Covers |
|---|---|---|
| [User Guide](docs/guide/user-guide/README.md) | people who keep notes | getting started, using notekeep, FAQ |
| [Operator Guide](docs/guide/operator-guide/README.md) | people who run and develop notekeep | architecture, configuration, HTTP API, deployment, backup |
| [Tester Guide](docs/guide/tester-guide/README.md) | contributors and reviewers | running the tests, coverage, CI |

Each book is a GitBook project (`.gitbook.yaml`, `README.md`, `SUMMARY.md`) that mdBook can
also build (`book.toml`). To build the landing page and all three books locally:

    docs/guide/build.sh

The result is in `docs/guide/_site/`; open `index.html`.
