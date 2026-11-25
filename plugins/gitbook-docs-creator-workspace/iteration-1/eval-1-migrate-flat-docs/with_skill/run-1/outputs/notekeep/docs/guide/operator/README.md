# notekeep operator guide

This guide is for the people who install, configure, develop and run notekeep. It assumes you are comfortable with a terminal.

notekeep is one Python file, `notekeep.py`, that needs only `python3`. Started with `serve`,
it is a single process that answers a small JSON API on one port and keeps every note in one
SQLite file. The same file is the command line tool that lists, prints and exports notes on
the host.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand the parts of the system and how they fit together |
| [II. Install and deploy](install/README.md) | Install, run under systemd, upgrade or remove |
| [III. Configuration reference](config/README.md) | Look up a setting, a command or an API request |
| [IV. Monitoring](monitoring/README.md) | See what the system is doing and be told when it breaks |
| [V. Operations](operations/README.md) | Troubleshoot, back up, restore or compact the database |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown as you type them, from the directory that holds `notekeep.py`.
- Examples use the default port `7070`, the token `change-me` and the database
  `/var/lib/notekeep/notes.db`. Replace them with your own values.
- Names in `code style` are spelled exactly as in the code.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [tester guide](../tester/) explains how every change is checked.
