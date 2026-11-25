# Release checklist

A release is signed off only when every line is ticked.

## Tests

- [ ] The automated tests pass on the release build.
- [ ] Every [posting](../cases/posting.md) case passes.
- [ ] Every [balance](../cases/balances.md) case passes.
- [ ] Every [backup and restore](../cases/backup-restore.md) case passes.

## Upgrade

- [ ] A ledger written by the previous release opens with the new build, and every balance is unchanged.
- [ ] A backup taken with the previous release restores with the new build.

## Documentation

- [ ] The [getting started](../../getting-started/) guide matches the behaviour of the release.
- [ ] New or changed settings are in the [configuration reference](../../internals/reference/README.md).
- [ ] Every defect fixed in this release has a test case that would catch it.

## Sign-off

Record the build version, the date, the tester, and the identifiers of any cases that were skipped, with the reason.
