# Continuous integration

> Draft.

This page lists every check that runs on a pull request and the command that reproduces it
locally. One fact is missing: the repository files do not show whether a branch rule makes
these checks required, so the "Blocks the merge" column is not confirmed.

| Check | What it catches | Run it locally | Blocks the merge |
|---|---|---|---|
| `test` | A failing test, or a `notekeep.py` that does not compile | `./run-tests.sh` | The earlier documentation says a pull request cannot be merged when it fails; not confirmed from the repository |
| `docs` | A broken link in the books, a setting or command missing from the operator reference, a book that does not build | `make docs` | Not confirmed |

## The test check

Defined in
[`.github/workflows/test.yml`](https://github.com/example/notekeep/blob/HEAD/.github/workflows/test.yml).
It runs on every pull request, on `ubuntu-latest`, and does what you do locally:

```bash
pip install pytest
./run-tests.sh
```

See [Running the tests](../start/running.md) for what a pass and a failure look like.

## The docs check

Defined in
[`.github/workflows/docs.yml`](https://github.com/example/notekeep/blob/HEAD/.github/workflows/docs.yml).
It runs on pull requests that change `docs/guide/`, `scripts/docs-check*`, the `Makefile` or
the workflow itself. It installs mdBook and runs:

```bash
make docs
```

`make docs` runs `make docs-check` (links, and the operator reference against the code) and
then builds every book. To run only the fast part locally, without mdBook:

```bash
make docs-check
```
