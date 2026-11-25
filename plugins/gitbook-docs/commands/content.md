---
description: Check the docs content (headings, stubs, book READMEs, required pages per role) and review the key pages
argument-hint: "<docs-root>"
---

Run the content validators of gitbook-docs-validator on the documentation tree given in `$ARGUMENTS`, then review the pages the script cannot judge. If no path is given, use `docs/guide` when it exists; otherwise ask for the path.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/scripts/validate_docs.py" <docs-root> --only pages,readme,roles --format md --worklist
```

The script covers H1 and heading levels, drafts and stub pages, book READMEs (audience, reading-map table, sibling links), the timed quick start and each role's required pages.

Then do the qualitative pass from step 3 of the skill, on the worklist only: read the worklist files in one parallel batch and judge audience fit, lead paragraphs, whether each README's reading map routes the reader, and text that could drift from the code. Add those findings under "Template deviations" or "Suggestions" and remove the worklist from the output.

Report rules: follow step 4 of the `gitbook-docs-validator` skill (`${CLAUDE_PLUGIN_ROOT}/skills/gitbook-docs-validator/SKILL.md`): keep the skeleton's shape and title, replace `<one sentence on why>`, drop the `<!-- … -->` hints, never list checks that passed. Keep the "Validators not run" line so nobody mistakes this for a full template check. Do not re-check by hand what the script reported, and do not fix anything unless asked.
