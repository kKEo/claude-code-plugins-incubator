# notekeep operator guide

This guide is for the people who install, configure and run notekeep. It assumes you are comfortable with a terminal.

notekeep is one Python script, `notekeep.py`, that runs as a single process. It serves a JSON
API over plain HTTP and keeps every note in one SQLite database file. It uses only the Python
standard library, so there is nothing to install besides Python, and it talks to no other
service.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand the process, the database file and how a request is handled |
| [II. Install and deploy](install/README.md) | Install, run under systemd, upgrade or remove |
| [III. Configuration reference](config/README.md) | Look up a setting, a command or an API endpoint |
| [IV. Monitoring](monitoring/README.md) | Probe the health check and read the request log |
| [V. Operations](operations/README.md) | Back up, restore, compact or troubleshoot |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown in `bash` blocks and are run from the directory that holds `notekeep.py`,
  unless the text says otherwise.
- Examples use port `7070`, the default. Replace it when you set `NOTEKEEP_PORT`.
- "The database" always means the SQLite file named by `NOTEKEEP_DB`.
- Names in backticks are spelled exactly as in the code.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [tester guide](../tester/) explains how every change is checked.
