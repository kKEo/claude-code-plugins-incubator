# pingboard Operator Guide

This guide is for people who run pingboard as a long-lived service for a team: on a server, in a container or under a process supervisor. It assumes that you know your operating system, its service manager and basic HTTP.

If you only want to try pingboard on your own machine, the user guide is the shorter path.

## pingboard at a glance

| Property | Value |
| --- | --- |
| Runtime | Python 3.9 or later, standard library only |
| Process model | One process: one HTTP server (a thread per request) and one background thread that runs the checks |
| State | One JSON file with the target list. Check results live in memory only |
| Configuration | Environment variables, read once at start |
| Network, inbound | One TCP port, plain HTTP, `127.0.0.1:8080` by default |
| Network, outbound | GET requests to every target |
| Logs | Standard error |
| Version described here | 0.6.0 |

## How the service works

```
            pingboard add / remove
                     |
                     v
              targets.json  <---- read at the start of every round
                     |
                     v
   +-------------------------------------+
   | pingboard serve                     |
   |                                     |
   |  check loop ---> results (memory)   | ---> GET requests to the targets
   |                       |             |
   |  HTTP server <--------+             | <--- /, /api/status, /healthz, /metrics
   +-------------------------------------+
```

The check loop reads the target list, checks the targets one after another, stores the latest result of each and then sleeps for the configured interval. The HTTP server answers from the stored results; a request to the server never triggers a check.

## What is in this guide

| Page | Content |
| --- | --- |
| [Deployment](deployment.md) | Installing the service and keeping it running |
| [Configuration](configuration.md) | Every setting, with defaults and limits |
| [The data file](data.md) | Format, permissions, backup and restore |
| [HTTP endpoints](endpoints.md) | The four routes and their responses |
| [Monitoring and logs](monitoring.md) | Health checks, metrics, alerts and log lines |
| [Security](security.md) | What pingboard does not protect and how to protect it |
| [Upgrading](upgrading.md) | Moving to a new version and rolling back |
| [Troubleshooting](troubleshooting.md) | Symptoms, causes and fixes |

## What pingboard does not provide

Know these limits before you plan a deployment:

* No authentication, no authorisation and no TLS.
* No history. A restart loses all results; the first round after the start fills them again.
* No notifications. pingboard exposes state; alerting is the job of your monitoring system.
* No high availability. Two instances do not coordinate.
* No container image, service unit or package is shipped. The examples in this guide are starting points that you maintain yourself.
