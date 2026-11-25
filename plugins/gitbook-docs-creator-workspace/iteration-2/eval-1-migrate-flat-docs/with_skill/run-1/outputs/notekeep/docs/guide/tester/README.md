# notekeep tester guide

This guide is for the people who check that changes to notekeep are safe. It assumes you can run commands in a terminal and read a test report.

notekeep has one small automated suite: three pytest tests and a syntax check of
`notekeep.py`, all started by `./run-tests.sh`. A GitHub Actions workflow runs the same
script on every pull request. The suite covers the defaults, the database schema and one
command line error; the HTTP API has no automated tests, so exploring by hand matters here.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know what runs on a pull request |
| [III. Exploratory testing](explore/README.md) | Look for what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are shown in `bash` blocks and are run from the repository root.
- A test is named as pytest names it: `tests/test_cli.py::test_show_missing_note_exits`.
- Links to files outside the books go to the repository on GitHub.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations.
