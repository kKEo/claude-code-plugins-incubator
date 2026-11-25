# pingboard Developer Guide

This guide is for people who change pingboard: it explains how to set up a working copy, how the code fits together and how a change gets merged.

pingboard is small on purpose. It is about 200 lines of Python in five modules, uses only the standard library and keeps one JSON file as its state. You can read all of it in half an hour, and this guide helps you to read it in the right order.

## Start here

1. [Development setup](setup.md): clone, install, run the tests.
2. [Architecture](architecture.md): the five modules and how data flows between them.
3. [Contributing a change](contributing.md): from an idea to a merged pull request.

## What is in this guide

| Page | Content |
| --- | --- |
| [Development setup](setup.md) | Tools, installation and the daily commands |
| [Architecture](architecture.md) | Structure, data flow, threads and design decisions |
| [Module reference](modules.md) | Every module, function and data type |
| [Coding conventions](conventions.md) | Style, compatibility and dependencies |
| [How to make common changes](recipes.md) | Step-by-step recipes: a setting, a command, a route, a metric |
| [Contributing a change](contributing.md) | Issues, branches, pull requests and review |
| [Known limitations and ideas](limitations.md) | Where the code falls short, as a source of first contributions |
| [Working on the documentation](documentation.md) | Layout and rules of these books |

## Related guides

* The tester guide explains the test suite, the test patterns and the manual test plan.
* The user guide and the operator guide describe the behaviour that your change must keep or update.

## Project facts

| Fact | Value |
| --- | --- |
| Repository | <https://github.com/example/pingboard> |
| Main branch | `main` |
| Language | Python, 3.9 or later |
| Runtime dependencies | None |
| Development tools | pytest, ruff, make |
| Licence | MIT |
| Version | 0.6.0, set in `pyproject.toml` |
