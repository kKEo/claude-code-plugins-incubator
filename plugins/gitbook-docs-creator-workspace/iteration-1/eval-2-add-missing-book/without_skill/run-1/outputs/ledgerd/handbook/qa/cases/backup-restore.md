# Backup and restore

The procedure under test is described in [Backup and restore](../../internals/operations/backup.md).

| ID | Steps | Expected result |
|---|---|---|
| BAK-01 | Post entries, take a backup, restore it into an empty `LEDGERD_HOME`, start the service. | Every account has the same balance and the same entries as the original. |
| BAK-02 | Take a backup, post more entries, restore the backup. | The ledger shows the state at the time of the backup; the later entries are absent. |
| BAK-03 | Restore a backup, then post a new balanced entry. | The entry is accepted and the ledger still balances. |
| BAK-04 | Start the service on a truncated copy of a ledger file. | The service refuses to start or reports the damage; it does not serve wrong balances. |

If a restored ledger does not behave as expected, see [Troubleshooting](../../internals/operations/troubleshooting.md) before reporting a defect.
