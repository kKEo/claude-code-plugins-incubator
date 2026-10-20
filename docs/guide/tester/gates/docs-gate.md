# The documentation gate

This page explains what `scripts/docs-check` verifies, so a failure can be read and fixed in one pass.

## Run it

```bash
scripts/docs-check; echo "exit $?"
```

or `make docs-check`. Exit 1 on any failure.

## Step 1: the template validator

```bash
python3 plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . --quiet
```

Fails on any ERROR: missing landing-page link, missing book file, orphan page, SUMMARY entry pointing at a missing file, second H1, broken relative link, link leaving the docs root, image without alt text, missing required page for a role. Warnings are printed and do not fail the gate; the convention is to keep them at zero anyway.

Each finding ends with `[file:line]`; open the file at that line.

## Step 2: reconciliation against the code

The script then checks that the operator book has not drifted from the code:

| Check | Source of truth | Must appear in |
|---|---|---|
| Every plugin directory is documented | `plugins/*/.claude-plugin/plugin.json` `name` | `docs/guide/user/plugins.md` |
| Every validator flag is documented | `add_argument("--…")` lines in `validate_docs.py` | `docs/guide/operator/config/commands.md` |
| Every hook event is documented | top-level keys under `hooks` in `plugins/*/hooks/hooks.json` | `docs/guide/operator/config/hooks.md` |
| Every skill name is documented | `name:` in `plugins/*/skills/*/SKILL.md` | `docs/guide/operator/config/skill-frontmatter.md` |
| Every agent name is documented | `name:` in `plugins/*/agents/*.md` | `docs/guide/operator/config/agent-frontmatter.md` |

A failure prints `missing: <item> in <file>`. Fix by documenting the item, or, if the item was removed from the code, by removing it from the page.

## Step 3: the build (CI only)

`docs.yml` builds each book with mdBook and `create-missing = false` in `book.toml`, so a SUMMARY entry pointing at a missing file fails the build as well as the validator. Locally, `make docs` does the same when `mdbook` is on `PATH`; `make docs-serve BOOK=tester` serves one book for reading.

## Reading a failure

1. ERROR lines from the validator: fix the file at the quoted line.
2. `missing:` lines: document the item or delete the stale reference.
3. mdBook errors: almost always a path typo in `SUMMARY.md`; the validator usually caught it first.
