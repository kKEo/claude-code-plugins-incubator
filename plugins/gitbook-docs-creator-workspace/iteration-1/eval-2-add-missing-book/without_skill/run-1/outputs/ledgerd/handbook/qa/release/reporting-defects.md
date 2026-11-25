# Reporting a defect

A report is useful when someone else can reproduce the problem without asking a question.

## What to include

1. **Build version** under test.
2. **Test case identifier**, for example `POST-02`, or "no existing case".
3. **Steps**, starting from an empty `LEDGERD_HOME`, with the exact commands.
4. **Expected result** and **actual result**, side by side.
5. **Evidence**: the service output and, where possible, the ledger file from the scratch directory.

## Severity

| Severity | Meaning | Example |
|---|---|---|
| Blocker | The ledger can end up wrong | An unbalanced entry is accepted |
| Major | A feature does not work, but stored data is correct | A balance query returns an error |
| Minor | Wrong wording, unclear error, cosmetic issue | A misleading error message |

Any defect that lets the books go out of balance, or loses an accepted entry, is a blocker and stops the release.

## After the fix

Add or extend a test case in [Part II](../cases/README.md) so that the defect cannot come back unnoticed.
