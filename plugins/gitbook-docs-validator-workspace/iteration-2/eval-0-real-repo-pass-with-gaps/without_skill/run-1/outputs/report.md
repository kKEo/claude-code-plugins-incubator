# Documentation structure check: `docs/guide` vs the three-book template

Repository: `/Users/krma/Work/memory-find` (branch `feature/living-system-scenarios`, clean)
Checked on: 2026-10-19
Template: one static landing page + user guide (entry level) + operator guide (development and deployment) + tester guide (QA)

## Verdict

**PASS with minor gaps.** All four parts of the template are present, every book has the required
GitBook/mdBook scaffolding, no page is orphaned or missing, no relative link or anchor is broken,
the generated pages are current, `scripts/docs-check.sh` passes and all three books build cleanly
with mdBook v0.5.4 (the version CI pins). What is off is a handful of stale references outside
`docs/guide` that still describe a two-book layout, one title inconsistency, and a few structural
asymmetries between the operator and tester books.

## What was checked

| Check | Method | Result |
|---|---|---|
| Landing page exists and links to all three books | read `docs/guide/index.html`; built site into a scratch dir and confirmed `user/`, `operator/`, `tester/` each render `index.html` | OK |
| Each book has `README.md`, `SUMMARY.md`, `.gitbook.yaml`, `book.toml` | file listing | OK (3/3) |
| Every `.md` file is listed in its book's `SUMMARY.md` (no orphans) | script over 18 + 49 + 34 pages | OK, 0 orphans |
| Every `SUMMARY.md` entry points to an existing file | script | OK, 0 missing |
| Relative links and image references resolve | script + `scripts/docs-check.sh` | OK, 0 broken; docs-check prints `ok` |
| In-page anchors (`file.md#anchor`) resolve | script over ~170 anchored links | OK (all point to explicit `<a id=…>` anchors in the generated tester pages) |
| Images in each `images/` folder are referenced by at least one page | grep | OK, no unused SVGs |
| Generated tester pages match their sources | `go run ./cmd/memors-scenario book --check` | `book: up to date` |
| mdBook build of all three books | `mdbook build … -d <scratch>` | 3/3 clean, no warnings |
| Cross-book links stay inside `docs/guide` | docs-check rule 1 | OK |
| Stale product names (`memo-mcp`, `MEMO_*`) | grep | Only in the intended "Upgrading from memo-mcp" migration text |
| Draft stubs (`> Draft.`) | grep | None |

Nothing in the repository was modified. The scratch build went to the session scratchpad, not to `site/`.

## Per-part findings

### 1. Landing page (`docs/guide/index.html`)

Present and matches the template: a single static HTML file with three cards (For everyone / For
operators / For testers) linking to `user/`, `operator/`, `tester/`, a one-line lede and a footer
with the repository link. `make docs` copies it to `site/index.html` and the `docs.yml` workflow
deploys `site/` to GitHub Pages. Each `book.toml` sets `site-url = "/memors/<book>/"`, which is
consistent with the relative `href`s on the landing page.

No issues.

### 2. User guide (`docs/guide/user/`, 18 pages, ~8k words)

Entry-level book as the template asks: Welcome, Why it matters, Quick start (5 steps, ten
minutes), Everyday use (5 subpages), Trust, Looking inside, menu-bar app, Keeping it tidy, Use
cases, Privacy, FAQ/troubleshooting, Glossary. Prose is plain-English with code only where a
reader must paste a config snippet. Hands off to the operator guide at the end of the README.

Observations (not failures):

- The book is flat rather than split into "Part I…" sections like the other two. For an
  entry-level book this is a reasonable choice, but if the template expects the same part
  structure everywhere, this is the one book that deviates.
- The "How to read this guide" table in `README.md` does not mention `menu-bar.md`,
  `keeping-tidy.md` or `glossary.md`; all three are reachable from `SUMMARY.md`, so nothing is
  unpublished.

### 3. Operator guide (`docs/guide/operator/`, 49 pages, ~21k words)

Seven parts plus an appendix: How it works, Install and deploy, Configuration reference,
Retrieval tuning, Knowledge lifecycle, Monitoring, Operations (backup, integrity, capacity,
export, troubleshooting, release engineering), Appendix (glossary, further reading).
Configuration pages are enforced by `docs-check` (every env var, command and metric in the code
must appear here).

Findings:

- **Title mismatch (minor).** `SUMMARY.md` labels the first chapter `Introduction` while
  `README.md`'s H1 is `memors-mcp operator guide`. The other two books keep the two in sync
  (`Welcome`/`Welcome`, `For testers`/`For testers`). Pick one; the sidebar and the page heading
  currently disagree.
