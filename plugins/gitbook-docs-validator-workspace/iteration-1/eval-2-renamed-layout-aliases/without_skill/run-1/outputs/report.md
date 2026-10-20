# ledgerd handbook: three-book template review

**Scope:** `/Users/krma/.claude/skills/gitbook-docs-validator-workspace/fixtures/ledgerd/handbook` (repo root `fixtures/ledgerd`).
**Method:** read every file; checked each `SUMMARY.md` for missing targets and orphan pages; resolved every relative link; built all three books with mdBook (v. on PATH) on a scratch copy; inspected the `Makefile` `docs` target and the resulting `site/` tree. The fixture itself was not modified.

## Verdict

**Structurally the handbook matches the template.** It has the four required pieces, each in the right place, and the structure is link-clean:

| Template piece | Present as | Status |
|---|---|---|
| Static landing page | `handbook/index.html` | OK: cards link to all three books, dark-mode aware, source + licence footer |
| Entry-level user book ("getting started") | `handbook/getting-started/` | OK: builds, 0 orphans, 0 broken links |
| Operator / development-and-deployment book | `handbook/internals/` (named "internals" rather than e.g. "operations"/"deployment") | OK: builds, 0 orphans, 0 broken links |
| Tester / QA book | `handbook/qa/` | OK: builds, 0 orphans, 0 broken links |

Each book has its own `.gitbook.yaml` (readme + summary declared), `book.toml` (`create-missing = false`, build-dir under `../../site/<book>`), `README.md` and `SUMMARY.md`. Every page listed in a SUMMARY exists, every Markdown file is reachable from a SUMMARY, every intra-book and cross-book relative link resolves, and the one image (`getting-started/images/flow.svg`) exists and has descriptive alt text. The three books cross-reference each other from their READMEs (`../getting-started/`, `../internals/`, `../qa/`), which resolve correctly in the built site because all three land as siblings under `site/`.

**What is missing is mostly build wiring and content that the books themselves promise but do not deliver.** Details below, ordered by severity.

## Findings

### 1. Build pipeline only publishes one of the four pieces (high)

`Makefile`:

```make
docs:
	mdbook build handbook/getting-started
```

- `internals` and `qa` are never built, so `make docs` yields a `site/` with only `site/getting-started/`.
- `handbook/index.html` (the landing page) is never copied to `site/index.html`, so the published root has no entry point and its `getting-started/`, `internals/`, `qa/` card links have nothing to point at for two of the three.
- Fix: build all three books and copy the landing page, e.g. `mdbook build handbook/internals && mdbook build handbook/qa && cp handbook/index.html site/`.

### 2. Internals book: README advertises sections that do not exist (medium)

`internals/README.md` and the part pages describe more than the SUMMARY contains:

| Promised in README / part page | What exists | Missing |
|---|---|---|
| Part I "data model **and the posting pipeline**" | `concepts/data-model.md` | a posting-pipeline page |
| Part II "Install, **upgrade, run as a service**" | `deploy/install.md` | upgrade page; systemd / run-as-a-service page (the README even says it assumes systemd) |
| Part III "variable, command **or file**" | `environment.md`, `commands.md` | configuration-file reference |
| Part IV "Metrics, **logs, alerts**" | `monitoring/metrics.md` | logs page; alerts page |
| Part V "Backup, troubleshooting, **release**" | `backup.md`, `troubleshooting.md` | release / upgrade procedure |

Also, the README says the book is for people who "deploy, configure **and develop** ledgerd", but there is no development section at all (building from source, repo layout, running locally, contributing). The template describes this book as the development-and-deployment guide, so a "Development" part is the most significant content gap in the whole handbook.

### 3. QA book: two parts are leaf stubs (medium)

- `qa/contributing/README.md` ("Part III: Adding tests") promises "which kind of test to write, and the pull-request checklist" but has no child pages; it is a one-line stub listed directly in the SUMMARY.
- `qa/appendix/README.md` ("Appendix: words and commands") likewise has no glossary or command pages beneath it, unlike the internals appendix which does have `glossary.md`.
- Part II "Automated gates" has only CI. If there are other gates (lint, coverage threshold, release checks, scenario/nightly runs) they have no home yet.
- The getting-started table in `qa/README.md` links only to running/CI/contributing; `start/map.md` ("What is tested where") is in the SUMMARY but not surfaced from the README. Minor.

### 4. All content pages are placeholders (expected for a scaffold, flagged for completeness)

Every non-README page is a heading plus one sentence (e.g. `quick-start.md`: "This takes about five minutes."). That is fine for a scaffold, but note that "0 broken links / 0 orphans" says nothing about readiness to publish.

### 5. Minor consistency and hygiene items (low)

- `getting-started/README.md` navigation table omits two SUMMARY pages: **Privacy and trust** and **Use cases**. Readers who use the README as the entry point will not discover them.
- `internals/SUMMARY.md` labels the first entry "Introduction" while the page H1 is "ledgerd internals and deployment"; the other two books keep SUMMARY label and H1 identical ("Welcome", "QA handbook"). Pick one convention.
- `book.toml` titles are inconsistent in case/style: `"ledgerd getting-started"`, `"ledgerd internals"`, `"ledgerd qa"` vs. the landing cards "Getting started", "Internals and deployment", "QA handbook".
- `src = "."` in each `book.toml` makes mdBook copy `book.toml` and `.gitbook.yaml` into the published `site/<book>/` directory (confirmed in the scratch build). Harmless but untidy; a `src/` subdirectory or an ignore rule would avoid it.
- Two glossaries exist (`getting-started/glossary.md`, `internals/appendix/glossary.md`) and the QA appendix promises a third. Decide whether these are intentionally audience-specific or should share one source.
- The landing page's footer links to `https://github.com/example/ledgerd`, a placeholder URL.

## Checklist summary

| Check | Result |
|---|---|
| Landing page present and links all three books | Pass |
| Three books present, one per audience | Pass |
| `.gitbook.yaml` + `book.toml` + `README.md` + `SUMMARY.md` in each book | Pass |
| SUMMARY targets all exist | Pass (3/3 books) |
| No orphan Markdown pages | Pass (3/3 books) |
| No broken relative links or images | Pass |
| Cross-book links resolve in built site | Pass |
| All three books build with mdBook | Pass |
| `make docs` builds every book and the landing page | **Fail** (getting-started only; landing page not copied) |
| Book content matches what its README promises | **Fail** for internals (5 gaps) and qa (2 stub parts) |
| Development/contributor section in operator book | **Missing** |

## Recommended next steps

1. Fix the `Makefile` to build `internals` and `qa` and copy `index.html` into `site/`.
2. Add the pages the internals README already promises (posting pipeline, upgrade, run as a service, config file, logs, alerts, release) or trim the README to match; add a Development part.
3. Give QA Part III and the QA appendix their child pages (test-kind guide, PR checklist, glossary, commands).
4. Add Privacy and Use cases to the getting-started README table; align the internals SUMMARY label with its H1; normalise `book.toml` titles.
