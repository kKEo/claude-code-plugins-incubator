# pingboard Tester Guide

This guide is for people who verify pingboard: contributors who run the tests before a pull request, reviewers who judge whether a change is tested well enough, and anyone who tests a version by hand before it is used in production.

## The quality gates

A change is accepted when it passes two automated gates, which run in continuous integration on Python 3.9 and 3.12:

| Gate | Command | Tool |
| --- | --- | --- |
| Lint | `make lint` | [ruff](https://docs.astral.sh/ruff/) with its default rules |
| Unit tests | `make test` | [pytest](https://docs.pytest.org/) |

The automated tests cover the configuration, the storage of the target list and one rule of the command line. The check itself and the HTTP server have no automated tests yet. Until they do, the [manual test plan](manual.md) covers them.

## What is in this guide

| Page | Content |
| --- | --- |
| [Running the tests](running.md) | Setting up and running the lint and the tests |
| [What the tests cover](coverage.md) | The existing tests, and the known gaps |
| [Writing tests](writing.md) | Conventions and patterns, with examples |
| [Manual test plan](manual.md) | Step-by-step checks for the parts without automated tests |
| [Continuous integration](ci.md) | What runs on a pull request and how to read a failure |
| [Reporting a defect](reporting.md) | What a useful report contains |

For how the code is organised, see the developer guide.
