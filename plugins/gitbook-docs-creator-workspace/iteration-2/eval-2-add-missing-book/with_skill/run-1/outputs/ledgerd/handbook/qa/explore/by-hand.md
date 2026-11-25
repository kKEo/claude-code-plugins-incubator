# Exploring by hand

> Draft.

This page says where to probe ledgerd by hand and how to report what you find. The sandbox setup and the concrete things to try in each area are missing: they depend on how `ledgerd serve` and `LEDGERD_HOME` behave, which the operator reference names but does not describe, and there is no source code in the repository to read it from.

## Before you start

Do not explore against a ledger that holds real entries. The operator guide lists one environment variable, `LEDGERD_HOME` ([Environment variables](../../internals/reference/environment.md)); confirm what it controls before you rely on it to separate a sandbox from real data.

## Areas worth probing

These are the areas the operator guide documents. None has an automated test ([What is tested where](../start/map.md)), so each is covered by hand or not at all.

| Area | Why it is worth probing | Read first |
|---|---|---|
| Backup and restore | A backup that cannot be restored is found out too late | [Backup and restore](../../internals/operations/backup.md) |
| Data model | Accounts, entries and periods are what every balance is computed from | [Data model](../../internals/concepts/data-model.md) |
| Metrics | `ledgerd_entries_total` should agree with what was posted | [Metrics](../../internals/monitoring/metrics.md) |
| Starting the service | `ledgerd serve` is the only documented command | [Commands and flags](../../internals/reference/commands.md) |

## Reporting what you find

Open an issue in the [ledgerd repository](https://github.com/example/ledgerd/issues) with the exact commands you ran, what you expected, and what happened instead. Attach the output as text.
