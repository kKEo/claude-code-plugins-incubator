# notekeep tester guide

This guide is for the people who check that changes to notekeep are safe. It assumes you can run commands in a terminal and read a test report.

notekeep is tested by one script, `./run-tests.sh`, which runs a small pytest suite against
a temporary database and then checks that `notekeep.py` compiles. The same script runs on
every pull request. The suite covers defaults, the database schema and one command line
error; the HTTP server has no automated test and is checked by hand.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know which checks run on a pull request |
| [III. Exploratory testing](explore/README.md) | Look for what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are run from the root of the repository.
- A test is named as pytest names it: `tests/test_api.py::test_default_port` is the
  function `test_default_port` in the file `tests/test_api.py`.
- Every check is given with the command that runs it and the file that defines it.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations.
