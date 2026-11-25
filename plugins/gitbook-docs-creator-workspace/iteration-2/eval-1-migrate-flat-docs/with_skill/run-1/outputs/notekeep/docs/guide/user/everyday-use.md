# Everyday use

This page shows the common jobs, one at a time: saving, listing, reading and exporting
notes.

The examples use the address `http://localhost:7070`, which is notekeep on your own
computer. When someone else runs notekeep for your team, use the address they gave you
instead. If they also gave you a token, see
[Questions and troubleshooting](faq.md#i-get-missing-or-wrong-token).

Commands that start with `python3 notekeep.py` read the notes file directly. They work only
on the computer where notekeep runs.

## Save a note

Send the text to an address that ends in the title you want. This saves "Buy milk" as the
note "shopping":

```bash
curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping
```

## Change a note

Save again under the same title. The new text replaces the old text.

```bash
curl -X PUT --data 'Buy milk and bread' http://localhost:7070/notes/shopping
```

> **Warning.** The old text is gone once you save over it. notekeep keeps no earlier
> versions.

## List your notes

From any computer that can reach notekeep, this shows every title and when it was last
saved:

```bash
curl http://localhost:7070/notes
```

On the computer where notekeep runs, this prints the titles only:

```bash
python3 notekeep.py list
```

## Read a note

On the computer where notekeep runs:

```bash
python3 notekeep.py show shopping
```

It prints the text of the note.

## Take your notes with you

This writes every note into the folder `backup`, one file per note, named after the title:

```bash
python3 notekeep.py export ./backup
```

The note "shopping" becomes the file `backup/shopping.md`, which any text editor opens.

## Delete a note

notekeep has no way to delete a note. To empty a note, save a blank text under its title;
the title stays in the list.
