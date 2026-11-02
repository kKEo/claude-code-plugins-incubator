# Documentation template check: memory-find

**Verdict:** PASS with deviations. The landing page and all three books are structurally complete, but the repository's front door (root `README.md`) still describes two guides and never links the tester book.
Books found: user=user/, operator=operator/, tester=tester/
Script: 0 error(s), 2 warning(s), 3 note(s).

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `README.md:174-175`: the root README does not link the tester book, so people who arrive from GitHub never find it. **Fix:** add a `[Tester guide](docs/guide/tester/README.md)` bullet next to the user and operator bullets.
- `README.md:175`: the line "Both guides are published to GitHub Pages…" says two guides, but there are three books. **Fix:** change it to "All three guides" and mention the landing page `docs/guide/index.html`.
- `user/quick-start.md:94-95`: the line "see 'One shared server over HTTP' in the operator guide" names a section in plain text and does not link to it. The section exists at `operator/install/clients.md#one-shared-server-over-http`. A new user cannot get there from the quick start. **Fix:** make it a relative link.
- `user/quick-start.md:67-99`: the optional "one shared server" section adds HTTP addresses, ports and `serve --http` to a page that promises "about ten minutes". It is marked optional, so the deviation is reasonable. It would read better as its own page in `everyday/` or as a link to the operator guide, which would keep the quick start to steps 1-5.
- `operator/README.md:14-22`: the reading map has one row per Part, which mirrors SUMMARY. The "Read it when you need to…" column does route readers, so the deviation is reasonable. The user book's map (one row per need) is the better model, for example rows for "Back up before an upgrade" or "Set up an alert".
- `tester/start/running.md:1-3`: no lead paragraph. The page goes straight from the H1 to "What you need". Add one sentence that says what the page is for and when to read it. Minor.

## Suggestions
- `operator/README.md:1`: the H1 "memors-mcp operator guide" differs from the SUMMARY title "Introduction". Use the same title in both places so the sidebar and the page heading match.
- Version text in prose will drift. `operator/README.md:31` says "Defaults quoted here are the shipped values for v1.4". `operator/config/profiles-json.md:7,62` and `operator/monitoring/catalogue.md:3` also mention v1.4. `CHANGELOG.md` already has a large `[Unreleased]` section on top of 1.4.0, so these pages may already lag `master`. Keep a single "applies to" line in each book README and point readers to `memors-mcp --help` / `profiles show` for live values.
- `docs/README.md`: this docs index lists the three books but not the landing page `guide/index.html`, which is the actual entry point. Its hand-maintained "Updated" dates (user/operator 2026-10-03) will also drift.

## Notes (good, no action needed)
- The pages marked as generated (`tester/scenarios/catalogue.md`, `gaps.md`, `log/*`) still have their "Do not edit" headers. `go test ./internal/eval/scenario/book/` passes, so nobody has edited them by hand.
- Spot check against the code: in `operator/config/environment.md:20`, the `MEMORS_RERANKER` default `ms-marco-minilm` matches `internal/cli/kbcmds.go:1117`.
- Each book speaks to its reader. The user book explains terms in plain words, the operator book quotes defaults and names files, and the tester book names make targets, test names and paths.

## Not checked
- The books were not built with mdBook or GitBook. This is a static check.
- Only one claim was checked against the code. Other defaults and commands in the operator and tester books were not compared with the code.
- External links (GitHub releases, modelcontextprotocol.io, design docs on GitHub) were not fetched.
- I read only the pages on the worklist (landing page, three book READMEs, user quick start, `operator/config/environment.md`, `tester/start/running.md`). Content on other pages was covered by the script's structural checks only.
- The local clone has only the `v0.3.0` tag. I checked release numbers against `CHANGELOG.md` and `docs/eval/` instead.
