# Using notekeep

## Saving a note

Send the text with PUT. The last part of the address is the title. Saving to a title that
exists replaces the note.

    curl -X PUT --data 'Buy milk' http://localhost:9000/notes/shopping

## Listing notes

    curl http://localhost:9000/notes
    python3 notekeep.py list

## Reading a note

    python3 notekeep.py show shopping

## Taking your notes with you

    python3 notekeep.py export ./backup

writes each note to a Markdown file.

## Deleting a note

    python3 notekeep.py delete shopping
