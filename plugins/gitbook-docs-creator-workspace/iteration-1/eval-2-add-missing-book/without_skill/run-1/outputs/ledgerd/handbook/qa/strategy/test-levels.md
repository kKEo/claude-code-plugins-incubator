# Test levels

ledgerd is a double-entry ledger, so the one property every level protects is the same: **the books always balance, and every balance can be explained by the entries behind it.**

| Level | What it checks | When it runs |
|---|---|---|
| Unit | One rule at a time, for example that an entry's debits equal its credits | On every change |
| Integration | A running `ledgerd serve` with a real ledger file: post, query, restart, query again | On every change |
| Acceptance | The [test cases](../cases/README.md) in this handbook, run by a tester | Before a release |
| Release | The [release checklist](../release/checklist.md) | Once per release |

## What a tester owns

- Running the acceptance cases and recording the result of each one.
- Adding a test case whenever a defect is found that no existing case would have caught.
- Signing the release checklist.

The data model the cases refer to (accounts, entries, periods) is described in the internals handbook under [Data model](../../internals/concepts/data-model.md).
