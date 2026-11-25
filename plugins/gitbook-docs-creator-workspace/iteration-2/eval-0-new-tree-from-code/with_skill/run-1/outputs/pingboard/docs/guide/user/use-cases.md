# Use cases

This page describes four situations pingboard is built for, so you can see whether it fits yours. They follow from what the product does; they are not customer stories.

## A page that shows whether your websites are up

**Who.** Someone who looks after a handful of websites or internal pages.

**The problem.** You find out that one is down when somebody complains.

**How pingboard helps.** You add each address once and leave `pingboard serve` running. The dashboard shows every target with `up` or `DOWN` and the time the last answer took.

**What you do.** Follow the [Quick start](quick-start.md), then add the rest of your addresses as in [Everyday use](everyday-use.md).

## A quick look before you start work

**Who.** Anyone who depends on a few services being there.

**The problem.** You want to know in a few seconds whether everything answers, without keeping a page open.

**How pingboard helps.** `pingboard check` checks every target once and prints one line for each.

**What you do.** Run `pingboard check` and look for the word `DOWN`.

## A check inside a script

**Who.** Someone who writes a script that should stop when a service it needs is down.

**The problem.** The script needs a yes or no, not a page.

**How pingboard helps.** `pingboard check` tells the script whether every target was up, and `pingboard check --json` prints the results in a form programs read easily. With `--fail-fast` it stops at the first target that is down.

**What you do.** See [Commands and flags](../operator/config/commands.md) in the operator guide.

## A source for a team's monitoring

**Who.** A team that already has a monitoring system.

**The problem.** The monitoring system should know whether a list of addresses answers.

**How pingboard helps.** A running pingboard offers its results as numbers that a monitoring system can collect.

**What you do.** Ask the person who runs pingboard, and point them to [Metrics and logs](../operator/monitoring/signals.md) in the operator guide.

## When pingboard is not the right tool

- You need a message or an alarm when something goes down. pingboard shows the state; it does not notify anyone.
- You need to know how a website did last week. pingboard keeps no history.
- You need to check that a page shows the right content or that a login works. pingboard only checks that the website answers without an error.
