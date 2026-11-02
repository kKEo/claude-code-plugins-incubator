# Documentation template check: acme-notes

**Verdict:** FAIL — 8 structural errors, including one orphan page, one missing SUMMARY target, one broken link and a tester book that is neither linked from the landing page nor configured for GitBook.
Books found: user=user/, operator=operator/, tester=tester/
Script: 8 error(s), 1 warning(s), 5 note(s). Structure-only lint; no qualitative pass.

## Structural failures (must fix)
- `user/orphan-page.md` — exists but is not in `user/SUMMARY.md`, so it is never published (orphan).
- `operator/SUMMARY.md:18` — 'Windows service' points to missing file `install/windows.md`; the build shows a dead entry.
- `operator/README.md:38` — link target `../../architecture.md` does not exist (broken link).
- `index.html` — landing page has no `href="tester/"` link, so the tester book is unreachable from the landing page.
- `tester/.gitbook.yaml` — missing; GitBook needs root/readme/summary to sync the tester book.
- `tester/start/running.md:64` — 2 H1 headings (lines 1, 64); one page, one title.
- `user/README.md:11` — image `images/how-it-works.svg` has no alt text.
- `user/SUMMARY.md` — user book has no glossary page (looked for: glossary, words, terms…).

## Template deviations (judge)
- `scripts` — no `scripts/docs-check` script that reconciles the operator reference with the code. Not blocking for a push; add when the operator reference stabilises.

## Suggestions
- `operator/README.md:1` — H1 'memors-mcp operator guide' differs from SUMMARY title 'Introduction'; align them so navigation and page title match.
- `operator/README.md` — README quotes a version (v1.4); such text drifts on each release.

## Not checked
- Qualitative pass (tone per reader, lead paragraphs, reading-map routing) skipped: structure-only request.
- No root README.md, Makefile or .github/workflows next to `docs/`; repo-level docs checks skipped.
- Built output: the books were not built with mdBook/GitBook; this is a static check.
