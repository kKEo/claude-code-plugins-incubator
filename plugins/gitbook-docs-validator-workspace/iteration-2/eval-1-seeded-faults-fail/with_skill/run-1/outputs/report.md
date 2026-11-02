# Documentation template check: acme-notes (memors-mcp)

**Verdict:** FAIL — the landing page has no tester card, one published page is missing, one page is unpublished, the tester book cannot be loaded by GitBook, and the user book has no glossary.
Books found: user=user/, operator=operator/, tester=tester/
Script: 8 error(s), 1 warning(s), 5 note(s). Docs root: `docs/guide/`.

## Structural failures (must fix)
- `index.html:33-46` — the landing page has only two cards (user, operator). There is no `href="tester/"`, so readers cannot reach the tester guide from the landing page, although the `<meta name="description">` on line 7 promises a tester guide.
- `operator/SUMMARY.md:18` — 'Windows service' points to `install/windows.md`, which does not exist. GitBook shows a dead entry and mdBook (`create-missing = false`) fails the build.
- `operator/README.md:38` — the link `../../architecture.md` does not exist and points outside the docs root. Link the GitHub copy instead, as the next two bullets do.
- `tester/.gitbook.yaml` — the file is missing, so GitBook Git Sync cannot find root/readme/summary for the tester book. Copy `user/.gitbook.yaml`.
- `tester/start/running.md:64` — the page has a second H1 (`# Running on Windows`). It becomes a separate title in the outline. Make it an H2, or remove it (see the stub note below).
- `user/orphan-page.md` — not listed in `user/SUMMARY.md`, so it is never published. It is also a stub ("This page was written but never added to SUMMARY.md."). Either write it and add it to SUMMARY, or delete it.
- `user/README.md:11` — `![](images/how-it-works.svg)` has no alt text. This is the first picture a new reader sees, so describe what it shows.
- `user/SUMMARY.md` — the user book has no glossary page (looked for glossary/words/terms). `tester/appendix.md:28` already points readers to "the user guide's glossary", which does not exist.

## Template deviations (judge)
- `scripts/` — there is no docs-check script that reconciles the operator configuration reference with the code. `tester/start/running.md:29` and `tester/appendix.md:55` still tell testers to run `make docs-check`. Fix: add the script, or drop the references.
- `tester/` (13 files, e.g. `tester/README.md:38`, `tester/gates/docs.md:28-30`, `tester/scenarios/README.md:50-73`) — links to the generated pages (`scenarios/log`, `scenarios/gaps.md`, `scenarios/catalogue.md`) go to the placeholder repository `github.com/example/project`. Every other book uses `github.com/kKEo/memors`. The generated pages are not in the tree, so all of these links are broken once published. Fix: generate the pages into the book (`make scenario-docs`) and link them relatively, or at least correct the repository URL.
- `tester/start/running.md:64-66` — "Running on Windows / Not yet written." is a stub section with no `> Draft.` marker. It ships an empty promise. Remove it, or mark it as a draft.
- `operator/SUMMARY.md:18` together with `user/quick-start.md:8,22` — the user guide supports Windows, but the operator guide's Windows page is missing. Decide whether Windows is supported for operators before you publish.
- `user/quick-start.md:94-95` — "see 'One shared server over HTTP' in the operator guide" is unlinked. The section exists at `operator/install/clients.md#one-shared-server-over-http`, so link it.
- `user/quick-start.md` — the user book drifts into operator detail: `127.0.0.1:8765`, `--transport http`, certificates and tokens, and the "degraded" search mode. This is fine as an optional section, but terms like "MCP" (`/mcp`) and "language model" are not defined anywhere in the user book. That is one more reason to add a glossary.
- `tester/README.md:1` — the H1 "For testers" is generic. The other READMEs name the product ("memors-mcp operator guide"). The operator README H1 also differs from its SUMMARY title "Introduction" (script note). Pick one style for all three books.

## Suggestions
- `operator/README.md:31` — "Defaults quoted here are the shipped values for v1.4" will be wrong after the next release. Drop the version, or generate it, and keep pointing readers to `memors-mcp profiles show` / `--help`.
- `index.html` — the landing card for the user guide says "Quick start in ten minutes", which matches the quick start. When you add the tester card, follow the same pattern: give each card three concrete bullets (run the tests, what blocks a merge, exploratory testing).

## Not checked
- The fixture has no root `README.md`, `Makefile` or `.github/workflows`. The docs index, the `make docs` target and the docs CI workflow could not be verified.
- No source code was present, so the defaults in `operator/config/environment.md` and the make targets in `tester/start/running.md` were not compared against the code.
- The books were not built with mdBook/GitBook. This is a static check.
