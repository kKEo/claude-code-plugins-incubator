# ledgerd tester guide

> Draft.

This book has its structure and records what the repository shows today; how ledgerd is tested as a whole (which kinds of tests exist and what runs on every change) is missing, because the repository has no test files, no test command and no CI workflow to read it from.

This guide is for the people who check that changes to ledgerd are safe. It assumes you can run commands in a terminal and read a test report.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know what blocks a merge and why |
| [III. Exploratory testing](explore/README.md) | Look for what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are shown in `bash` blocks and are run from the repository root.
- Product commands are shown as `ledgerd <command>`, as in the operator guide.
- A page that starts with `> Draft.` is incomplete. The sentence under that line names the fact it is waiting for.

> **Looking for something else?** The [user guide](../getting-started/) is the plain-language introduction; the [operator guide](../internals/) covers how it works inside, installation, every setting, monitoring and operations.
