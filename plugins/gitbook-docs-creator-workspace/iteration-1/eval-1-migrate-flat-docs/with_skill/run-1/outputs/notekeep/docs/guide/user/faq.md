# Questions and troubleshooting

This page answers the common questions and explains the messages you may see. Each answer
starts with the cause, then gives the fix.

## I get "missing or wrong token"

notekeep was set up to ask for a token, and your command did not send the right one. Ask
the person who runs notekeep for the token and add it as shown in
[Use a token](everyday-use.md#use-a-token).

## Where are my notes?

They are in one file on the computer where notekeep runs: `~/.notekeep/notes.db`, unless
the person who runs it chose another place. [Trust and privacy](trust.md) has the details.

## I get "note larger than 65536 bytes"

The note is too big. Split it into two notes, or ask the person who runs notekeep to raise
the limit.

## I get "not found" when I open a note in the browser or with curl

notekeep cannot show the text of a note over the network. Read it on the computer where
notekeep runs, as shown in [Read a note](everyday-use.md#read-a-note).

## I get "notekeep: no note called …"

There is no note with exactly that title. Type `python3 notekeep.py list` and copy the
title from the list.

## curl says it cannot connect

notekeep is not running, or the address is wrong. Check that the window where you started
notekeep is still open, and that the number in the address matches the number in its
`notekeep listening on` line.

## My note lost its line breaks

You sent a file with `--data`, which removes line breaks. Use `--data-binary` as shown in
[Save a longer note from a file](everyday-use.md#save-a-longer-note-from-a-file).

## My title shows up with "%20" in it

The title had a space. notekeep keeps titles exactly as they are sent, and a space is sent
as `%20`. Save the note again under a title without spaces.

## How do I delete a note?

You cannot do it yourself: notekeep has no delete command. Ask the person who runs it; the
[operator guide](../operator/operations/backup.md) describes how.

## I typed `python3 notekeep.py list` and my notes are not there

The command looked in a different notes file than the running notekeep uses. This happens
on a shared computer when notekeep was set up to keep its file in another place. Ask the
person who runs it.
