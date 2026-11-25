# Glossary

These are the project words used in this book, in alphabetical order.

**Access log.** The line that the server writes to standard error for each request.

**Database.** The single SQLite file that holds all notes. Its path is `NOTEKEEP_DB`.

**Health check.** The request `GET /health`, which is answered without a token.

**Note.** One row of the `notes` table: a title, a body and the time of the last save.

**Title.** The unique name of a note, taken from the last segment of the path of a `PUT`.
It is the `title` column.

**Token.** The shared secret in `NOTEKEEP_TOKEN`. Clients send it as
`Authorization: Bearer <token>`. There is one token for everyone and no user accounts.

**Upsert.** The write that a `PUT` performs: insert the note, or replace its body when the
title exists.

**Vacuum.** The SQLite operation that rebuilds the database file to its smallest size, run
by the `vacuum` command.
