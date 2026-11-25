# Use cases

This page gives three examples of what notekeep is good for, so that you can judge whether
it fits you. They follow from what notekeep can do; they are not reports from real teams.

## A list the whole team keeps up to date

A team wants one shopping list for the office that anyone can update. One person runs
notekeep; everyone saves to the note "shopping" and looks at the list of notes to see when
it last changed. [Everyday use](everyday-use.md#change-a-note) shows the command.

Because saving replaces the whole note, the team agrees who updates it, or each person saves
a note of their own.

## Notes saved by a script

Someone already has a script that produces a short report every morning. One extra line
with `curl` saves the report under a fixed title, so the latest report is always under the
same name. [Everyday use](everyday-use.md#save-a-note) shows that line.

## Notes you can take away as plain files

A team does not want its notes locked into a tool. With notekeep, one command writes every
note to a plain text file that any editor opens. See
[Everyday use](everyday-use.md#take-your-notes-with-you).

## When notekeep is not the right tool

- You need to delete notes or see earlier versions: notekeep cannot do either.
- You need private notes per person: all notes are shared.
- You want to read notes in a web browser: notekeep has no web page, only commands.
