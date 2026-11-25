# Adding tests

> Draft.

This page says which kind of test to write for which kind of change and where the file goes. The conventions are missing: the repository has no existing tests to copy from, no test framework configured and no contributing rules, so the first tests added to ledgerd will set them.

## Where tests are needed

Every product area is without tests today. [What is tested where](../start/map.md) lists them; pick the area your change touches.

## When you add the first tests

Whoever adds the first tests also has to update this book, in the same pull request:

- the command that runs them goes into [Running the tests](../start/running.md) and the `Makefile`;
- the files go into the table in [What is tested where](../start/map.md);
- if the tests run on a pull request, the check goes into [Continuous integration](../gates/ci.md);
- the file layout and a minimal example go on this page.
