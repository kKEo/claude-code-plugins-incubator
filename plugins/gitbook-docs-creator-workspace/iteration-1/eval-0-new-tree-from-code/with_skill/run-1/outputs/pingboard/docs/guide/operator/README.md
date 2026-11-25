# pingboard operator guide

This guide is for the people who install, configure, develop and run pingboard. It assumes you are comfortable with a terminal.

pingboard is one Python program with no third-party dependencies at run time. `pingboard serve` starts a single process that does two things: a background thread sends a GET request to every target in turn, and an HTTP server shows the latest results as a dashboard, as JSON and as metrics. The only state on disk is the target list, one JSON file. Check results are kept in memory and are lost when the process stops. There is no database, no queue and no second service to run.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand the parts of the system and how they fit together |
| [II. Install and deploy](install/README.md) | Install, start, upgrade or remove pingboard |
| [III. Configuration reference](config/README.md) | Look up a setting, a command, a flag or an HTTP route |
| [IV. Monitoring](monitoring/README.md) | See what the system is doing and be told when it breaks |
| [V. Operations](operations/README.md) | Back up the target list, or work from a symptom to a fix |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown in `bash` blocks and are run from the root of a clone of the repository unless the text says otherwise. Lines that start with `#` are comments.
- Names in backticks, such as `PINGBOARD_INTERVAL` or `store.read`, are spelled exactly as in the code, so you can search for them.
- A **target** is one URL in the list. A **check** is one GET request to one target. A **cycle** is one pass over the whole list. The [glossary](appendix/glossary.md) has the rest.
- Paths such as `pingboard/server.py` are relative to the repository root. The source is at <https://github.com/example/pingboard>.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [tester guide](../tester/) explains how every change is checked.
