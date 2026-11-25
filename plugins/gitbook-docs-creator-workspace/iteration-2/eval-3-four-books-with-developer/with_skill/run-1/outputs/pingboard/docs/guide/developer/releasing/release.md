# Release process

> Draft.

This chapter records what the repository shows about releasing pingboard. The steps to cut and publish a version are missing: the repository has no release workflow, no publishing configuration and no changelog, so a maintainer has to supply them.

## What the repository shows

- The version number lives in one place: the `version` field under `[project]` in `pyproject.toml`.
- The same file declares the console script: `pingboard = "pingboard.cli:main"` under `[project.scripts]`.
- `pyproject.toml` has no `[build-system]` table.
- The only workflows are `ci` (lint and tests) and `docs` (the documentation site). Neither builds or publishes a package.
- Users install from a checkout with `pip install -e .`, as the operator guide's [Install](../../operator/install/install.md) chapter describes. Whatever is on `main` is what a new checkout gets.

## Before changing the version

Whatever the process turns out to be, these checks follow from the rest of the repository:

```bash
make lint
make test
make docs
```
