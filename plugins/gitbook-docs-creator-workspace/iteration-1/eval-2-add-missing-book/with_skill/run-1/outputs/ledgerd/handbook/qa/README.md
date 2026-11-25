# ledgerd QA handbook

> Draft.

The structure of this book is in place, but the chapters wait for one thing: the repository does not yet contain a test suite, a test command or a CI workflow to describe, so no page here can say how ledgerd is tested as a whole.

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
- The product's own commands are shown as `ledgerd <command>`, as in the [internals handbook](../internals/).
- A page that starts with a "Draft." line is incomplete; the sentence under that line names the fact it is waiting for.

> **Looking for something else?** [Getting started](../getting-started/) is the plain-language introduction; the [internals handbook](../internals/) covers how ledgerd works inside, installation, every setting, monitoring and operations.
