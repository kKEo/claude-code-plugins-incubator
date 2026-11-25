# Continuous integration

> Draft.

This page lists every check that runs on a pull request and how to reproduce it. One fact
is missing: the repository does not show whether a failed check blocks the merge. That is a
branch protection setting on GitHub, and the earlier documentation said that a pull request
cannot be merged when the tests fail.

| Check | What it catches | Run it locally | Blocks the merge |
|---|---|---|---|
| `test` | A failing test, or a `notekeep.py` that does not compile | `./run-tests.sh` | Not confirmed, see above |
| `docs` | A broken link in the books, a setting or command missing from the operator reference, a book that does not build | `make docs` | Not confirmed, see above |

## The `test` workflow

Defined in `.github/workflows/test.yml`. It runs on every pull request, and only on pull
requests: a push to a branch does not start it. On `ubuntu-latest` it checks out the code,
runs `pip install pytest`, then runs `./run-tests.sh`. The Python version is the one the
runner image provides; the workflow does not choose one.

To reproduce it, follow [Running the tests](../start/running.md).

## The `docs` workflow

Defined in `.github/workflows/docs.yml`. It runs on a pull request only when the change
touches `docs/guide/`, `scripts/docs-check*`, the `Makefile` or the workflow itself. It
installs mdBook and runs `make docs`, which is `scripts/docs-check.sh` followed by a build
of the three books.

```bash
make docs-check
make docs
```

`make docs-check` needs no extra tool. `make docs` needs `mdbook`.
