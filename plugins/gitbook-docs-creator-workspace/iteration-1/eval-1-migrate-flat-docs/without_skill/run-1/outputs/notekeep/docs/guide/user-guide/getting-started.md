# Getting started

You need Python 3.9 or newer. Nothing else.

Start the server:

    python3 notekeep.py serve

Then save a note:

    curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping

and list your notes:

    curl http://localhost:7070/notes

It takes about two minutes.

## If your team already runs notekeep

Ask whoever runs it for the address and, if one is set, the token. Replace
`http://localhost:7070` in the examples with that address, and send the token with every
request:

    curl -H 'Authorization: Bearer <token>' http://localhost:7070/notes

Next: [Using notekeep](using-notekeep.md).
