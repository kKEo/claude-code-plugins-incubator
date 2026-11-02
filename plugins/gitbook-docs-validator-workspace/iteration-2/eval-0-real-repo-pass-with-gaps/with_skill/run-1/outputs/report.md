# Documentation template check: memory-find

**Verdict:** PASS with deviations. The landing page and all three books are structurally complete and have no failures, but the repository's entry points (root README, docs index) still describe a two-guide layout, and a few pages carry references that will drift.
Books found: user=user/, operator=operator/, tester=tester/
Script: 0 error(s), 2 warning(s), 3 note(s).

## Structural failures (must fix)
- None.

## Template deviations (judge)
- `README.md:174-175`: the root README does not link the tester book (`docs/guide/tester`). Readers who start from the repo never find it. Fix: add a "Tester guide" bullet next to the user and operator ones.
- `README.md:175`: says "Both guides are published to GitHub Pages", but there are three books. Leftover from before the tester book was added. Fix: reword to "The three guides" (or "All guides").
- `user/quick-start.md:67-99`: the "one shared server" option (`serve --http`, `127.0.0.1:8765`, `/mcp`, transports) puts operator material into a ten-minute, non-technical quick start. It is marked optional, so this is tolerable, but it is the one place where the user book drops its "no jargon" promise. Suggest moving it to an everyday or "Looking inside" page, or into the operator book's install part, and leaving a one-line pointer in its place.
- `user/quick-start.md:95`: the cross-reference "see 'One shared server over HTTP' in the operator guide" is plain text with no link. It cannot be followed, and the docs checks will not catch it if the heading is renamed. Fix: make it a relative link to the operator page and anchor.
- `tester/README.md:1`: the H1 is "For testers", while the other books use "memors-mcp operator guide" and "Welcome". This is a naming inconsistency rather than a rule break. Consider "memors-mcp tester guide" to match the operator book and the landing-page card.

## Suggestions
- `operator/README.md:1`: the H1 "memors-mcp operator guide" differs from the SUMMARY title "Introduction". Align them so the sidebar and the page agree.
- `operator/README.md:31`: "Defaults quoted here are the shipped values for v1.4." This is correct today (CHANGELOG 1.4.0), but it goes stale with every release. The next sentence already points to `profiles show` and `--help`, so the version number can be dropped.
- `tester/README.md:23`: "The ten-tool MCP surface" is a count in prose that will drift when a tool is added. The golden test is the source of truth, so say "the MCP tool surface".
- `docs/README.md`: the docs index lists the three books but not the landing page `guide/index.html`. Add one row for it, since the landing page is what gets published.

## Not checked
- Built output: the books were not built with mdBook/GitBook; this is a static check.
- Code claims: only one was spot-checked. The `MEMORS_MODEL` default `granite-small-r2` in `operator/config/environment.md` matches `internal/embedding/registry.go` (`DefaultModelID`). Other defaults and commands were not compared against the code; `make docs-check` covers env vars, commands and metrics.
- Generated pages (`tester/scenarios/catalogue.md`, `gaps.md`, `log/*`): carry the "Do not edit" header, and `TestBookCurrent` passes, so they match their sources and have no hand edits.
