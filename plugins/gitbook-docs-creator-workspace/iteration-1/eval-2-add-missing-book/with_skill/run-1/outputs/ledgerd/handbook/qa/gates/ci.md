# Continuous integration

> Draft.

This page will list every check that runs on a pull request, the command that reproduces it locally, and whether it blocks the merge. It is waiting for a CI workflow: the repository has no workflow file, so it is not known whether checks run somewhere else or which rules protect the main branch.

## Checks in the repository today

| Check | What it catches | Run it locally | Blocks the merge |
|---|---|---|---|
| none | | | |

The repository has no `.github/workflows/` directory and no other CI configuration. The only automated command is the `docs` target in the [Makefile](https://github.com/example/ledgerd/blob/main/Makefile), which builds the getting-started book and is not wired to any pull-request check.

## Still to write

- What a reviewer has to run by hand before approving a change, once a test command exists (see [Running the tests](../start/running.md)).
- Each automated check, once a workflow is added.
