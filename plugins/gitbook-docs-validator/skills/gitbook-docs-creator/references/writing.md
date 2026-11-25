# Writing the three books

How to turn the scaffold into documentation that is true and that each reader can use.

Contents: 1 Gather the facts · 2 Three voices · 3 Page types · 4 README pages and the landing
page · 5 Growing past the minimum · 6 Pictures · 7 Migrating existing documentation

## 1. Gather the facts

Collect the facts once, before the first page, so the three books agree with each other and
with the code. Read these sources; do not rely on the old README or on what such projects
usually do.

| Fact | Where to read it | Used in |
|---|---|---|
| How it is built, installed and started | build files, package manifest, Dockerfile, release configuration, install script | operator install, user quick start |
| Commands and flags | the argument parser, or the `--help` output if you can run it | operator commands, tester running, user everyday use |
| Settings and their defaults | every place the code reads an environment variable or a configuration key | operator configuration |
| What it stores and where | file paths, database code, migrations | operator overview and operations, user trust |
| What leaves the machine | network clients, telemetry | user trust, operator overview |
| Logs, metrics, health checks | logging and metrics calls | operator monitoring |
| Errors a person can meet | error messages and exit codes | user FAQ, operator troubleshooting |
| How the tests run | Makefile or task runner, test configuration, the test folders | tester running, map, adding tests |
| What blocks a merge | CI workflow files, branch rules mentioned in the repository | tester gates |

For reference pages, completeness is the point. Search the whole code base for the pattern
(for example every `os.Getenv`, `process.env`, `os.environ` call) and list every hit, rather
than describing the ones you happened to see.

If you can run a command safely (a build, `--help`, the test suite), run it and quote what it
printed. If you cannot, quote the code and do not describe output you did not see.

When a fact cannot be found, the page keeps its `> Draft.` line and names the gap in one
sentence. Do not fill the gap with what is plausible.

## 2. Three voices

The same fact reads differently in each book. Here is one setting three ways.

**User book**: names things by what they do, defines every project word, no internals.

> Widget keeps your notes in one folder on your computer. To keep them somewhere else, such
> as a shared drive, tell Widget where before you start it. [Everyday use](everyday-use.md)
> shows how.

**Operator book**: precise, complete, quotes names and defaults, can be searched.

> | Variable | Type | Default | Effect |
> |---|---|---|---|
> | `WIDGET_HOME` | path | `~/.widget` | Directory for the database and logs. Created on first start with mode `0700`. |

**Tester book**: names the command and the file on every page.

> `WIDGET_HOME` is covered by `tests/config_test.py::test_home_override`. Run it alone with
> `make test T=config_test`.

Rules that follow from this:

- User book: short sentences, "you", one idea per paragraph. A word the reader has not met
  is defined where it first appears and again in the glossary. No file paths or flags unless
  the reader has to type them.
- Operator book: tables for anything a reader looks up. Every setting, command and file name
  in backticks, spelled exactly as in the code. State defaults and limits as values.
- Tester book: every claim about a check is followed by the command that reproduces it
  locally and the file that implements it.

## 3. Page types

Each stub's comment says what that page needs. These are the shapes behind those briefs; use
them for pages you add yourself.

**Walk-through** (quick start, install, running the tests). Lead paragraph: the outcome and
how long it takes. Then "Before you start" with the prerequisites, numbered steps with one
action each, and after each step what the reader should see. End with "Next" and two or three
links. A reader who follows it must not need another page.

**Task page** (everyday use). One H2 per job, named by what the reader wants ("Share a note",
not "The share command"). Under each: when you would do this, the shortest way, one example.

**Concept page** (system overview, data model). Start with the model in three or four
sentences, then one H2 per component: what it owns, what it talks to. Name things as the code
names them, so a reader can search for them. A picture earns its place here.

**Reference page** (settings, commands, files, metrics). A table, sorted by name, one row per
item, the same columns for all of them. Complete, with no narrative between the rows. A short
paragraph on top says how to read the table and where the values come from.

