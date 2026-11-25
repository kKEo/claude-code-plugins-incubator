# notekeep

notekeep is a tiny notes server for a team. It keeps notes in one SQLite file and gives you a
JSON API and a command line tool. Source: https://github.com/example/notekeep (Apache-2.0).

## Getting started

You need Python 3.9 or newer. Nothing else.

    python3 notekeep.py serve

Then save a note:

    curl -X PUT --data 'Buy milk' http://localhost:9000/notes/shopping

and list your notes:

    curl http://localhost:9000/notes

It takes about two minutes.

## Configuration

Set `NOTEKEEP_PORT` to change the port (default 9000) and `NOTEKEEP_DB` to move the database.
Set `NOTEKEEP_TOKEN` to require a token on every request except the health check.

## More

See [docs/usage.md](docs/usage.md), [docs/architecture.md](docs/architecture.md),
[docs/deploy.md](docs/deploy.md) and [docs/testing.md](docs/testing.md).

## FAQ

**I get "missing or wrong token".** The server was started with `NOTEKEEP_TOKEN`. Send
`Authorization: Bearer <token>`.

**Where are my notes?** In `~/.notekeep/notes.db` unless `NOTEKEEP_DB` says otherwise.
