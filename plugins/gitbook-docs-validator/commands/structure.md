---
description: Check only the docs structure (books, landing page, per-book files, SUMMARY.md and orphan pages)
argument-hint: "<docs-root> [--repo-root DIR]"
---

Run only the structural validators of gitbook-docs-validator on the documentation tree given in `$ARGUMENTS`. If no path is given, use `docs/guide` when it exists; otherwise ask for the path.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/scripts/validate_docs.py" <docs-root> --only landing,files,summary --format md
```

This covers the role mapping (user/operator/tester), the landing page, `README.md`/`SUMMARY.md`/`.gitbook.yaml`/`book.toml` per book, SUMMARY order and Part numbering, missing entries, and orphan (unpublished) pages. Do not read any page. Just fill in the verdict sentence and print the report.

Report rules: follow step 4 of the `gitbook-docs-validator` skill (`${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/SKILL.md`): keep the skeleton's shape and title, replace `<one sentence on why>`, drop the `<!-- … -->` hints, never list checks that passed. Keep the "Validators not run" line so nobody mistakes this for a full template check. Do not re-check by hand what the script reported, and do not fix anything unless asked.
