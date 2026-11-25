# pingboard Operator Guide

This guide is for people who develop, deploy and run pingboard. It describes
how the service works inside, how to configure it and what to watch while it
runs. If you only want to use pingboard, start with the User guide.

## The service at a glance

| Property | Value |
| --- | --- |
| Version described here | 0.6.0 |
| Language | Python 3.9 or newer |
| Runtime dependencies | None; standard library only |
| Process model | One process: an HTTP server plus one background thread that runs the checks |
| Default listen address | `127.0.0.1:8080` |
| Persistent state | One JSON file with the list of targets |
| Volatile state | Latest check results and a check counter, in memory |
| Configuration | Environment variables, read once at start |
| Authentication, TLS | None; put a reverse proxy in front if you need them |
| Source | <https://github.com/example/pingboard> |
| Licence | MIT |

## What is in this guide

| Page | Content |
| --- | --- |
| [Architecture](architecture.md) | Modules, the check loop, the definition of "up" |
| [Development](development.md) | Local setup, repository layout, make targets, CI |
| [Deployment](deployment.md) | Installing and running pingboard as a service |
| [Configuration](configuration.md) | Every environment variable and command-line override |
| [HTTP endpoints](http-endpoints.md) | `/`, `/api/status`, `/metrics`, `/healthz` |
| [Monitoring](monitoring.md) | Logs, metrics and suggested alerts |
| [Data and backup](data-and-backup.md) | The targets file |
| [Security](security.md) | What pingboard does not protect and how to compensate |
| [Troubleshooting](troubleshooting.md) | Symptoms, causes and fixes |