- **"Development" is thin relative to "deployment".** The template describes this book as the
  development-and-deployment guide. Deployment is covered in depth (Parts II, III, VI, VII), but
  development lives in two places only: `install/source.md` (build, cross-compile, `make`
  targets) and `operations/release.md` (pipelines, cutting a release, versioning). There is no
  page on repository layout, package map, or contribution workflow for code changes; the
  tester guide carries the test side of that. If the template expects a development section,
  consider a short "Part: Developing" (or rename/expand `install/source.md`) and move
  `operations/release.md` there, so that "Operations" is purely day-two work.
- Part index pages are deliberately short (`appendix/README.md` 19 words,
  `operations/README.md` 39 words). They work as tables of contents, so this is a style note,
  not a gap.

### 4. Tester guide (`docs/guide/tester/`, 34 pages, ~21k words)

Five parts plus an appendix: Getting started (running, map), Automated gates (CI, goldens,
retrieval benchmark, fuzz/race, tray, docs checks), Scenario tests (first scenario, DSL,
invariants, pictures, tools, studio, failures, decisions, gaps, catalogue, implemented log,
next), Exploratory testing, Adding tests. The gaps, catalogue and log pages are generated from
`internal/eval/testdata/` and are current.

Findings:

- **Single-page parts (structural asymmetry).** `Part V: Adding tests` is a folder containing
  only `README.md`, and the appendix is a single `appendix.md` where the operator book uses an
  `appendix/` folder with a glossary and a further-reading page. Content-wise nothing is
  missing (the appendix holds a word list and a command list), but if the template wants the
  same shape across books, split `appendix.md` into `appendix/glossary.md` +
  `appendix/commands.md`, and either give Part V subpages or fold it into Part I.
- The tester glossary defers product terms to the user and operator glossaries via cross-book
  links (`../user/glossary.md`, `../operator/appendix/glossary.md`). See the cross-book note
  below.

## Cross-cutting findings

1. **Cross-book relative links depend on the three books being published side by side.**
   Eight links use `../user/`, `../operator/…` or `../tester/`
   (`user/README.md`, `user/faq.md` x2, `operator/README.md`, `tester/README.md` x2,
   `tester/appendix.md` x2). They resolve on the mdBook site because `make docs` builds all
   books under one `site/` root, and `docs-check` allows them because they stay inside
   `docs/guide`. In GitBook, where each book is its own space, those links will not resolve
   unless the spaces are mounted next to each other under one site. If GitBook publishing is a
   real target (not just "GitBook-compatible markdown"), convert these eight links to absolute
   published URLs, or document the constraint.

2. **Stale "two guides" references outside `docs/guide`.** The tester book was added on
   2026-10-18 and these places still describe the previous layout:
   - `/Users/krma/Work/memory-find/README.md` lines 174-175: lists only the user and operator
     guides and says "Both guides are published to GitHub Pages". Add the tester guide.
   - `/Users/krma/Work/memory-find/scripts/docs-check.sh` lines 2-5: header comment says "keep
     the user and operator guides honest" / "every relative link in either guide"; the script
     already walks all of `docs/guide/`.
   - `/Users/krma/Work/memory-find/docs/README.md` "Live documents" table: the user and
     operator rows say "Updated 2026-10-03" although git shows their last substantive commits
     on 2026-10-14 (user) and 2026-10-18 (operator); only the operator row carries the
     "GitBook-compatible; built with mdBook" note, which now applies to all three.

3. **No in-repo description of the template itself.** Nothing under `docs/` or a CONTRIBUTING
   file states the three-book layout as a rule (the closest is `tester/gates/docs.md`, which
   explains the build and the generated pages). The structure is therefore enforced only by
   `make docs` listing the three books by name. A short "Documentation layout" note in
   `docs/README.md` would make the template checkable by reviewers.

## Summary of action items

| # | Severity | Item | Where |
|---|---|---|---|
| 1 | Low | Align sidebar label and H1 of the operator introduction | `docs/guide/operator/SUMMARY.md` / `README.md` |
| 2 | Low | Add the tester guide to the root README docs list; fix "Both guides" | `README.md` lines 174-175 |
| 3 | Low | Update header comment to cover all three guides | `scripts/docs-check.sh` lines 2-5 |
| 4 | Low | Refresh dates and the mdBook note in the docs index | `docs/README.md` |
| 5 | Judgement | Give the operator book an explicit development section (or expand `install/source.md`) | `docs/guide/operator/` |
| 6 | Judgement | Make the tester appendix and Part V match the operator book's shape | `docs/guide/tester/appendix.md`, `tester/contributing/` |
| 7 | Judgement | Decide how cross-book `../` links should behave under GitBook | 8 links listed above |
| 8 | Nice-to-have | Write down the three-book template in `docs/README.md` | `docs/README.md` |

Everything the template requires is present and builds; items 1-4 are housekeeping, 5-7 are
design choices that depend on how strictly the template is meant to be applied.
