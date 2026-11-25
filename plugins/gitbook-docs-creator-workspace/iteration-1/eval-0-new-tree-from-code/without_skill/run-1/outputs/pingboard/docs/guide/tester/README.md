# pingboard Tester Guide

This guide is for people who verify pingboard: before a change is merged,
before a release, or after a deployment. It describes the automated tests,
what they do and do not cover, and the manual test cases that fill the gaps.

## Test levels

| Level | Tool | Where | Runs |
| --- | --- | --- | --- |
| Static checks | Ruff | `make lint` | Locally and in CI |
| Unit tests | pytest | `make test`, folder `tests/` | Locally and in CI |
| Manual system tests | Shell, `curl`, browser | [Manual test cases](manual-test-cases.md) | By hand, before a release |

There are no automated integration or end-to-end tests yet. The check logic
and the HTTP server are verified by hand; see [Test coverage](test-coverage.md).

## What is in this guide

| Page | Content |
| --- | --- |
| [Test environment](test-environment.md) | Setting up an isolated environment with local test targets |
| [Automated tests](automated-tests.md) | Running the suite, the existing tests, writing new ones |
| [Test coverage](test-coverage.md) | What is covered, what is not, where to add tests first |
| [Manual test cases](manual-test-cases.md) | Step-by-step cases with expected results |
| [Continuous integration](continuous-integration.md) | What CI runs and how to reproduce it |
| [Release checklist](release-checklist.md) | What to verify before a release |
| [Reporting a defect](reporting-a-defect.md) | What a useful report contains |

The behaviour that the tests verify is specified in the User guide (commands
and output) and in the Operator guide (configuration, endpoints, check loop).
