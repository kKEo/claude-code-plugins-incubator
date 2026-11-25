# Using notekeep

The `curl` examples talk to a running server. The `python3 notekeep.py ...` commands read the
database file directly, so run them on the machine that holds the database.

## Saving a note

Send the text with PUT. The last part of the address is the title. Saving to a title that
exists replaces the note.

    curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping

A note can be up to 65536 bytes unless your operator changed the limit. A larger note is
refused with "note larger than ... bytes".

## Listing notes

    curl http://localhost:7070/notes
    python3 notekeep.py list

## Reading a note

    python3 notekeep.py show shopping

## Taking your notes with you

    python3 notekeep.py export ./backup

writes each note to a Markdown file named after its title.

## Deleting a note

notekeep has no delete command. To empty a note, save new text under the same title. To
remove it completely, ask your operator; the Operator Guide describes how.
