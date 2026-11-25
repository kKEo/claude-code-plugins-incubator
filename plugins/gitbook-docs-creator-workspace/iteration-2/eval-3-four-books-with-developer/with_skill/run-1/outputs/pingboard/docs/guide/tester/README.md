# pingboard tester guide

This guide is for the people who check that changes to pingboard are safe. It assumes you can run commands in a terminal and read a test report.

pingboard is tested in two ways. A small suite of unit tests, run by pytest, covers the settings, the targets file and one rule of the command line; a linter, ruff, checks the source. Both run on every pull request and on every push to `main`, on two Python versions. The check itself and the dashboard have no automated tests, so they are checked by hand.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Getting started](start/README.md) | Run everything once and find the tests for an area |
| [II. Automated gates](gates/README.md) | Know what runs on a pull request and how to reproduce it |
| [III. Exploratory testing](explore/README.md) | Look for what the automated tests miss |
| [IV. Adding tests](contributing/README.md) | Write the right test for a change |
| [Appendix: words and commands](appendix.md) | Look up a testing word or a command |

## Conventions

- Commands are shown in `bash` blocks and are run from the repository root with the virtual environment active.
- A test is named by its file and function, the way pytest prints it: `tests/test_config.py::test_interval_floor`.
- A **target** is one URL in pingboard's list and **up** means it answered with a status below 400 in time; the operator guide's [Glossary](../operator/appendix/glossary.md) has the other project words.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations; the [developer guide](../developer/) explains how the code is organised and how to change it.
