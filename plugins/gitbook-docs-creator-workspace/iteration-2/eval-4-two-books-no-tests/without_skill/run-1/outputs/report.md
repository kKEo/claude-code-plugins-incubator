The csvjoin documentation is set up under `docs/guide` with a landing page and two books: a user guide and an operator guide. Both books build cleanly with mdBook 0.5.4; I did not test them in GitBook itself. Build output and caches are removed.

## Books I left out
- **Tester guide:** the project has no tests, test tooling or CI, so there is nothing to describe.
- **Developer guide:** the tool is one 60-line file with no build, packaging or contribution process.

## What is there
- **Landing page:** `docs/guide/index.html` is a static page linking to both books and the source repository.
- **User guide** (`docs/guide/user/`): introduction, install, first join, choosing which rows to keep, options, recipes, troubleshooting.
- **Operator guide** (`docs/guide/operator/`): introduction, deployment, configuration (`CSVJOIN_MAX_ROWS`), running unattended, limits and resource use, failures and exit codes, upgrading and removing.
- **Per-book config:** each book has `.gitbook.yaml` (root `./src/`), `book.toml` (with the repository URL) and `src/README.md` plus `src/SUMMARY.md`.

(Excerpt of the run's final message, saved for grading; the sections on tool behaviour and assumptions are omitted.)
