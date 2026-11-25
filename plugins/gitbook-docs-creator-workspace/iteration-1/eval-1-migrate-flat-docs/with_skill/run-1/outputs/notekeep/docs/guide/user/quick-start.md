# Quick start

This page takes you from nothing to your first saved note. It takes about two minutes.

## Before you start

You need:

- a computer with Python 3.9 or newer;
- the file `notekeep.py`;
- a terminal, which is the window where you type commands. The steps use `curl`, a small
  program for sending requests that most computers already have.

## Steps

1. **Start notekeep.** In the folder that holds `notekeep.py`, type:

   ```bash
   python3 notekeep.py serve
   ```

   You should see `notekeep listening on :7070` followed by the place where your notes are
   kept. Leave this window open: notekeep runs for as long as it stays open.

2. **Save a note.** Open a second terminal and type:

   ```bash
   curl -X PUT --data 'Buy milk' http://localhost:7070/notes/shopping
   ```

   You should see `{"saved": "shopping"}`. You now have a note called `shopping` that says
   "Buy milk".

3. **List your notes.**

   ```bash
   curl http://localhost:7070/notes
   ```

   You should see `shopping` and the time it was saved.

4. **Read the note.** In the folder that holds `notekeep.py`, type:

   ```bash
   python3 notekeep.py show shopping
   ```

   You should see `Buy milk`.

To stop notekeep, go back to the first window and press Ctrl+C.

## Next

- [Everyday use](everyday-use.md) shows the things you will do most often.
- [Trust and privacy](trust.md) says where your notes are kept and who can see them.
- If a step did not work, see [Questions and troubleshooting](faq.md).
