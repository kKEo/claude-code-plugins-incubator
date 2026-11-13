---
description: Check only how the docs are wired into the repository (root README, docs index, Makefile, CI workflow, docs-check)
argument-hint: "<docs-root> [--repo-root DIR]"
---

Run only the repository-integration validator of gitbook-docs-validator. Take the docs root and an optional `--repo-root` from `$ARGUMENTS`. If no docs root is given, use `docs/guide` when it exists. If no repo root is given, use the git top level (`git rev-parse --show-toplevel`).

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/scripts/validate_docs.py" <docs-root> --repo-root <repo-root> --only repo --format md
```

This covers whether the root README and the docs index link every book, the `docs`/`docs-check`/`docs-serve` Makefile targets, a `docs-site` target that serves the whole built site locally from the landing page, a CI workflow that builds the docs, and a `scripts/docs-check` script. Do not read any page. Just fill in the verdict sentence and print the report.

Report rules: follow step 4 of the `gitbook-docs-validator` skill (`${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/SKILL.md`): keep the skeleton's shape and title, replace `<one sentence on why>`, drop the `<!-- … -->` hints, never list checks that passed. Keep the "Validators not run" line so nobody mistakes this for a full template check. Do not re-check by hand what the script reported, and do not fix anything unless asked.
