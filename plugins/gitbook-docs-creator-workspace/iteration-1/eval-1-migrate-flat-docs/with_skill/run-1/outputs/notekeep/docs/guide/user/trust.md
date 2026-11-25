# Trust and privacy

This page says what notekeep does with your notes: where it keeps them, who can reach them
and what it never does.

## Where your notes are kept

All notes are in one file on the computer where notekeep runs. Unless the person who runs
it chose another place, the file is `~/.notekeep/notes.db`, in the home folder of whoever
started notekeep. notekeep writes no other file, except the copies you ask for with
`export`.

## What leaves that computer

Nothing. notekeep only answers the requests that are sent to it. It does not contact any
other service, does not send usage data and does not check for updates.

## Who can see and change notes

- notekeep has no user accounts. Everyone who can use it sees the same notes.
- Without a token, anyone who can reach the address can list the titles and save or replace
  notes.
- With a token, only people who have the token can do so. There is one token for the whole
  team.
- Anyone who can open the file on the computer where notekeep runs can read every note.

## What to keep in mind

- Notes are stored as plain text. They are not encrypted.
- notekeep itself does not encrypt what you send. Whether the connection is protected
  depends on how your team set it up; ask the person who runs it.
- Saving to a title that exists replaces the note. There is no history and no undo.
- There is no automatic backup. See
  [Take your notes with you](everyday-use.md#take-your-notes-with-you).
