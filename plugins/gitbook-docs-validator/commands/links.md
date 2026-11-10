---
description: Check only links in the docs (relative links, anchors, image alt text, unused images)
argument-hint: "<docs-root>"
---

Run only the links validator of gitbook-docs-validator on the documentation tree given in `$ARGUMENTS`. If no path is given, use `docs/guide` when it exists; otherwise ask for the path.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/scripts/validate_docs.py" <docs-root> --only links --format md
```

This covers relative links that do not resolve or leave the docs root, anchors with no matching heading, images without real alt text, and images no page references. Do not read any page. Just fill in the verdict sentence and print the report. If there are errors, group the bullets by file so they are easy to fix.

Report rules: follow step 4 of the `gitbook-docs-validator` skill (`${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/SKILL.md`): keep the skeleton's shape and title, replace `<one sentence on why>`, drop the `<!-- … -->` hints, never list checks that passed. Keep the "Validators not run" line so nobody mistakes this for a full template check. Do not re-check by hand what the script reported, and do not fix anything unless asked.
