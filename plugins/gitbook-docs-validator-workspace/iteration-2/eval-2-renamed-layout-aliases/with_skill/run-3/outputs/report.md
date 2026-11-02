# Documentation template check: ledgerd

**Verdict:** PASS with deviations — the shape matches the template (landing page plus three books, all wired correctly), but almost every page is an unmarked stub, the QA book has no exploratory-testing page, and the repo-level docs tooling is missing.
Books found: user=getting-started/, operator=internals/, tester=qa/
Script: 0 error(s), 7 warning(s), 2 note(s).

The renamed folders map cleanly onto the template roles through the built-in aliases (`getting-started` is user, `internals` is operator, `qa` is tester), so no `.docs-template.json` is needed.

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `getting-started/SUMMARY.md`: 6 of 7 published pages have fewer than 15 words and no `> Draft.` marker (everyday, faq, glossary, privacy, quick-start, use-cases). They show up in the sidebar looking finished. That's expected in a scaffold, but add `> Draft.` until each page has content.
- `internals/SUMMARY.md`: 14 of 15 published pages are unmarked stubs (every part README and every leaf page). Same fix.
- `qa/SUMMARY.md`: 7 of 8 published pages are unmarked stubs. Same fix.
- `qa/SUMMARY.md`: there's no exploratory or by-hand testing page. This is a real gap in the tester book, not just a scaffold gap, so add one (for example `contributing/exploratory.md`) and a reading-map row for it.
- `Makefile`: has no `docs-check` or `docs-serve` target, and the only `docs` target builds just `handbook/getting-started`, so `internals` and `qa` are never built. Fix.
- `scripts/`: there's no docs-check script to reconcile the operator reference with the code. Fix once the reference has content.
- `internals/README.md`: the reading map promises topics the book doesn't have. Part I mentions "the posting pipeline" but has only `data-model.md`. Part IV promises "Metrics, logs, alerts" but has only `metrics.md`. Part V promises "release" but has only backup and troubleshooting. Either add the pages or trim the promises.
- `getting-started/quick-start.md`: it says "about five minutes" but contains no steps. The timing claim can't be checked until the steps exist.
- `internals/reference/environment.md`: lists `LEDGERD_HOME` with no default, type or meaning. The operator book is supposed to quote defaults. `commands.md` and `monitoring/metrics.md` are bare names in the same way.
- `qa/start/running.md`: names `make check`, but the Makefile has no `check` target. Either the command is wrong or the target is missing. Fix.

## Suggestions
- `internals/README.md:1`: the H1 "ledgerd internals and deployment" differs from the SUMMARY title "Introduction". Make them match so the sidebar and the page agree.
- `getting-started/README.md`: the reading map has no row for `privacy.md` or `use-cases.md`. Add "Decide whether it fits / is my data safe" rows so those pages get found.
- `qa/README.md`: "It assumes you can read Go test output" is a code-coupled claim, and this repo contains no source to confirm it. Check it once the code lands.
- Two glossaries (`getting-started/glossary.md`, `internals/appendix/glossary.md`) plus `qa/appendix` "Terms and commands" will drift apart. Keep one canonical glossary and link to it from the others.
- Root `README.md` links to all three books but not to `handbook/index.html`. Point to the landing page as the single entry.

## Not checked
- There are no `.github/workflows`, so the docs CI workflow check was skipped.
- There's no source code in the repo, so the documented command (`make check`), variable (`LEDGERD_HOME`) and metric (`ledgerd_entries_total`) weren't verified against the code.
- Built output: the books weren't built with mdBook or GitBook. This is a static check.
