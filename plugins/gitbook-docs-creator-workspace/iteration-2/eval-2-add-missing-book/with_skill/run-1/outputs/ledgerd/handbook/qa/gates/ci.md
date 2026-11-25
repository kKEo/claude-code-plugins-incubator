# Continuous integration

> Draft.

This page lists every check that runs on a pull request, the command that reproduces it locally, and whether it blocks the merge. Whether checks run somewhere outside this repository (for example branch rules or a CI service configured on the hosting side) is missing; nothing in the repository says so.

## What the repository shows

There is no continuous integration configured in the repository: it has no workflow files and no CI configuration. No automated check blocks a merge.

| Check | What it catches | Run it locally | Blocks the merge |
|---|---|---|---|
| Build the user book | A `SUMMARY.md` entry in `handbook/getting-started` that points to a missing page (`create-missing = false` in its `book.toml`) | `make docs` | no, it is not run automatically |

## What a reviewer runs by hand

Until a check is automated, the reviewer is the gate. The only command the repository offers is the one in the table:

```bash
make docs
```

It is implemented in the `Makefile` and covers the user book only. Changes to the product itself have no command to verify them yet; see [Exploring by hand](../explore/by-hand.md).
