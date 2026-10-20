# Fixtures and seeded faults

This page lists each fixture under `plugins/gitbook-docs-validator/skills/gitbook-docs-validator/evals/fixtures/` and the exact findings the validator must produce for it. Change a fixture and this page together.

## broken-docs

A three-book tree at `broken-docs/docs/guide/` with nine faults. Expected: nine ERROR lines, exit 1.

| # | Fault | File | Check tag |
|---|---|---|---|
| 1 | Landing page has no card linking `tester/` | `index.html` | `landing` |
| 2 | Tester book has no `.gitbook.yaml` | `tester/.gitbook.yaml` | `book-files` |
| 3 | Image with empty alt text | `user/README.md:11` | `image` |
| 4 | Link target `../../architecture.md` does not exist | `operator/README.md:38` | `link` |
| 5 | Same link leaves the docs root | `operator/README.md:38` | `link` |
| 6 | Second H1 on the page | `tester/start/running.md:64` | `page` |
| 7 | User book has no glossary page | `user/SUMMARY.md` | `role` |
| 8 | SUMMARY entry points at missing `install/windows.md` | `operator/SUMMARY.md:18` | `summary` |
| 9 | `orphan-page.md` not listed in SUMMARY | `user/orphan-page.md` | `summary` |

Faults 4 and 5 come from one line and are two findings on purpose: the first says the file is missing, the second says the link would be wrong even if it existed.

The same tree, with the same faults, is duplicated at `plugins/gitbook-docs-validator-workspace/fixtures/acme-notes/` for eval case 1.

## renamed-layout

A passing tree at `renamed-layout/handbook/` with books named `getting-started/`, `internals/`, `qa/`, plus a `Makefile` with only a `docs` target and no `scripts/` directory. Run with `--repo-root renamed-layout`. Expected: zero errors, exit 0, and these four warnings:

| Warning | Check tag |
|---|---|
| Makefile has no `docs-check` target | `repo` |
| Makefile has no `docs-serve` target | `repo` |
| No `scripts/docs-check` script | `repo` |
| QA book has no exploratory-testing page | `role` |

The point of this fixture is the alias mapping (`getting-started` → user, `internals` → operator, `qa` → tester) and that a passing tree is not over-reported. The same tree is duplicated at `plugins/gitbook-docs-validator-workspace/fixtures/ledgerd/` for eval case 2.

## This repository's docs

`docs/guide/` is the third fixture in effect: it must pass with zero errors and `--repo-root .`. It is the only tree that exercises the repository checks fully (root README links, docs index, Makefile targets, docs workflow, `scripts/docs-check`).
