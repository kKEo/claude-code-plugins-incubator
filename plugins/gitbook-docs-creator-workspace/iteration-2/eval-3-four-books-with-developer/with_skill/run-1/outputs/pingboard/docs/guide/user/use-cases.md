# Use cases

This page describes four situations pingboard is built for, each with what you do. They follow from what the program can do; pick the one closest to yours.

## Keep an eye on a handful of websites

**Who.** Someone responsible for a few websites: their own, a club's, a small team's.

**The problem.** You find out that a site is down when somebody tells you.

**What you do.** Add each address once with `pingboard add`, leave `pingboard serve` running, and keep the dashboard open in a browser tab. A glance shows which sites are up. [Quick start](quick-start.md) sets this up.

## Check once after a change

**Who.** Someone who has just changed something: moved a site, renewed a certificate, restarted a server.

**The problem.** You want to know, now, whether everything still answers.

**What you do.** Run `pingboard check`. It checks every address in your list once, prints a line for each and ends. No dashboard is needed. See [Check everything right now](everyday-use.md#check-everything-right-now).

## Let a script decide

**Who.** Someone who runs scheduled jobs or deployment scripts.

**The problem.** A script should stop, or warn, when a site is down.

**What you do.** Call `pingboard check` from the script and use its result: status 0 when everything is up, status 1 otherwise. Add `--json` when another program reads the details. See [Use the result in a script](everyday-use.md#use-the-result-in-a-script).

## Feed a monitoring system

**Who.** A team that already has monitoring and alerting.

**The problem.** The state of the websites should appear next to everything else, and raise alerts.

**What you do.** Run the dashboard and let the monitoring system read its metrics page. This is operator work; the operator guide's [Metrics and logs](../operator/monitoring/signals.md) chapter has the details.

## When pingboard is not the right tool

pingboard checks from one computer, about once a minute, and keeps no history. If you need checks from several places, reports over time or alerts by itself, you need something more.
