# ledgerd QA handbook

This guide is for the people who test ledgerd: it describes what must be checked before a change is accepted and before a release goes out. It is written for readers comfortable with a terminal; no knowledge of the code is needed.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. Test strategy](strategy/README.md) | Understand what is tested, at which level, and in what environment |
| [II. Test cases](cases/README.md) | Run or review the checks for posting, balances, and backup and restore |
| [III. Release checks](release/README.md) | Sign off a release or report a defect |
| [Appendix](appendix/README.md) | Look up a word |

## Conventions

- Commands are shown as `ledgerd <command>`.
- Each test case has an identifier such as `POST-01`. Quote it in defect reports.
- Always test against a scratch `LEDGERD_HOME`, never against a ledger that holds real data.

> **New to ledgerd?** Start with [getting started](../getting-started/). How it works inside, and every setting, is in the [internals handbook](../internals/).
