# HTTP API

This page lists every request the server answers. All answers are JSON with
`Content-Type: application/json`.

When `NOTEKEEP_TOKEN` is set, every request except `GET /health` needs the header
`Authorization: Bearer <token>`.

| Request | Purpose | Answer |
|---|---|---|
| `GET /health` | Health check. Never needs a token. | `200` and `{"ok": true}` |
| `GET /notes` | List all notes, sorted by title. | `200` and a list of `{"title": …, "updated": …}` |
| `PUT /notes/<title>` | Save the request body as the note `<title>`. Replaces the note when the title exists. | `200` and `{"saved": "<title>"}` |

Notes on `PUT`:

- The title is the text after the last `/` of the request path, exactly as sent.
- The body is the note text. Its size is taken from the `Content-Length` header.

There is no request that returns the text of one note and none that deletes a note. To read
a note, use the `show` command; see [Commands and flags](commands.md).

## Error answers

| Status | Body | When |
|---|---|---|
| `401` | `{"error": "missing or wrong token"}` | `NOTEKEEP_TOKEN` is set and the `Authorization` header is missing or different. |
| `404` | `{"error": "not found"}` | A `GET` for any path other than `/health` and `/notes`. |
| `413` | `{"error": "note larger than <n> bytes"}` | A `PUT` whose `Content-Length` is larger than `NOTEKEEP_MAX_NOTE_BYTES`. |
| `501` | an HTML error page from the Python standard library | Any method other than `GET` and `PUT`, for example `DELETE`. |

## Examples

```bash
# save a note
curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping

# list notes
curl http://localhost:7070/notes

# the same with a token
curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
```
