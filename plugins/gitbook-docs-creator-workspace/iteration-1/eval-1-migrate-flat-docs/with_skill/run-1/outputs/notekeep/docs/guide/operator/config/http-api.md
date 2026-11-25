# HTTP API reference

This is every request the server answers, read from `Handler` in `notekeep.py`. All answers
are JSON with `Content-Type: application/json`.

| Request | Token needed | Success | Answer |
|---|---|---|---|
| `GET /health` | never | `200` | `{"ok": true}` |
| `GET /notes` | when `NOTEKEEP_TOKEN` is set | `200` | A list of `{"title": …, "updated": …}`, sorted by title |
| `PUT <any path>` | when `NOTEKEEP_TOKEN` is set | `200` | `{"saved": "<title>"}` |

## Errors

| Status | Body | When |
|---|---|---|
| `401` | `{"error": "missing or wrong token"}` | `NOTEKEEP_TOKEN` is set and the `Authorization` header is not exactly `Bearer <token>` |
| `404` | `{"error": "not found"}` | A `GET` for any path other than `/health` and `/notes`, including `/notes/<title>` and `/notes?…` |
| `413` | `{"error": "note larger than <n> bytes"}` | The `Content-Length` of a `PUT` is above `NOTEKEEP_MAX_NOTE_BYTES` |
| `501` | none | Any method other than `GET` and `PUT`, for example `DELETE` or `POST` |

## How a PUT is read

- The title is the text after the last `/` of the path. The rest of the path is ignored:
  `PUT /notes/shopping` and `PUT /anything/shopping` save the same note.
- The title is stored as sent. It is not URL-decoded, so `my%20note` is stored as
  `my%20note`. A path that ends in `/` saves a note with an empty title.
- The body is read up to `Content-Length` and decoded as UTF-8. A body that is not valid
  UTF-8 raises an exception: the client gets no answer, a traceback goes to standard
  error, and the server keeps running.
- A request without `Content-Length` saves an empty note.

## What the API does not offer

The API cannot return the body of a note and cannot delete a note. Bodies are read with the
`show` and `export` [commands](commands.md) on the host.

## Example

```bash
curl -X PUT --data 'Buy milk' -H 'Authorization: Bearer change-me' http://localhost:7070/notes/shopping
curl -H 'Authorization: Bearer change-me' http://localhost:7070/notes
```
