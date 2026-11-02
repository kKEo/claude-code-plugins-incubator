# Documentation template check: memory-find

**Verdict:** PASS with deviations — all three books and the landing page are in place with no structural failures, but the tester book is not yet wired into the repository README or the other two books.
Books found: user=user/, operator=operator/, tester=tester/
Script: 0 error(s), 2 warning(s), 3 note(s).

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `README.md:174-175` — the root README lists only the user and operator guides, and says "Both guides are published…". The tester book exists and is linked from the landing page and `docs/README.md`, so this is an outdated line. Fix: add a tester-guide bullet and change "Both guides" to "All three guides".
- `user/README.md:42`, `operator/README.md:42` — each one points only to the other book. Neither mentions the tester guide; only `tester/README.md` links all its siblings. The script accepts one sibling link, but readers of the user or operator book never find the tester book. Fix: add one line to each.
- `user/README.md:32-40` — the reading map routes readers well (one row per need, not a copy of SUMMARY), but it leaves out three published pages: `menu-bar.md`, `keeping-tidy.md` and the `glossary.md` that the template requires. The glossary should be easy to find in a book that promises "no jargon". Fix: add rows for the glossary and the menu-bar app.
- `user/quick-start.md:94-95` — the quick start says "see 'One shared server over HTTP' in the operator guide" as plain text, without a link. The section exists at `operator/install/clients.md#one-shared-server-over-http`. Fix: make it a relative link so the docs check can catch it if it breaks.
- `operator/README.md:1` — the H1 "memors-mcp operator guide" does not match the SUMMARY title "Introduction" (the tester README uses "For testers"). Cosmetic, but the sidebar and page title differ. Reasonable either way; pick one.

## Suggestions
- `operator/README.md:31` — "Defaults quoted here are the shipped values for v1.4" will go stale on the next release. Name no version, or point to `memors-mcp profiles show` alone (the sentence already does that).
- `docs/README.md` — the docs index links all three books but never mentions the landing page `guide/index.html`. One row would make the published entry point findable from the repo.
- Content quality is good across the books: the operator reference (`config/environment.md`) quotes every default and names files and flags, the tester pages name exact `make` targets, test names and package paths, and the user quick start is timed ("about ten minutes"), step by step, and uses plain language. The generated scenario pages carry "Do not edit" headers and are guarded by a freshness test in the gate; no hand edits were seen.

## Not checked
- Built output: the books were not built with mdBook/GitBook; this is a static check.
- Code was spot-checked for one claim only (`MEMORS_HTTP_TOKEN_FILE` default `<MEMORS_HOME>/http-token`, confirmed in `internal/cli/httpserve.go`). Other defaults and commands were not compared against the code.
- Generated scenario pages were not regenerated with `make scenario-docs` to confirm they are fresh. The docs gate's freshness test covers this in CI.
