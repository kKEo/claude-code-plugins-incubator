# Test environment

Test against a ledger you can throw away.

## Set up

1. Install the build under test as described in [Install](../../internals/deploy/install.md).
2. Point `LEDGERD_HOME` at an empty scratch directory. See [Environment variables](../../internals/reference/environment.md).
3. Start the service with `ledgerd serve`. See [Commands and flags](../../internals/reference/commands.md).

```sh
export LEDGERD_HOME="$(mktemp -d)"
ledgerd serve
```

## Rules

- One scratch directory per test run. Do not reuse a ledger between runs; earlier entries change the expected balances.
- Never point a test run at a ledger that holds real data.
- Record the version of the build under test with every result.

## Tear down

Stop the service and delete the scratch directory. Keep it only if a case failed; the ledger file is the best evidence for a [defect report](../release/reporting-defects.md).
