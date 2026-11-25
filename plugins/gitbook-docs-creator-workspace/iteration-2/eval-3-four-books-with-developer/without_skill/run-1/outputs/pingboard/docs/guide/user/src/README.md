# pingboard User Guide

pingboard checks a list of URLs and tells you which ones are up. You can use it in two ways:

* **Check once.** `pingboard check` requests every URL, prints one line per URL and exits. This fits scripts and scheduled jobs.
* **Watch continuously.** `pingboard serve` checks every URL on a schedule and shows the latest results on a small web page, the dashboard.

A URL that pingboard checks is called a **target**. A target is **up** when it answers a GET request with an HTTP status below 400 within the timeout (5 seconds unless you change it). In every other case it is **down**.

## Who this guide is for

This guide is for people who use pingboard on their own machine. It needs no knowledge of Python beyond installing a package.

* To run pingboard as a shared, long-running service, read the operator guide.
* To change pingboard itself, read the developer guide and the tester guide.

## What is in this guide

| Page | What you learn |
| --- | --- |
| [Installation](installation.md) | How to install the `pingboard` command |
| [Quick start](quick-start.md) | Your first target and your first dashboard, in five minutes |
| [Managing the target list](targets.md) | How to add, remove and list targets |
| [Checking once](checking.md) | How to read the output of `pingboard check` and use it in scripts |
| [The dashboard](dashboard.md) | How to start the dashboard and what it shows |
| [Command reference](commands.md) | Every command, option and setting |
| [Troubleshooting](troubleshooting.md) | What common error messages mean |
