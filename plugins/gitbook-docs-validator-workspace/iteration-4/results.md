# Validator check for the optional tester and developer books

**Date**: 2026-11-25 · **Model**: claude-fable-5-2 · one with-skill run per eval

The template changed from three required books to two required (user, operator) and two
optional (tester, developer). These two evals cover the new cases; the fixtures are in
`skills/gitbook-docs-validator/evals/fixtures/`. The reports were returned as text and graded
by reading them against the assertions in `evals/evals.json`; they were not saved.

| Eval | Assertions passed | Time | Tokens |
|---|---|---|---|
| 6 two-books-optional-absent | 5 / 5 | 28.1 s | 49317 |
| 7 four-books-developer-gap | 5 / 5 | 30.5 s | 52312 |

- Eval 6: verdict "PASS with deviations"; the report states that the tester and developer
  books are optional and their absence is not a finding, and flags the draft pages.
- Eval 7: verdict FAIL for the missing development-setup page; all four books are mapped,
  and "Build from source" in the operator book is reported as a suggestion to move.

Evals 1 to 5 were not re-run. The script gives the same counts as before on their fixtures
(`acme-notes`: 8 errors, 3 warnings; `ledgerd`: 0 errors, 7 warnings), and this repository's
own `docs/guide` still validates with 0 errors.
