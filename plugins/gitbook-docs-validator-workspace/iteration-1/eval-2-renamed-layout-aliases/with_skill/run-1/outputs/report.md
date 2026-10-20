# Documentation template check: ledgerd

**Verdict:** PASS with deviations — the scaffold has the right shape (landing page + three books, correct roles, SUMMARY/README/.gitbook.yaml/book.toml per book, Parts numbered, all links resolve), but almost every page is a one-line stub that is not marked `> Draft.`, the Makefile builds only one of the three books, and the repository integration (docs index, docs-check, Pages workflow) is not there yet.
Books found: user=`handbook/getting-started/`, operator=`handbook/internals/`, tester=`handbook/qa/`

Docs root: `handbook/` (not the usual `docs/guide/`; named by the user). All three folder names resolved through the built-in aliases (`getting-started` → user, `internals` → operator, `qa` → tester), so no `.docs-template.json` override is needed.

Script run: `validate_docs.py handbook --repo-root .` → **0 errors, 4 warnings, 2 notes**, exit 0.

## Structural failures (must fix)

None. Every check the script treats as an error passes:

- landing page present, one card per book, each `href="<book>/"`;
- each book has `README.md`, `SUMMARY.md`, `.gitbook.yaml` (`root: ./`, readme/summary structure) and `book.toml` (`src = "."`, `create-missing = false`);
- every SUMMARY starts with `README.md`, every listed file exists, no orphans, no duplicates, Parts are numbered `I..V` / `I..III` in order and point at part `README.md` files;
- one H1 per page on line one, no skipped heading levels, the single image exists and carries sentence-length alt text, all relative links and anchors resolve inside the docs root;
- every book README states its audience, has a reading-map table and a `> **Looking for …?**` cross-book callout linking the siblings;
- all error-level role pages are present (user: quick start, FAQ, glossary; operator: how it works, install, configuration, monitoring, operations; tester: running, gates, adding tests);
- root `README.md` links all three books.

## Template deviations (judge)

Warnings from the script:

- `Makefile` — template §8 expects `docs`, `docs-check` and `docs-serve BOOK=…` targets; only `docs` exists. Worse than the script reports: `docs` runs `mdbook build handbook/getting-started` only, so the internals and QA books are never built and `create-missing = false` protects just one book. Not a reasonable deviation; a scaffold should build all three from day one.
- `scripts/docs-check` — missing. The operator reference (`reference/environment.md`, `reference/commands.md`, `monitoring/metrics.md`) currently names `LEDGERD_HOME`, `ledgerd serve`, `ledgerd_entries_total`; nothing keeps those honest against the code once it exists.
- `qa/SUMMARY.md` — no exploratory / "by hand" page (template §7, tester should-have). Reasonable for a day-one scaffold, but add a stub so the Part is not forgotten.
- `internals/README.md:1` — H1 "ledgerd internals and deployment" vs SUMMARY title "Introduction". Informational; the SUMMARY convention is to call the README "Introduction", acceptable.

Deviations the script does not measure:

- **Every chapter is a stub without a `> Draft.` marker** (template §6). 26 of 27 content pages have a one-line body (`getting-started/glossary.md` is "Words we use.", `internals/operations/backup.md` is "Copy the file.", `qa/start/map.md` is "A map."). The template asks unfinished pages to carry `> Draft.` so tooling skips reference checks and reviewers can see the stubs. As it stands the site would publish 27 near-empty pages that look finished in the sidebar.
- **Tone requirements cannot be met yet**: the operator book quotes no defaults (`reference/environment.md` names `LEDGERD_HOME` without default, type or effect), and the tester book names no test files (`qa/start/map.md`, `qa/gates/ci.md`, `qa/contributing/README.md` have no commands or paths; only `start/running.md` names `make check`). These are consequences of the stubs rather than separate problems.
- `handbook/index.html` — cards have an audience tag, title and a one-line summary but **no "about three bullets of what is inside"** (template §2). Minor; add a `<ul>` per card when the books have content.
- `handbook/*/book.toml` — no `description` and no `site-url = "/<repo>/<book>/"` (template §3). Without `site-url` mdBook's search and 404 page misbehave when served under a sub-path on Pages. `build-dir = "../../site/<book>"` is correctly adjusted for the shallower `handbook/` root.
- **No docs index** (template §8 `docs/README.md`): nothing at `handbook/README.md` lists the books, the landing page and design documents. The root README does link all three books, which covers the essentials.
- **No Pages workflow** (`.github/workflows/`), so nothing builds the books with a pinned mdBook or copies `index.html` to the site root. Expected for a scaffold; it is the step that turns the tree into a site.
- `qa/README.md` — has audience, reading map and callout, but no **Conventions** section (template §5 item 4 for advanced books). `internals/README.md` has a one-bullet Conventions section. Minor.
- Reading maps promise more than SUMMARY delivers: `internals/README.md` says Part II covers "Install, upgrade, run as a service" and Part V "Backup, troubleshooting, release", but there is no upgrade page, no service/systemd page and no release page; Part IV promises "Metrics, logs, alerts" and has only `metrics.md`. Either add the chapters or trim the table so the map does not route readers to pages that do not exist.
- `getting-started/images/flow.svg` is a 10×10 empty SVG placeholder. The alt text is good; the diagram is not drawn yet.
- Docs root is `handbook/` instead of `docs/guide/`. Reasonable — the template only cares that the root holds `index.html` and the books, and the script resolved it without configuration. Make sure the future Pages workflow and `book.toml` `site-url` use this path.

## Suggestions

- Add `> Draft.` under the H1 of every stub now; remove it chapter by chapter as content lands. This is the cheapest fix and makes the state of the scaffold visible to reviewers.
- Make the Makefile `docs` target loop over the three books, add `docs-check` (links + reference reconciliation) and `docs-serve BOOK=getting-started`.
- Add `qa/explore/README.md` (exploratory testing) under a Part IV so the tester book covers all six template topics, and give `qa/contributing/` at least one chapter (e.g. the PR checklist) so Part III is not an empty part.
- In the operator book add `deploy/upgrade.md`, `deploy/service.md` (systemd, since the README assumes it), `monitoring/logs.md` and `operations/release.md`, or shorten the README reading map.
- Landing page: add the three-bullet `<ul>` to each card and consider a short "which book is for me" line under the lede.
- `getting-started/quick-start.md` already states the time ("about five minutes") — keep that first line when the steps are written, and end with a link to Everyday use.
- Use `handbook/getting-started/glossary.md`, `internals/appendix/glossary.md` and `qa/appendix/README.md` to define the same core nouns (account, entry, period, posting) in each audience's words rather than copying one list three times.

## Not checked

- No source code in the repo (`ledgerd` binary, Go tests, env vars) — the references `LEDGERD_HOME`, `ledgerd serve`, `ledgerd_entries_total` and `make check` could not be spot-checked for drift; `make check` does not exist in the fixture Makefile.
- No `.github/workflows/` — the Pages/mdBook workflow check was skipped.
- No generated pages ("Generated by …" marker) exist, so the hand-edit rule had nothing to test.
- The books were not built with mdBook or GitBook; the check is static.
- Light/dark rendering of `index.html` was not viewed in a browser; the `prefers-color-scheme` rule is present in the CSS.
