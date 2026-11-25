# gitbook-docs-validator

Checks a documentation folder against a fixed layout: one landing page plus one book for each kind of reader. A book for users and a book for the people who install and run the system are required; a book for testers and a book for developers are optional. It reports missing books, missing required pages, pages nobody can reach, broken links and images without descriptions, and then writes a short report with a verdict. This very documentation was written to pass it. A second skill in the same plugin writes documentation in this layout; see [Creating documentation](#creating-documentation).

![Workflow of gitbook-docs-validator: you ask for a check, the skill locates the docs, a script runs the mechanical checks and the skill reviews the rest](../images/workflow-gitbook-docs-validator.svg)

## What to type

Point Claude at the documentation folder, or let it find it:

```
does our documentation follow the template?
check docs/guide against the template
which pages are orphaned or unpublished?
```

Prompts that mention `SUMMARY.md`, `.gitbook.yaml`, `book.toml`, mdBook or GitBook also start the validator, even when you do not say "validate".

## How it works

![How gitbook-docs-validator works: the skill finds the docs root and runs a script of deterministic checks over your documentation and the repository around it, then reads a sample of pages and writes a report with a verdict](../images/how-gitbook-docs-validator.svg)

The numbers match the picture.

1. **Find the docs root:** the folder that holds the landing page and the book folders.
2. **Run the script.** The mechanical checks come first.
3. **The script checks** the landing page, the book files, each summary, pages, links, images, the README, the required pages of each role, and the repository around the docs: the root README, the docs index, the CI workflow, and a Makefile with a `docs-site` target that serves the whole site locally.
4. **Read a sample.** Claude reads some pages to judge what a script cannot measure.
5. **Write the report:** a verdict, what must be fixed, deviations to discuss, suggestions, and what was not checked.

## Creating documentation

The plugin has a second skill, `gitbook-docs-creator`, for the opposite job: writing documentation in this layout. Ask for it in your own words:

```
set up documentation for this service under docs/guide
our docs are one long README; move them into the books
we are opening the project to contributors; add a developer guide
the tester guide was never written; add it
```

It works in this order.

1. **Look at the project:** what documentation exists, and the facts in the code, such as commands, settings and how the tests run. It also decides which optional books make sense: no tester book for a project without tests, a developer book when people change the code.
2. **Lay out the books.** A script writes the landing page, the files each book needs and one page for every required topic. Each page starts as a draft with a note that says what belongs on it. The script never overwrites a file that exists.
3. **Write the pages** from the code, the operator guide first. A page stays marked as a draft when a fact could not be found, so that nothing is invented.
4. **Add the way home.** Every book gets a Home icon at the top of each page that leads back to the landing page, so a reader who arrives in the middle of one book can reach the others.
5. **Connect the repository:** links in the README and commands to build and preview the site, added only where they are missing.
6. **Check the result** with the validator described above, and report what was written and what is still a draft.

## What it reads and writes

When checking, it reads the documentation folder and, when asked, the repository's README, Makefile and workflow files. It changes no file unless you ask it to fix the findings. When creating, it reads the code and writes the documentation folder; outside that folder it only adds what is missing, such as a Documentation section in the README. Both scripts need only Python 3. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install gitbook-docs-validator@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
