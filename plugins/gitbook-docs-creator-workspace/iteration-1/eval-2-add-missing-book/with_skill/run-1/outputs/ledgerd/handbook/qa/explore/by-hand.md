# Exploring by hand

> Draft.

This page will show how to set up a safe sandbox, which areas are worth probing and how to report what you find. It is waiting for the behaviour of the binary: the source code is not in the repository, and the reference pages name the command and the variable below without describing them.

## What is known

| Item | Source | What the source says |
|---|---|---|
| `ledgerd serve` | [Commands and flags](../../internals/reference/commands.md) | The name only: no arguments or flags are listed. |
| `LEDGERD_HOME` | [Environment variables](../../internals/reference/environment.md) | The name only: no type, default or effect is listed. |
| One data file | [Getting started](../../getting-started/README.md), [Backup and restore](../../internals/operations/backup.md) | ledgerd stores entries in one file, and a backup is a copy of that file. |

> **Warning.** Until the effect of `LEDGERD_HOME` is documented, do not assume that setting it keeps a test run away from real data. Explore on a machine or account that holds no ledger you care about.

## Still to write

- The exact steps to start a throwaway instance.
- The areas to probe and what to try in each. The candidates the other books point to are posting entries, querying balances, periods, and backup and restore.
- Where to report a finding and what the report has to contain.
