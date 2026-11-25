# Glossary

The words this guide uses with a specific meaning, in alphabetical order.

**Database.** The single SQLite file that holds every note. Its path is the value of
`NOTEKEEP_DB`.

**Health check.** The request `GET /health`, which answers `{"ok": true}` without a token
and without opening the database.

**Note.** One row in the `notes` table: a title, a body and the time of the last save.

**Server.** The process started with `python3 notekeep.py serve`.

**Title.** The unique name of a note. It is the text after the last `/` in the path of the
`PUT` request that saved it.

**Token.** The shared secret in `NOTEKEEP_TOKEN`. Clients send it as
`Authorization: Bearer <token>`.

**Upsert.** How a save works: a new title adds a note, an existing title has its text
replaced.

**Vacuum.** Compacting the database file with `python3 notekeep.py vacuum`.
