# gitbook-docs-validator

Checks a documentation folder against a fixed layout: one landing page plus three books, one each for users, for people who run or develop the system, and for testers. It reports missing books, missing required pages, pages nobody can reach, broken links and images without descriptions, and then writes a short report with a verdict. This very documentation was written to pass it.

![Workflow of gitbook-docs-validator: you ask for a check, the skill locates the docs, a script runs the mechanical checks and the skill reviews the rest](../images/workflow-gitbook-docs-validator.svg)

## What to type

Point Claude at the documentation folder, or let it find it:

```
does our documentation follow the template?
check docs/guide against the three-book layout
which pages are orphaned or unpublished?
```

Prompts that mention `SUMMARY.md`, `.gitbook.yaml`, `book.toml`, mdBook or GitBook also start the validator, even when you do not say "validate".

## How it works

![How gitbook-docs-validator works: the skill finds the docs root and runs a script of deterministic checks over your documentation, then reads a sample of pages and writes a report with a verdict](../images/how-gitbook-docs-validator.svg)

The numbers match the picture.

1. **Find the docs root:** the folder that holds the landing page and the book folders.
2. **Run the script.** The mechanical checks come first.
3. **The script checks** the landing page, the book files, each summary, pages, links, images, the README, the required pages of each role, and the repository around the docs.
4. **Read a sample.** Claude reads some pages to judge what a script cannot measure.
5. **Write the report:** a verdict, what must be fixed, deviations to discuss, suggestions, and what was not checked.

## What it reads and writes

It reads the documentation folder and, when asked, the repository's README, Makefile and workflow files. It changes no file unless you ask it to fix the findings. The script needs only Python 3. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install gitbook-docs-validator@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
