# pingboard developer guide

This guide is for the people who change the code of pingboard. It assumes you know the language it is written in and can use git.

pingboard is a small Python code base: one package of five modules, about two hundred lines in total, with no dependencies outside the standard library. The tests use pytest and the linter is ruff. A typical change touches one module, its test file under `tests/` and one page of the operator guide, because the reference pages there are checked against the code.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How the code is organised](code/README.md) | Find the code that does a thing |
| [II. Development setup](setup/README.md) | Get from a fresh checkout to a passing test run |
| [III. Contributing](contributing/README.md) | Make a change that will be merged |
| [IV. Extending](extending/README.md) | Add a command, a setting, an HTTP path or a metric |
| [V. Releasing](releasing/README.md) | See what is known about publishing a version |
| [Appendix: names in the code](appendix.md) | Look up what a name in the code means |

## Conventions

- Paths are relative to the repository root and shown in backticks: `pingboard/server.py`.
- Functions are written with parentheses and, where it helps, their module: `store.read()`. Classes and fields are written as in the code: `Config`, `data_file`.
- Commands are shown in `bash` blocks and are run from the repository root with the virtual environment active.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [operator guide](../operator/) covers how it works inside, installation, every setting, monitoring and operations; the [tester guide](../tester/) explains how every change is checked.
