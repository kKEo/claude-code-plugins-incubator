# Documentation template check: acme-notes (memors-mcp)

**Verdict:** FAIL — all three books exist, but the landing page hides the tester book, the tester book cannot be built by GitBook, and the user book is missing its glossary and leaves a page unpublished, so these docs are not ready to publish.
Books found: user=user/, operator=operator/, tester=tester/
Script: 8 errors, 1 warning, 5 notes (exit 1).

## Structural failures (must fix)
- `index.html` — the landing page has only two cards (user, operator) and no `href="tester/"`, so readers cannot reach the tester book from the front page. The stray indentation on the closing `</div>` (line 46) suggests the card was deleted by mistake.
- `tester/.gitbook.yaml` — file is missing. GitBook does not know the book's root, readme or summary, so the tester book will not publish (mdBook still builds it from `book.toml`).
- `operator/SUMMARY.md:18` — "Windows service" points to `install/windows.md`, which does not exist. The navigation shows a dead entry, and mdBook fails because `create-missing = false`.
- `operator/README.md:38` — the "Architecture" link goes to `../../architecture.md`, which does not exist and would leave the docs root anyway. Link to the file on GitHub instead, as the Schema and Eval links do.
- `tester/start/running.md:64` — a second H1, "# Running on Windows", followed by "Not yet written." Two titles on one page, plus a stub section with no `> Draft.` marker.
- `user/orphan-page.md` — "Sharing a memory with a colleague" is missing from `user/SUMMARY.md`, so it is never published. Its body is only a placeholder sentence: finish it and list it, or delete it.
- `user/README.md:11` — `![](images/how-it-works.svg)` has no alt text. This is the first picture a new reader sees.
- `user/SUMMARY.md` — the user book has no glossary. The template requires one. Words such as "MCP", "terminal", `memo://` address and "degraded" search appear in the quick start without a definition.

## Template deviations (judge)
- `scripts/` — there is no docs-check script to compare the operator configuration reference with the code. `tester/start/running.md:29` still documents `make docs-check`, so either the script lives outside this tree or the docs describe a target that does not exist. Fix, or confirm before publishing.
- `tester/**` (13 files, e.g. `tester/README.md:38`, `tester/gates/docs.md:28-30`) — the generated scenario pages (gaps, catalogue, implemented-scenarios log) are linked through a placeholder URL, `https://github.com/example/project/...`. The real repository is `github.com/kKEo/memors`, and the `book.toml` files already use it. These links go to the wrong repository, and the generated pages are not in the tree for the freshness gate to check. Fix: replace them with relative links once the pages are generated, or at least use the correct repo URL.
- `operator/README.md:1` — the H1 "memors-mcp operator guide" differs from the SUMMARY title "Introduction". Minor; align them so the navigation and the page title agree.
- `operator/README.md:31` — "Defaults quoted here are the shipped values for v1.4" puts a version number in prose, and it will be wrong after the next release. Reasonable as a caveat, but better to say "for this release" or generate the value.
- Windows story is inconsistent across books: the user quick start supports Windows (`user/quick-start.md:8,22`), but the operator page for Windows is missing and the tester section is a stub. Either finish the pages or mark Windows as experimental in the user book.

## Qualitative pass
- **User book, quick start:** it states its time ("about ten minutes") and is otherwise plain. However, the "Optional: one shared server" section (lines 67–99) adds HTTP servers, ports, `/mcp` and certificates/tokens to a ten-minute entry page. It should move to an everyday or FAQ page. The cross-reference "see 'One shared server over HTTP' in the operator guide" (line 95) is plain text; make it a link to `../operator/install/clients.md#one-shared-server-over-http`.
- **User README reading map:** it routes by need, which is good. It has no glossary row (see failures), and `menu-bar.md` and `keeping-tidy.md` are reachable only through SUMMARY.
- **Operator book:** `config/environment.md` names files and quotes a default for every variable, which is what the template asks for. The README's reading map mirrors the seven parts. That is acceptable for an operator audience, but it is closer to a copy of SUMMARY than a router by need.
- **Tester book:** it names commands and test files throughout, which is good. `tester/start/running.md` has no lead paragraph: it opens directly with "## What you need". Add one sentence saying what the page is for.

## Suggestions
- Add a check for landing-page cards (one per book) to CI, so a deleted card fails the build instead of reaching readers.
- Generate the scenario pages into `tester/scenarios/` before publishing, and link them relatively. Then the generated-docs freshness gate covers what readers see.

## Not checked
- No repository root files in the fixture: no root `README.md`, no `Makefile` (docs targets), and no `.github/workflows` (docs workflow). The `make` targets quoted in the tester book could not be checked against the code.
- No source code was available, so no claim was spot-checked against it (env defaults, CLI commands, `v1.4`).
- Built output: the books were not built with mdBook or GitBook. This is a static check.
