# Everyday use

This page shows the common jobs, one at a time: saving, listing, reading and exporting
notes.

The examples use the address `http://localhost:7070`, which works when notekeep runs on
your own computer. If your team runs notekeep on a shared computer, ask the person who runs
it for the address, and use it instead.

## Save a note

Do this to write a new note. The last part of the address is the title of the note, and the
text after `--data` is the note.

```bash
curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping
```

Keep titles simple: letters, digits and dashes, without spaces.

## Change a note

Save again with the same title. The new text replaces the old text.

```bash
curl -X PUT --data 'Buy milk and bread' http://localhost:7070/notes/shopping
```

> **Warning.** The old text is gone. notekeep does not ask first and keeps no earlier
> copy.

## Save a longer note from a file

Do this when the note has several lines. Write the text in a file, then send the file:

```bash
curl -X PUT --data-binary @shopping.txt http://localhost:7070/notes/shopping
```

A note can be up to 65536 bytes, which is about 64 kilobytes of text, unless the person who
runs notekeep has changed the limit.

## List your notes

Do this to see which notes exist and when each was last saved.

```bash
curl http://localhost:7070/notes
```

## Read a note

Do this to see the text of one note. It works on the computer where notekeep runs, in the
folder that holds `notekeep.py`:

```bash
python3 notekeep.py show shopping
```

On that computer you can also list the titles without `curl`:

```bash
python3 notekeep.py list
```

> **Note.** From another computer you can save and list notes, but you cannot read their
> text. Reading is possible only on the computer where notekeep runs.

## Take your notes with you

Do this to get every note as a file you can open in any editor. On the computer where
notekeep runs:

```bash
python3 notekeep.py export ./backup
```

This writes one file per note into the folder `backup`, named after the title, for example
`shopping.md`.

## Use a token

Do this when notekeep answers `missing or wrong token`. A token is a password that the
person who runs notekeep gives to the team. Add it to every command that uses `curl`:

```bash
curl -H 'Authorization: Bearer YOUR-TOKEN' http://localhost:7070/notes
```

## Delete a note

notekeep has no command for deleting a note. Ask the person who runs it; the
[operator guide](../operator/operations/backup.md) describes how.
