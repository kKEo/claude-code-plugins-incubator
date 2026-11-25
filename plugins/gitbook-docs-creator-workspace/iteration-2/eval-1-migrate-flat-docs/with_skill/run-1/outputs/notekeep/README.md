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

It takes about two minutes. The [quick start](docs/guide/user/quick-start.md) has the same
steps with what you should see after each.

## Documentation

The documentation is one book per reader, under [docs/guide/](docs/guide/):

| Book | For | Start here |
|---|---|---|
| [User guide](docs/guide/user/README.md) | Anyone who uses notekeep | [Quick start](docs/guide/user/quick-start.md), [everyday use](docs/guide/user/everyday-use.md), [questions](docs/guide/user/faq.md) |
| [Operator guide](docs/guide/operator/README.md) | Whoever installs and runs it | [Install](docs/guide/operator/install/install.md), [settings](docs/guide/operator/config/environment.md), [backup](docs/guide/operator/operations/backup.md) |
| [Tester guide](docs/guide/tester/README.md) | Whoever checks changes | [Running the tests](docs/guide/tester/start/running.md), [what is tested where](docs/guide/tester/start/map.md) |

Build and preview the books with `make docs-site`; see [docs/README.md](docs/README.md).
