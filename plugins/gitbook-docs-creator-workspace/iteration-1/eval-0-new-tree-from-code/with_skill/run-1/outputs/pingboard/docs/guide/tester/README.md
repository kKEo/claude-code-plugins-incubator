# pingboard tester guide

This guide is for the people who check that changes to pingboard are safe. It assumes you can run commands in a terminal and read a test report.

pingboard is tested in two ways. A small suite of unit tests, written for pytest, covers the settings, the target list on disk and one rule of the command line; it needs no network and runs in under a second. A linter, ruff, reads the code for mistakes without running it. Both run on every pull request, on two Python releases. The check itself, the check loop and the HTTP server have no automated tests, so changes there are checked by hand; [Exploring by hand](explore/by-hand.md) shows how.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know what runs on a pull request and how to repeat it locally |
| [III. Exploratory testing](explore/README.md) | Look for what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are shown in `bash` blocks and are run from the root of a clone of the repository, with the virtual environment from [Running the tests](start/running.md) active.
- A test is named as pytest names it: `tests/test_config.py::test_interval_floor` is the function `test_interval_floor` in the file `tests/test_config.py`. You can paste such a name after `python -m pytest -q`.
- Every statement about a check names the command that repeats it on your machine and the file that defines it.
- Project words such as target, check and cycle mean what the [operator glossary](../operator/appendix/glossary.md) says.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations.
