# Posting entries

How entries are posted day to day is described in [Everyday use](../../getting-started/everyday.md).

| ID | Steps | Expected result |
|---|---|---|
| POST-01 | Post a balanced entry between two accounts. | The entry is accepted and appears when the accounts are queried. |
| POST-02 | Post an entry whose debits and credits differ. | The entry is rejected with an error; nothing is stored. |
| POST-03 | Post an entry that names an account that does not exist. | The entry is rejected with an error; nothing is stored. |
| POST-04 | Post an entry dated in a closed period. | The entry is rejected with an error; nothing is stored. |
| POST-05 | Post a balanced entry, stop the service, start it again. | The entry is still present after the restart. |
| POST-06 | Post the same entry from two clients at the same time. | Each accepted entry is stored exactly once; the ledger still balances. |

After every rejected entry, confirm that the `ledgerd_entries_total` metric did not increase. See [Metrics](../../internals/monitoring/metrics.md).
