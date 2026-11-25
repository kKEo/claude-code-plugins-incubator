# FAQ

**I get "missing or wrong token".** The server was started with `NOTEKEEP_TOKEN`. Send
`Authorization: Bearer <token>`.

**Where are my notes?** In `~/.notekeep/notes.db` unless `NOTEKEEP_DB` says otherwise.

**I get "note larger than ... bytes".** The note is over the size limit, 65536 bytes by
default. Split it into several notes, or ask your operator to raise the limit.

**I get "not found".** Only `/notes` can be listed over HTTP. To read one note, use
`python3 notekeep.py show <title>`.
