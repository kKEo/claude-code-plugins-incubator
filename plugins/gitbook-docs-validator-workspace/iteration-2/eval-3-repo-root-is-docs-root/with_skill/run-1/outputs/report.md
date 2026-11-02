# Documentation template check: ledgerd handbook

**Verdict:** PASS with deviations. The three-book shape is correct (landing page, three books, SUMMARY/README/config files, part numbering, cross-links all valid), but almost every page is still an unmarked stub and the tester book has no exploratory-testing page.
Books found: user=getting-started/, operator=internals/, tester=qa/
Docs root = repo root = `handbook/` (the handbook is its own repository).

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `getting-started/SUMMARY.md`: 6 of 7 published pages are stubs under 15 words with no `> Draft.` marker (everyday.md, faq.md, glossary.md, privacy.md, quick-start.md, use-cases.md), so they look finished in the sidebar. Fine for a scaffold, but mark them `> Draft.` until they are written.
- `internals/SUMMARY.md`: 14 of 15 published pages are unmarked stubs (every page except README.md). Same fix. `reference/environment.md` lists `LEDGERD_HOME` with no default or meaning, and `reference/commands.md` lists only `ledgerd serve`. A "complete configuration reference" is the operator book's core promise, so fill these in first.
- `qa/SUMMARY.md`: 7 of 8 published pages are unmarked stubs (e.g. `start/map.md` is just "A map.", `gates/ci.md` is just "What runs on a pull request."). Same fix.
- `qa/SUMMARY.md`: no exploratory / by-hand testing page. Fix: add one, e.g. `contributing/exploratory.md`, and a row for it in the README's "Where to start" table.
- `qa/contributing/README.md`: "Adding tests" is a single part README with no child pages, and the PR checklist the template requires is only promised in one sentence. Fine as a scaffold, but it needs real content.
- `*/book.toml`: every book builds to `../../site/<book>`. With `handbook/` as the repo root, that path is outside the repository (`ledgerd/site/`), so a build writes to the parent directory or fails in CI. This setting only made sense when the books lived in `docs/guide/`. Fix: use `../site/<book>`.
- No `scripts/docs-check`, `Makefile` or docs workflow in this repo. For a docs-only repository, checking env vars and commands against the code cannot happen here alone. That is reasonable, but say where the check runs (the ledgerd code repo's CI checking out this one), or the reference will drift.

### Qualitative pass
- **Landing page** (`index.html`): good. Three cards, each with a one-line audience tag, a description, dark mode and a source/licence footer.
- **Book READMEs**: each states its reader and links the sibling books. The reading maps route by need rather than copying SUMMARY. Gaps:
  - `getting-started/README.md` has no row for Privacy or Use cases.
  - `qa/README.md` has no row for "What is tested where".
- **User quick start** (`getting-started/quick-start.md`): states "about five minutes" but has no steps. The README's "It assumes nothing beyond using a terminal" is the only prerequisite the user book gives.
- **Tester book** (`qa/start/running.md`): "Run `make check`" names a target in the ledgerd code repo, not in this repo (which has no Makefile). Say which repo and directory to run it from.
- **Operator book**: `internals/README.md` H1 "ledgerd internals and deployment" differs from the SUMMARY title "Introduction" (minor; align one to the other).

## Suggestions
- Add a root `README.md` to the handbook repo. It is what readers see first on the Git host. It should point to `index.html` and link each book.
- Fill pages in the order readers hit them: quick start, then environment/commands reference, then running the tests and CI gates.

## Not checked
- Root README, Makefile docs targets and docs workflow: none exist in the handbook repo, so these checks were skipped.
- Script false positive, dropped from this report: with repo root = docs root, the validator read `../README.md` (in the parent `ledgerd/` folder, outside this repository) as the "docs index". That file is not part of the handbook repo, and the script should not look above `--repo-root`.
- Claims against the code (env vars, commands, `make check`): no ledgerd source was available.
- Built output: the books were not built with mdBook/GitBook; this is a static check.
