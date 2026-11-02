# Documentation template check: ledgerd

**Verdict:** PASS with deviations. The three-book shape is correct and nothing is broken, but this is a scaffold: most pages are stubs, the tester book has no exploratory-testing page, and the repo tooling (`docs-check`, `docs-serve`) is missing.
Books found: user=getting-started/, operator=internals/, tester=qa/
Script: 0 error(s), 7 warning(s), 2 note(s).

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `getting-started/SUMMARY.md`: 6 of 7 published pages have fewer than 15 words and no `> Draft.` marker, so they look finished in the sidebar (everyday.md, faq.md, glossary.md, privacy.md, quick-start.md, use-cases.md). Reasonable for a scaffold, but mark them `> Draft.` until they are written.
- `internals/SUMMARY.md`: 14 of 15 published pages are unmarked stubs (all part READMEs plus data-model, install, environment, commands, metrics, backup, troubleshooting, glossary). Same fix: mark them as drafts.
- `qa/SUMMARY.md`: 7 of 8 published pages are unmarked stubs (appendix, contributing, gates, gates/ci, start, start/map, start/running). Same fix.
- `qa/SUMMARY.md`: the tester book has no exploratory/manual testing page. Tests miss things, and the template expects the book to say how to look for them by hand. Fix: add a part (for example `exploratory/README.md`).
- `Makefile`: no `docs-check` target. Fix.
- `Makefile`: no `docs-serve` target. Also, the only `docs` target builds `handbook/getting-started` alone, so `internals/` and `qa/` are never built. Fix: build all three books.
- `scripts/`: no `scripts/docs-check` script to reconcile the operator reference with the code. Fix once the reference has content to check.
- `internals/README.md:13`: the reading map promises things the book does not have. "Operations: … release" has no release page, "Monitoring: … logs, alerts" has only `metrics.md`, and "posting pipeline" has only `data-model.md`. Fix: add the pages or trim the promises.
- `qa/README.md:13`: "Add a test" points to `contributing/README.md`, a part README with no child pages, so the reader lands on a stub. That is acceptable while it is a single-page part, but it needs real content.
- `qa/start/running.md:3`: says "Run `make check`", but the repo `Makefile` has no `check` target, so the only command the tester book gives would fail today. Fix: add the target or correct the command.
- `getting-started/quick-start.md`: states a time ("about five minutes") but has no steps yet. The time promise is unverifiable until steps exist.
- `internals/reference/environment.md`: lists `LEDGERD_HOME` with no default, type or meaning. The operator reference should quote defaults and name files. Fix when the page is filled in.
- Audience and tone are right in all three READMEs. Each states its reader (non-technical user / terminal+systemd operator / reads Go test output tester), routes by need rather than copying SUMMARY, and links to the sibling books. The landing page cards match the three roles.

## Suggestions
- `internals/README.md:1`: the H1 "ledgerd internals and deployment" differs from the SUMMARY title "Introduction". Align them so the sidebar and page title agree.
- `getting-started/README.md`: the reading map does not route to `privacy.md` or `use-cases.md`. Add a row such as "Decide whether ledgerd fits" for use cases, and "Know what is stored" for privacy.
- Add a `.github/workflows` docs job that runs the validator and builds all three books, so stubs and drift are caught on PRs.

## Not checked
- No `.github/workflows` directory, so the docs workflow check was skipped.
- No ledgerd source code is in the repo, so commands, env vars and the "Go test output" claim could not be compared against the code (only the Makefile was checked).
- Built output: the books were not built with mdBook/GitBook. This is a static check.
