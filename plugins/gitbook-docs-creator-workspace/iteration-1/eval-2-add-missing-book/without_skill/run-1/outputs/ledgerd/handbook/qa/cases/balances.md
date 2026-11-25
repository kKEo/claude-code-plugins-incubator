# Balances and queries

| ID | Steps | Expected result |
|---|---|---|
| BAL-01 | Query the balance of an account with no entries. | The balance is zero. |
| BAL-02 | Post three entries to an account, then query its balance. | The balance equals the sum of the three entries. |
| BAL-03 | Query a balance and ask for the entries behind it. | The entries listed add up to the balance shown. |
| BAL-04 | After any sequence of posted entries, total all accounts. | Total debits equal total credits. |
| BAL-05 | Query a balance, restart the service, query it again. | Both answers are identical. |
| BAL-06 | Query the balance of an account that does not exist. | An error is returned, not a zero balance. |

`BAL-04` is the invariant of the whole ledger. Run it last in every test session, whatever else was tested.
