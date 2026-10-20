# Continuous integration

This page describes the two workflows under `.github/workflows/` and states plainly which of them blocks a merge today.

## validate.yml: the marketplace gate

Triggers on pull requests and pushes to `main` that touch `marketplace.json` at the repository root. Steps: install `jq`, run `jq empty marketplace.json`, then assert that every plugin entry has `id`, `name`, `description`, `author`, `version`, `repository`, `category`, `license`, `install`.

**State.** This gate does not run. The manifest lives at `.claude-plugin/marketplace.json`, the default branch is `master`, and the entries have `name`, `description`, `source`, `category` only. The path filter never matches, so the workflow is skipped on every pull request. Until it is rewritten, the manifest checks in [Running the tests](../start/running.md) are manual.

A fix is small: change both `paths` entries to `.claude-plugin/marketplace.json`, the branch to `master`, and the field list to `.name and .description and .source`. The fix is outside this documentation change and is tracked as a suggestion.

## docs.yml: the documentation gate

Triggers on pull requests and pushes to `master` that touch `docs/**`, `scripts/docs-check`, `Makefile` or the workflow itself. Steps:

1. Check out, set up Python 3.
2. Run `scripts/docs-check` (fails the job on exit 1).
3. Download a pinned mdBook release, verify its SHA-256, build the three books into `site/`.
4. Copy `docs/guide/index.html` to `site/index.html`.
5. On `master` only, deploy `site/` to GitHub Pages.

**State.** Blocking on every pull request that touches the docs. What it checks is described in [The documentation gate](docs-gate.md).

## What blocks a merge

| Change touches | Blocking check |
|---|---|
| `docs/**`, `scripts/docs-check`, `Makefile` | `docs.yml` must pass |
| `.claude-plugin/marketplace.json`, `plugins/**` | Nothing automated. Reviewer runs the [pull-request checklist](pr-checklist.md) |

Branch protection on `master` is a repository setting, not a file; confirm in the GitHub settings that `docs.yml` is a required status check.
