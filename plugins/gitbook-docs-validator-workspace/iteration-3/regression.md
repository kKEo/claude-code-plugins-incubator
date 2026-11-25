# Validator regression check after adding gitbook-docs-creator

**Date**: 2026-11-25 · **Model**: claude-fable-5-2 · one with-skill run per eval

The validator's SKILL.md gained two sentences that hand over to `gitbook-docs-creator` when
missing books or pages have to be written. This run checks that nothing else changed.
Eval 0 (external memory-find checkout) was not re-run. The reports were returned as text and
graded by reading them against the assertions in `evals/evals.json`; they were not saved.

| Eval | Assertions passed | Time | Tokens |
|---|---|---|---|
| 1 seeded-faults-fail | 10 / 10 | 63.4 s | 64913 |
| 2 renamed-layout-aliases | 6 / 6 | 51.5 s | 51484 |
| 3 repo-root-is-docs-root | 5 / 5 | 61.3 s | 51630 |
| 4 structure-only-fast-path | 6 / 6 | 32.9 s | 48366 |
| 5 single-validator-links | 6 / 6 | 33.1 s | 51332 |

Mean: 48.4 s and 53545 tokens, against 85.2 s and 52631 tokens in iteration 2. No regression.

Notes:

- Eval 5's first assertion (the script ran with `--only links`) is inferred from the report's
  scoped title and its "validators not run" line, not from the transcript.
- In eval 2 the report's suggestions name `gitbook-docs-creator` for the missing pages, which
  is the intended hand-over.
