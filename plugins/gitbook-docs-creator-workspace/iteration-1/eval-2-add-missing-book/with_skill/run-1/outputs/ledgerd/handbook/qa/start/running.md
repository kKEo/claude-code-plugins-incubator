# Running the tests

> Draft.

This page will show how to run the whole test suite once and how to run a single test. It is waiting for the test command: the repository has none yet.

## What the repository has today

The [Makefile](https://github.com/example/ledgerd/blob/main/Makefile) defines one target, `docs`, and it builds documentation, not tests:

```bash
# Builds the getting-started book with mdBook. Runs no tests.
make docs
```

There is no `test` target, no test configuration file and no test directory in the repository.

## Still to write

- The prerequisites and the one command that runs the suite.
- How long it takes, and what a pass and a failure look like.
- How to run one package or one test alone.
