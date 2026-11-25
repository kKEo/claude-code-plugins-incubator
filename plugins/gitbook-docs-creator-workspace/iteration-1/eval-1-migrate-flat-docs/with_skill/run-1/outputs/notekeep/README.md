# notekeep

notekeep is a tiny notes server for a team. It keeps notes in one SQLite file and gives you a
JSON API and a command line tool. Source: https://github.com/example/notekeep (Apache-2.0).

## Getting started

You need Python 3.9 or newer. Nothing else.

    python3 notekeep.py serve

Then save a note:

    curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping

and list your notes:

    curl http://localhost:7070/notes

The [quick start](docs/guide/user/quick-start.md) walks through these steps.

## Documentation

The documentation is three books, one per reader, behind one
[landing page](docs/guide/index.html).

| Book | For | Contains |
|---|---|---|
| [User guide](docs/guide/user/README.md) | Anyone who uses notekeep | Quick start, everyday use, trust and privacy, questions and a glossary |
| [Operator guide](docs/guide/operator/README.md) | People who install and run it | How it works, install, every setting, command and API request, monitoring, troubleshooting and backup |
| [Tester guide](docs/guide/tester/README.md) | People who check changes | Running the tests, what is tested where, pull request checks, exploring by hand, adding tests |

Build and preview the books with `make docs-site`; see [docs/README.md](docs/README.md).
