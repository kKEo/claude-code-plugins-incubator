# notekeep documentation migration: report

The README and the four files under `docs/` now live in three books under `docs/guide/`, behind one landing page. The validator passes with 0 errors, and all three books build with mdBook.

## Books

| Book | Pages | Contains |
|---|---|---|
| User guide (`docs/guide/user/`) | 7 | Welcome, quick start, everyday use, trust and privacy, use cases, questions, glossary |
| Operator guide (`docs/guide/operator/`) | 16 | System overview, install, three reference pages, monitoring, troubleshooting, backup, glossary, plus the part pages |
| Tester guide (`docs/guide/tester/`) | 11 | Running the tests, test map, pull request checks, exploring by hand, adding tests, appendix, plus the part pages |

The landing page is `docs/guide/index.html`. I added two operator pages beyond the minimum outline: `config/http-api.md` and `operations/backup.md`.

## Still a draft

- **`tester/gates/ci.md`**: the repository does not show whether a failed check blocks the merge. That is a GitHub branch protection setting. The old `docs/testing.md` said a failing pull request cannot be merged; the page reports that claim as unconfirmed.

## What moved where

| Old text | New home |
|---|---|
| README "Getting started" | `user/quick-start.md` (a short version stays in the README) |
| README "Configuration" | `operator/config/environment.md` |
| README "FAQ" | `user/faq.md` and `operator/operations/troubleshooting.md` |
| `docs/usage.md` | `user/everyday-use.md` |
| `docs/architecture.md` | `operator/intro/overview.md` |
| `docs/deploy.md` | `operator/install/install.md`, `operator/operations/backup.md` (Backup), `operator/monitoring/signals.md` (Health) |
| `docs/testing.md` | `tester/start/running.md`, `tester/start/map.md`, `tester/gates/ci.md`, `tester/contributing/adding-tests.md` |

The four old files were moved with `mv`, so `docs/` now holds only `README.md` (the docs index) and `guide/`.

## Corrected or dropped because the code disagrees

- **Default port**: the README said 9000; the code and its test say 7070. Fixed everywhere, including the root README.
- **`delete` command**: `docs/usage.md` documented `python3 notekeep.py delete`, which does not exist, and the API has no `DELETE` either. Dropped. The operator guide shows how to remove a row with `sqlite3`.
- **`NOTEKEEP_MAX_NOTE_BYTES`**: this setting (default 65536) was not documented anywhere. Added.
- **Reading a note**: the API cannot return a note's text; only `show` and `export` on the host can. The user guide now says so.
- **Python 3.9 or newer**: kept from the old README, but no file in the repository pins or tests a version. The install page says this.

## Files added or changed outside `docs/guide/`

- `README.md`: shortened to an entry point, port corrected, a Documentation section links every book.
- `docs/README.md` (new): docs index with the build commands.
- `Makefile` (new): `docs`, `docs-check`, `docs-build`, `docs-serve`, `docs-site`, `docs-clean`.
- `scripts/docs-check.sh` (new): link check, plus reconciliation of the environment variables and commands in `notekeep.py` with the operator reference pages.
- `.github/workflows/docs.yml` (new): builds the books on pull requests and deploys to GitHub Pages from `main`.
- `.gitignore` (new): `site/`.

## Checks

- **Validator**: PASS, 0 errors, 1 warning (the draft page above), 2 notes.
- **`make docs-check`**: ok.
- **`make docs-build`**: all three books built; the `site/` output was removed afterwards.
- **Test suite**: 3 passed, run with pytest from a scratch virtual environment.

## Preview

Run `make docs-site` and open `http://localhost:8000/`. It needs `mdbook`.
