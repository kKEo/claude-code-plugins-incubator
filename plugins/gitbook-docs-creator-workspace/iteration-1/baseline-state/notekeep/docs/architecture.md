# Architecture

One process, one file. `notekeep.py` contains the HTTP handler, the CLI and the database
access. There is a single table:

| Column | Meaning |
|---|---|
| id | row id |
| title | unique title, taken from the URL |
| body | the note text |
| updated | timestamp of the last save |

Every request opens its own SQLite connection. Writes use an upsert on `title`. There is no
cache and no background work. Authentication is a shared bearer token compared on each
request; `/health` is always open so that a load balancer can probe it.
