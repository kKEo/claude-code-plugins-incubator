# Trust and privacy

This page says where your notes are kept, who can read them, and what notekeep does and
does not do with them.

## Where your notes are

All notes are in one file on the computer where notekeep runs. Unless the person who set it
up chose another place, the file is `~/.notekeep/notes.db`, which means the folder
`.notekeep` in the home folder of the person who started notekeep.

## What leaves the computer

Nothing. notekeep answers the requests it receives and does not contact any other computer.
It sends no usage data.

## Who can read your notes

- Notes are shared. Everyone who can reach notekeep sees the same notes; there are no
  personal accounts.
- When notekeep was started with a token, which is a shared password, only people who send
  the token can save notes or see the list.
- When it was started without a token, anyone who can reach its address can see the list of
  notes and save over any of them.
- Anyone who can open the notes file on that computer can read every note. The notes are
  not encrypted.

## What you can rely on

- Saving under a title that exists replaces that note. The old text is not kept.
- A note can be at most 65536 bytes, about 65,000 characters of plain English text, unless
  the person who runs notekeep changed the limit.
- notekeep makes no backups on its own. Ask the person who runs it whether the file is
  backed up, or export your notes yourself: see
  [Everyday use](everyday-use.md#take-your-notes-with-you).
- notekeep itself does not protect the connection. If you use it over a network, ask the
  person who runs it whether the address starts with `https`.
