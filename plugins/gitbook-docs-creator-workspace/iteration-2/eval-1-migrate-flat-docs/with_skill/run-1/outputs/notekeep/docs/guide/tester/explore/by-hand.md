# Exploring by hand

This page shows how to start a throwaway notekeep and which areas are worth probing by hand.
None of the areas below has an automated test.

## Set up a sandbox

Start a server with its own database and port, so that your real notes are not touched:

```bash
export NOTEKEEP_DB="$(mktemp -d)/notes.db"
export NOTEKEEP_PORT=7171
python3 notekeep.py serve
```

In a second terminal, export the same two variables before you use the commands, so that
`list`, `show` and `export` read the sandbox database.

```bash
curl http://localhost:7171/health
```

The expected answers for every request are in the operator guide's
[HTTP API](../../operator/config/api.md) page.

## Areas worth probing

### Titles

The title is the text after the last `/` of the request path, exactly as sent. Try titles
with spaces or other encoded characters (`my%20note`), an empty title (`PUT /notes/`), a
title followed by a query string, and a path with more parts (`PUT /a/b/c`). Compare what
`GET /notes` and `python3 notekeep.py list` show.

### Saving and replacing

Save twice to the same title and check with `python3 notekeep.py show <title>` that the
second text replaced the first and that `updated` in `GET /notes` changed.

### Size limit

The limit is `NOTEKEEP_MAX_NOTE_BYTES`, `65536` by default, and is compared with the
`Content-Length` header. Send a note of exactly the limit, one byte more, and a request
without a body:

```bash
head -c 65537 /dev/zero | curl -X PUT --data-binary @- http://localhost:7171/notes/big
```

The answer to this one is `{"error": "note larger than 65536 bytes"}`.

### Token

Restart the sandbox with `NOTEKEEP_TOKEN=secret`. Check that `GET /health` still answers
without a token, and that `GET /notes` and `PUT` answer `401` with no header, with a wrong
token and with a different scheme than `Bearer`.

### Note text

Send text that is not plain ASCII, and bytes that are not valid UTF-8. Watch the terminal of
the server for a Python traceback.

### Export

`export` writes each note to `<title>.md`. Export after saving notes with unusual titles
(empty, starting with a dot, very long) and look at the files that appear.

### Methods the server does not know

`DELETE`, `POST` and other methods are answered with `501` by the Python standard library.

## Report what you find

Open an issue at <https://github.com/example/notekeep/issues> with the exact request, the
answer, and the lines the server printed. When the finding is a bug, the fix needs a test;
see [Adding tests](../contributing/adding-tests.md).
