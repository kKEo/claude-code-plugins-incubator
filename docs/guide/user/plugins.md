# What is in the marketplace

This page describes each plugin in one screen, so you can decide which to install.

## frontend-scaffold

Builds a complete, ready-to-run Vue 3 web application from a description such as "a dashboard for managing deployments". The result is a folder with a login page, a list page with filters, a multi-step create form and a detail page, plus the small building blocks (buttons, tables, dialogs) they are made of. The generated application talks to any REST API; you point it at your own backend afterwards.

It also includes a checker that reads a generated project and reports whether it still follows the expected patterns, whether it compiles, and whether basic security and accessibility rules hold.

## feature-dev-documentalist

Keeps a written record of a feature while you build it. When you say "document this phase", it looks at what changed in git, works out whether you are writing a specification, designing, implementing, deploying or testing, and writes the matching document into a folder named after your branch under `docs/features/`.

It also reminds you. When you are on a feature branch with unsaved changes and no document yet, a short tip appears at the end of a Claude turn suggesting that you document before committing.

## gitbook-docs-validator

Checks a documentation folder against a fixed layout: one landing page plus three books, one each for users, for people who run or develop the system, and for testers. It reports missing books, missing required pages, pages nobody can reach, broken links and images without descriptions, and then writes a short report with a verdict. This very documentation was written to pass it.

## Not a plugin

The repository also contains a folder named `gitbook-docs-validator-workspace`. It holds test runs and sample documentation used while developing the validator. It cannot be installed and you can ignore it.
