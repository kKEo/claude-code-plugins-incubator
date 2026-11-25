# Quick start

This page takes you from nothing to your first saved note. It takes about two minutes.

## Before you start

You need:

- Python 3.9 or newer on your computer. Nothing else.
- The file `notekeep.py`, from <https://github.com/example/notekeep>.
- A terminal, which is the window where you type commands.

## Steps

1. Open a terminal in the folder that holds `notekeep.py` and start notekeep:

   ```bash
   python3 notekeep.py serve
   ```

   You should see one line like this. Leave this window open; notekeep runs as long as it
   is open.

   ```text
   notekeep listening on :7070, database /home/you/.notekeep/notes.db
   ```

2. Open a second terminal and save a note called "shopping":

   ```bash
   curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping
   ```

   You should see:

   ```text
   {"saved": "shopping"}
   ```

3. List your notes:

   ```bash
   curl http://localhost:7070/notes
   ```

   You should see your note and the time it was saved:

   ```text
   [{"title": "shopping", "updated": "2026-11-25 21:40:01"}]
   ```

You now have a running notekeep with one note in it.

## Next

- [Everyday use](everyday-use.md) shows how to read, replace and export notes.
- [Trust and privacy](trust.md) says where the note you just saved is kept.
- Setting notekeep up for a whole team is in the operator guide's
  [Install](../operator/install/install.md) page.
