# pingboard User Guide

pingboard checks a list of URLs on a schedule and shows which ones are up.

You give it a list of web addresses, called *targets*. pingboard requests each
target and reports whether it answered, how it answered and how long it took.
You can use it in two ways:

- **One-off check**: `pingboard check` tests every target once, prints the
  result and exits. This suits scripts and scheduled jobs.
- **Dashboard**: `pingboard serve` keeps running, checks every target again
  and again, and shows the latest results on a web page.

## When is a target "up"?

pingboard sends one HTTP `GET` request to the target. The target is **up** when
it answers with a status code below 400 within the timeout (5 seconds by
default). Redirects are followed, so the status that counts is the one of the
final page. Anything else is **DOWN**: an error status such as 404 or 500, a
timeout, a refused connection or a host name that does not resolve.

## What is in this guide

| Page | What you learn |
| --- | --- |
| [Installation](installation.md) | How to install pingboard |
| [Quick start](quick-start.md) | From nothing to a working dashboard in five minutes |
| [Managing targets](managing-targets.md) | Adding, removing and listing targets |
| [Running a one-off check](one-off-check.md) | Reading the output of `pingboard check` and using it in scripts |
| [The dashboard](dashboard.md) | Starting and reading the dashboard |
| [Command reference](command-reference.md) | Every command and option on one page |
| [Troubleshooting](troubleshooting.md) | Common problems and how to fix them |

If you run pingboard for other people, read the Operator guide as well. It
covers configuration, deployment and monitoring in detail.
