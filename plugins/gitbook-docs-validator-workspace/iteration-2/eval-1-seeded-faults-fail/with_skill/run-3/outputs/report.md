# Documentation template check: acme-notes (memors-mcp)

**Verdict:** FAIL — the landing page hides the tester book, the tester book cannot be published by GitBook, and the docs contain broken links, an unpublished page and a missing user glossary.
Books found: user=user/, operator=operator/, tester=tester/
Script: 8 error(s), 1 warning(s), 5 note(s).

## Structural failures (must fix)
- `index.html` — no card linking `tester/`; the landing page offers only the user and operator guides, so readers never find the tester guide.
- `tester/.gitbook.yaml` — missing (GitBook needs root/readme/summary); the tester book will not sync.
- `operator/SUMMARY.md:18` — 'Windows service' points to missing file `install/windows.md`; a dead entry in the published navigation.
- `operator/README.md:38` — link target `../../architecture.md` does not exist (it also leaves the docs root).
- `tester/start/running.md:64` — 2 H1 headings (lines 1, 64); one page, one title. The second H1, "Running on Windows", is a two-word placeholder ("Not yet written.") with no `> Draft.` marker.
- `user/orphan-page.md` — not in `SUMMARY.md`, so it is never published. Its body is a one-line note, not content: either write it and list it, or delete it.
- `user/README.md:11` — image `images/how-it-works.svg` has no alt text.
- `user/SUMMARY.md` — the user book has no glossary page. Every book defines its own words; the user book uses "knowledge base", "MCP", "memo:// address" and "language model" without one place that defines them.

## Template deviations (judge)
- `scripts` — no `scripts/docs-check` script reconciling the operator configuration reference with the code. Fix once the docs live in the code repo; meanwhile `environment.md` can drift silently.
- `tester/README.md:38`, `tester/gates/docs.md:28-30`, `tester/contributing/README.md:42-43`, `tester/scenarios/pictures.md:3,9,10`, `tester/explore/README.md:5` — the links to the generated pages (implemented-scenarios log, behaviour gaps, catalogue) use the placeholder `https://github.com/example/project/...` instead of the real repository (`github.com/kKEo/memors`, as used in `index.html` and the user and operator books). These links are dead. The generated pages are also absent from `tester/scenarios/` (no `log/`, `gaps.md`, `catalogue.md`), so a static check cannot catch it. Fix.
- `user/README.md` — the reading-map table routes by reader need (good), but it has no row for a glossary, consistent with the missing page. Add one when the glossary exists.
- `user/quick-start.md:67-99` — the "one shared server" section (HTTP transport, loopback address, certificates, tokens) is operator material inside a ten-minute quick start for non-technical readers. It is optional and well signposted. Reasonable, but it would be better as a link to the operator guide, which would also keep the quick start within its ten-minute promise.
- `user/quick-start.md:95` — refers to "One shared server over HTTP" in the operator guide by name, with no link. Link it so it does not drift.
- `tester/start/running.md` — no lead paragraph; the page starts directly with "What you need". Add one sentence on what the page is for.

## Suggestions
- `operator/README.md:1` — the H1 'memors-mcp operator guide' differs from the SUMMARY title 'Introduction'; align them so the navigation and the page agree.
- `operator/README.md:31` — "shipped values for v1.4" puts a version number in prose, which drifts on each release; refer to "the current release" and rely on `memors-mcp profiles show`.
- Project name: the repository is `acme-notes`, but every page, and the landing page title, says `memors-mcp`. Confirm this is intended before publishing.

## Not checked
- No root README.md, Makefile or `.github/workflows` next to the docs, so the root README, `make docs` target and docs workflow checks were skipped.
- No source code available; defaults in `operator/config/environment.md` and the make targets in `tester/start/running.md` were not compared against the code.
- Absolute (https) links were not fetched; the placeholder-URL finding comes from reading them.
- Built output: the books were not built with mdBook/GitBook; this is a static check.
