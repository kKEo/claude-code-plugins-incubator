# Exploring by hand

This page shows how to try notekeep safely by hand and where to look. It matters more than
usual here, because no automated test sends a request to the server (see
[What is tested where](../start/map.md)).

## Set up a sandbox

Use a database and a port of your own, so that nothing touches real notes. In one terminal:

```bash
export NOTEKEEP_DB=/tmp/notekeep-sandbox/notes.db
export NOTEKEEP_PORT=17070
python3 notekeep.py serve
```

In a second terminal, export the same `NOTEKEEP_DB` before you run `list`, `show` or
`export`: these commands read the database file, not the server. To start again from
nothing, stop the server and delete `/tmp/notekeep-sandbox/`.

The code for every area below is in `notekeep.py`.

## Areas worth probing

| Area | Try | Expected today |
|---|---|---|
| Saving | `curl -X PUT --data 'Buy milk' http://localhost:17070/notes/shopping`, twice with different text | `{"saved": "shopping"}`; `show shopping` prints the second text |
| Listing | `curl http://localhost:17070/notes` | Titles sorted, each with an `updated` time in UTC |
| Token | Restart with `NOTEKEEP_TOKEN=s3`; request `/notes` with no header, a wrong one and `Authorization: Bearer s3` | `401`, `401`, `200`; `/health` is `200` in all three cases |
| Size limit | Restart with `NOTEKEEP_MAX_NOTE_BYTES=20`; send 20 bytes, then 21 | `200`, then `413` and `{"error": "note larger than 20 bytes"}` |
| Unknown paths and methods | `GET /notes/shopping`, `DELETE /notes/shopping` | `404`, `501` |
| Titles | `PUT /notes/my%20note`, `PUT /notes/`, `PUT /anything/else` | Saved as `my%20note`, as an empty title, and as `else` |
| Body encoding | `curl -X PUT --data-binary @file` with bytes that are not UTF-8 | No answer to the client, a `UnicodeDecodeError` traceback in the server terminal, the server keeps answering |
| Export | Save notes with the titles above, then `python3 notekeep.py export /tmp/notekeep-sandbox/out` | One `<title>.md` per note; the empty title becomes `.md` |
| Start-up errors | `NOTEKEEP_DB=notes.db`, `NOTEKEEP_PORT=abc`, a second server on the same port | `FileNotFoundError`, `ValueError`, `OSError … Address already in use` |

The server handles one request at a time. Slow or parallel clients, and a `list` or `export`
during many writes, are worth trying; no expected result is written down for them.

## Report what you find

Open an issue at <https://github.com/example/notekeep/issues> with the exact command, the
settings you exported, what you expected and what happened, including the lines the server
printed. When the finding is a bug, the fix needs a test: see
[Adding tests](../contributing/adding-tests.md).
