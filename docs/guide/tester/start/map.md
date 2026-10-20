# What is tested where

This page maps each part of the project to the asset that checks it, so a reviewer can find the test for a change.

| Area | Files changed | Checked by | Kind |
|---|---|---|---|
| Marketplace manifest | `.claude-plugin/marketplace.json` | `jq empty`; name/source match loop in [Running the tests](running.md) | deterministic, manual run |
| Plugin manifests | `plugins/*/.claude-plugin/plugin.json` | required-field `jq` loop | deterministic, manual run |
| Documentalist skill | `plugins/feature-dev-documentalist/skills/document-phase/SKILL.md` | [Testing by hand](../explore/by-hand.md): phase detection on a throwaway branch | manual |
| Documentalist agents | `plugins/feature-dev-documentalist/agents/*.md` | manual: one `/document-phase <phase>` per agent, read the output file | manual |
| Stop hook | `plugins/feature-dev-documentalist/hooks/*` | `bash -n`; run with `CLAUDE_PLUGIN_ROOT` on clean and dirty trees | deterministic, manual run |
| Scaffold skill and references | `plugins/frontend-scaffold/skills/scaffold-frontend/**` | manual scaffold plus `npm run build`; `frontend-validator` agent | manual |
| Validator script | `…/scripts/validate_docs.py` | fixtures `broken-docs` (9 errors) and `renamed-layout` (0 errors, 4 warnings); this repository's docs | deterministic |
| Validator skill text | `…/SKILL.md`, `references/template.md`, `assets/template.json` | `evals/evals.json` cases 0 to 2 | eval harness |
| This documentation | `docs/guide/**` | `scripts/docs-check`, `.github/workflows/docs.yml` | deterministic, CI |
| Root README, docs index | `README.md`, `docs/README.md` | `validate_docs.py --repo-root .` repo checks | deterministic |

## Gaps

- No automated check runs a skill end to end; every skill is exercised by hand.
- `.github/workflows/validate.yml` watches a file that does not exist (see [Continuous integration](../gates/ci.md)), so manifest checks are manual until that workflow is fixed.
- The scaffold's reference files are only checked by generating a project and building it.
