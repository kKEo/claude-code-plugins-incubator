# HTTP API

All responses are JSON.

| Request | Token needed | Response |
|---|---|---|
| `GET /health` | no | `200` `{"ok": true}` |
| `GET /notes` | yes, if set | `200` list of `{"title": ..., "updated": ...}`, ordered by title |
| `PUT /notes/<title>` | yes, if set | `200` `{"saved": "<title>"}`; the request body is the note text |

The title is the last segment of the PUT path. Saving to an existing title replaces the body
and updates the timestamp.

## Errors

| Status | Body | Cause |
|---|---|---|
| `401` | `{"error": "missing or wrong token"}` | `NOTEKEEP_TOKEN` is set and the `Authorization` header does not match. |
| `404` | `{"error": "not found"}` | A GET for any path other than `/health` and `/notes`. |
| `413` | `{"error": "note larger than N bytes"}` | The PUT body is over `NOTEKEEP_MAX_NOTE_BYTES`. |

There is no endpoint that reads or deletes a single note. Reading is done with the CLI
(`python3 notekeep.py show <title>`).