**Runbook** (troubleshooting, backup). One H2 per symptom or procedure. For a symptom: how to
confirm it, causes in order of likelihood, the fix, how to check that it worked. Quote the
exact error text so a search finds the page.

**FAQ**. One H2 per question, worded as the reader would ask it. The answer starts with the
answer, then the reason. Link to the page that has the detail.

**Glossary**. Alphabetical, one or two sentences per word, only words this book uses. A
definition does not lean on another glossary word unless it links to it.

**Gates page** (tester). A table: check, what it catches, command to run it locally, whether
it blocks the merge. Then one short section per check that needs explaining.

Length follows the content. A reference page is as long as the product is; a concept page
that needs more than a screen or two is two pages.

## 4. README pages and the landing page

Write these last.

**Book `README.md`** answers "is this for me, and where do I go" on one screen:

1. H1 with the book name (the user book may say "Welcome").
2. The audience paragraph: who it is for and what they are assumed to know. Keep the words
   "This guide is for …".
3. The reading map: a table with one row per need or per part, every row a link to a page in
   `SUMMARY.md`. It routes the reader; it is not a copy of the table of contents.
4. Conventions (operator and tester books): how commands are shown, what project words mean.
5. The pointer to the other books: a blockquote that links `../<book>/`.

**Part `README.md`**: one or two sentences on what the part is for and in which order to read
it, then one line per chapter that says which question the chapter answers.

**Landing page (`index.html`)**: one sentence on what the product does for its reader, then
one card per book. Each card's bullets name three things the book really contains now. Keep
it static: no script, no framework.

## 5. Growing past the minimum

The scaffold writes one page per required page. A real project usually needs more. Add a
page when:

- a page mixes two jobs (install from a package and build from source become two pages);
- a reference table has a second kind of item (settings, then commands, then files on disk);
- the product has a feature area with its own vocabulary (it becomes a part in the operator
  book, and a section in the user book's everyday use);
- there are kinds of tests with their own tools (a part each in the tester book).

For every new page: create the file with its H1, add the `SUMMARY.md` line in the same edit,
add a row to the book or part README when a reader would look for it there. A new part needs
a directory, a `README.md`, and the next roman numeral; parts are numbered in order.

Do not add a page you cannot fill. An empty heading in the sidebar promises content.

## 6. Pictures

A picture is worth adding when it carries a model that prose makes hard: how components
connect, how a request flows, what state follows what. One per concept page is plenty.

- SVG, in `<book>/images/`, referenced from a page (an unreferenced image is reported).
- Alt text is a full sentence that says what the picture shows, so the page still works when
  the image does not load: `![A request enters the gateway, is checked by auth, then reaches one of two workers.](images/request-flow.svg)`.
- If you cannot produce a correct picture, leave it out. A wrong diagram is worse than none.

## 7. Migrating existing documentation

Existing text is usually right about the product and wrong about the reader: one README
serves all three. Sort it by who needs it.

| Existing text | Goes to |
|---|---|
| What it is, why use it, first steps | user: README, quick start |
| How to do common things | user: everyday use |
| Known problems, "if you see this error" | user: FAQ, or operator: troubleshooting when the fix needs a terminal |
| Architecture, design notes | operator: how it works. A long design document stays where it is and is linked by absolute URL |
| Install options, environment variables, flags | operator: install, configuration reference |
| Deployment, backup, upgrade notes | operator: install, operations |
| How to run tests, CONTRIBUTING test rules, CI description | tester: running, gates, adding tests |

How to move it:

- Move, do not copy, so that each fact has one home. Use `git mv` for whole files to keep
  their history, then edit.
- Split a page that serves two readers; keep the plain half in the user book and the precise
  half in the operator book.
- Check moved text against the code before you keep it. Old documentation drifts; a moved
  sentence is a sentence you now vouch for.
- Fix the links you broke: links between moved pages, and links from the root README.
- Leave the root README as a short entry point: what the project is, how to install in a few
  lines, and a Documentation section that links every book.
- In your report, list what moved where and what you dropped as outdated.
