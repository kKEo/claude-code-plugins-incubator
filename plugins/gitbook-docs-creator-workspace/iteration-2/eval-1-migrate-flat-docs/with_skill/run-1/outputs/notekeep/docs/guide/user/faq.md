# Questions and troubleshooting

This is the page for when something does not work or you cannot find something. Each
heading is a question or the message you see.

## I get "missing or wrong token"

notekeep was started with a token, which is a shared password, and your command did not
send it. Ask the person who runs notekeep for the token and add it to the command:

```bash
curl -H 'Authorization: Bearer YOUR-TOKEN' http://localhost:7070/notes
```

## I get "note larger than 65536 bytes"

Your note is longer than notekeep accepts. Split it into two notes, or ask the person who
runs notekeep to raise the limit.

## I get "notekeep: no note called …"

There is no note with that title. Titles must match exactly, including capital letters.
Print the titles to check the spelling:

```bash
python3 notekeep.py list
```

If the list is empty although you saved notes, you are probably not on the computer where
notekeep runs, or it keeps its notes in another place. Ask the person who runs it.

## I get "not found"

The address is not one notekeep knows. To list notes, the address ends in `/notes`. A single
note cannot be read through an address; use `python3 notekeep.py show` as described in
[Everyday use](everyday-use.md#read-a-note).

## The commands on port 9000 do not connect

Older instructions used port 9000. notekeep uses port 7070 unless the person who runs it
chose another one. Use `http://localhost:7070`, as in the [Quick start](quick-start.md).

## Where are my notes?

In one file on the computer where notekeep runs: `~/.notekeep/notes.db`, unless the person
who set it up chose another place. See [Trust and privacy](trust.md).

## How do I delete a note?

You cannot. notekeep has no delete. Save a blank text under the title to empty the note.

## Can I get an old version of a note back?

No. Saving under an existing title replaces the text, and notekeep keeps no history.
