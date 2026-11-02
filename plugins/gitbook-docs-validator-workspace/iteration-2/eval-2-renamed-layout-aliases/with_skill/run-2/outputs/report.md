# Documentation template check: ledgerd

**Verdict:** PASS with deviations — the three-book shape, landing page, SUMMARYs and cross-links all match the template, but nearly every page is still an unmarked stub, the tester book has no exploratory-testing page, and the docs tooling (Makefile targets, docs-check script) is missing.
Books found: user=getting-started/, operator=internals/, tester=qa/
Script: 0 error(s), 7 warning(s), 2 note(s).

The renamed folders (`getting-started`, `internals`, `qa`) are recognised by the built-in aliases, so no `.docs-template.json` is needed.

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `getting-started/SUMMARY.md`: 6 of 7 published pages have fewer than 15 words and no `> Draft.` marker (everyday, faq, glossary, privacy, quick-start, use-cases), so readers see them as finished in the sidebar. This is expected in a scaffold. Add `> Draft.` until each page is written.
- `internals/SUMMARY.md`: 14 of 15 published pages are unmarked stubs (every part README, plus data-model, install, environment, commands, metrics, backup, troubleshooting, glossary). Same fix: mark them as drafts.
- `qa/SUMMARY.md`: 7 of 8 published pages are unmarked stubs (start/README, running, map, gates/README, ci, contributing/README, appendix/README). Same fix.
- `qa/SUMMARY.md`: the tester book has no page on exploratory (manual) testing. Fix: add one, for example `qa/exploratory.md` or a Part IV, and add it to SUMMARY and the reading map.
- `Makefile`: has no `docs-check` or `docs-serve` target. The only target, `docs`, builds `handbook/getting-started` alone, so `internals/` and `qa/` are never built. Fix.
- `scripts/`: there is no `scripts/docs-check` to reconcile the operator reference with the code. Fix this before the configuration reference fills up, because that is when drift starts.
- `qa/start/running.md`: tells the reader to "Run `make check`", but the Makefile has no `check` target. The first command in the tester book fails. Fix the page or add the target.
- `internals/README.md`: the reading map promises topics the book does not have. Part IV says "Metrics, logs, alerts", but only `monitoring/metrics.md` exists. Part V says "Backup, troubleshooting, release", but there is no release page. Fix: add the pages or trim the promises.
- `internals/reference/environment.md`: lists `LEDGERD_HOME` with no default, type or meaning. The operator book should quote defaults and name files. This is acceptable for a scaffold, but it is the most important page to fill in.
- `getting-started/quick-start.md`: states a duration ("about five minutes") but has no steps yet. Fine for a scaffold.

## Suggestions
- `internals/README.md:1`: the H1 "ledgerd internals and deployment" differs from the SUMMARY title "Introduction". Use one name so the sidebar matches the page.
- The QA reading map has no row for "What is tested where" (`start/map.md`). Once the exploratory page exists, add a "Look for bugs by hand" row as well.
- Root `README.md` links each book's `README.md`. Consider also linking the landing page (`handbook/index.html`), which is the entry point the template intends.

## Not checked
- There is no `.github/workflows` directory, so the docs workflow check was skipped.
- The repo has no source code, so claims such as `LEDGERD_HOME`, `ledgerd <command>` and Go tests could not be checked against an implementation. The only spot-check, `make check` against the Makefile, failed (see above).
- Built output: the books were not built with mdBook/GitBook. This is a static check.
