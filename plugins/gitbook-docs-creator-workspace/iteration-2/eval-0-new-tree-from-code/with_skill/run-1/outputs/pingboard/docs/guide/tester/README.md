# pingboard tester guide

This guide is for the people who check that changes to pingboard are safe. It assumes you can run commands in a terminal and read a test report.

pingboard is tested in two ways. A small suite of unit tests, run with pytest, covers the settings, the targets file and one command-line check; a linter, ruff, checks the source. Both run in CI on every pull request, on two Python versions. The check itself, the check loop and the HTTP server have no automated tests and are checked by hand.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know what runs on a pull request and how to reproduce it |
| [III. Exploratory testing](explore/README.md) | Check by hand what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are shown in `bash` blocks and are run from the root of the repository, with the virtual environment from [Running the tests](start/running.md) active.
- A test is named as pytest names it: `tests/test_config.py::test_interval_floor` is the function `test_interval_floor` in the file `tests/test_config.py`.
- Paths such as `pingboard/server.py` are relative to the root of the repository.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations.
