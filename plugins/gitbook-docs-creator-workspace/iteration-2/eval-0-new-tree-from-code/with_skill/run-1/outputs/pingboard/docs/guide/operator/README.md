# pingboard operator guide

This guide is for the people who install, configure and run pingboard. It assumes you are comfortable with a terminal.

pingboard is one Python process without dependencies outside the standard library. `pingboard serve` checks a list of URLs with HTTP GET requests on a fixed interval and serves the latest results as a dashboard, as JSON and as metrics. Its only state on disk is one JSON file with the list of URLs. It needs no database and no other service.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand the check loop, the HTTP server and the targets file |
| [II. Install and deploy](install/README.md) | Install from a checkout, run the server, upgrade or uninstall |
| [III. Configuration reference](config/README.md) | Look up a setting, a command, a file or an HTTP route |
| [IV. Monitoring](monitoring/README.md) | Read the health check, the metrics and the log, and decide what to alert on |
| [V. Operations](operations/README.md) | Fix an error, or back up and restore the list of targets |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown in `bash` blocks and are typed as shown. A line that starts with `#` is a comment or the output you should see.
- Examples use the default address, `http://127.0.0.1:8080`. Replace it when you changed `PINGBOARD_BIND` or `PINGBOARD_PORT`.
- A **target** is one URL in the list; a **cycle** is one pass over all targets. The [glossary](appendix/glossary.md) defines the other words.
- Names in backticks are spelled exactly as in the code.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction; the [tester guide](../tester/) explains how every change is checked.
