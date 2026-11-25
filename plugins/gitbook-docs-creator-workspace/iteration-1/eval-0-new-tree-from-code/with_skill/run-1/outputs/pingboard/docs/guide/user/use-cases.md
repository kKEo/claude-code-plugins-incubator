# Use cases

This page describes situations in which pingboard is a good fit, and a few in which it is not, so you can tell quickly whether it is the right tool. The situations follow from what pingboard can do; they are examples, not reports from particular teams.

## A few sites to keep an eye on

You look after a handful of web pages and want one place that says whether they all work.

Add each address once, start the dashboard, and keep the page open in a browser tab. A glance tells you which targets are `up` and which are `DOWN`.

Start with the [quick start](quick-start.md).

## A quick answer before or after a change

You are about to change something, or you just did, and you want to know right away whether everything still answers.

Run `pingboard check`. It visits every target once and prints one line for each. You do not need the dashboard for this.

[Everyday use](everyday-use.md#check-everything-right-now) shows what the lines mean.

## A check inside a script

Someone on your team has a script that should stop when a website is down.

`pingboard check` can be used as a yes-or-no question by other programs: it reports success only when every target is up. The person who writes the script will find the details in the [operator guide](../operator/config/commands.md#check).

## A feed for the monitoring your team already has

Your team already has a system that collects measurements and raises alarms, and wants "is this website up" in it.

While the dashboard runs, pingboard also offers its results in forms that other programs can read. Your operator can connect the two; see [Metrics and logs](../operator/monitoring/signals.md).

## When pingboard is not the right tool

- **You want to be told when something breaks.** pingboard sends no messages. It needs a person looking, or another system that reads its results.
- **You want to know what happened in the past.** pingboard keeps only the latest result.
- **You want to test what a page does.** pingboard only asks whether the website answers; it does not log in, click or read the page.
