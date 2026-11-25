# Running the tests

> Draft.

This page will show how to run the whole test suite once and how to run a single test. The test command, its prerequisites, its duration and its output are missing: the repository has no test files and no test configuration, and its `Makefile` has no test target.

## What you can run today

The `Makefile` has one target, `docs`. It builds the user book with mdBook and runs no tests:

```bash
make docs
```

It needs `mdbook` on your `PATH`. The target builds `handbook/getting-started` only; the operator book and this book are not built by it.

## Next

- [What is tested where](map.md) lists the product areas and their coverage.
- [Continuous integration](../gates/ci.md) says what is checked on a pull request.
