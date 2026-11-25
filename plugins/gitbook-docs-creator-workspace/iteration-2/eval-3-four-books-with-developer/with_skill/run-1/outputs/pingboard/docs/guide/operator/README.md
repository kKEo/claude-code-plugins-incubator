# pingboard operator guide

This guide is for the people who install, configure and run pingboard. It assumes you are comfortable with a terminal.

In an operator's terms, pingboard is a single Python program without third-party dependencies. Short commands keep a list of URLs in one JSON file. One long-running process, `pingboard serve`, checks those URLs on a schedule with HTTP `GET` requests, keeps the latest result of each in memory, and serves a dashboard, a JSON status, a health check and metrics over plain HTTP. There is no database and no configuration file; settings are environment variables.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand the parts of the system and how they fit together |
| [II. Install and deploy](install/README.md) | Install, run as a service, upgrade or uninstall |
| [III. Configuration reference](config/README.md) | Look up a setting, a command, a flag or an HTTP path |
| [IV. Monitoring](monitoring/README.md) | See what the system is doing and be told when it breaks |
| [V. Operations](operations/README.md) | Troubleshoot, back up or restore |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown in `bash` blocks and are typed as the account that runs pingboard. Lines that start with `#` are comments.
- Output is shown in `text` or `json` blocks. Times, dates and durations in examples will differ on your machine.
- Examples use the default address `http://127.0.0.1:8080`; replace it when you changed `PINGBOARD_BIND` or `PINGBOARD_PORT`.
- A **target** is one URL in the list, a **check** is one request to it, and a **round** is one pass over the whole list. The [Glossary](appendix/glossary.md) has the rest.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [tester guide](../tester/) explains how every change is checked; the [developer guide](../developer/) explains how the code is organised and how to change it.
