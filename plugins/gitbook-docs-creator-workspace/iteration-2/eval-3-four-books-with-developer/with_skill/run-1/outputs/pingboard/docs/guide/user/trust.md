# Trust and privacy

This page says what pingboard stores, what it sends over the network, who can see your dashboard, and what you can and cannot rely on. Everything here is taken from the code.

## What it stores

pingboard keeps one small file on your computer: the list of addresses you asked it to watch. By default it is `targets.json` in a folder named `.pingboard` in your home folder. It contains the addresses and nothing else.

Results are not stored. The dashboard remembers only the latest result of each address, and only while it runs. When you stop it, the results are gone, and there is no history of past checks.

## What it sends

For every check, pingboard asks the address for its page, the way a browser would, and introduces itself as `pingboard`. The website's owner can see these requests in their own records, as with any visitor. pingboard looks only at whether and how the website answered; it does not keep the page.

That is all that leaves your computer. pingboard does not report usage, does not look for updates and does not contact anyone except the addresses in your list.

## Who can see the dashboard

Out of the box, the dashboard can be opened only from the computer pingboard runs on. It has no password. If someone changes the settings to make it reachable from other computers, everyone who can reach it can see your list of addresses and their state. The operator guide's [Install](../operator/install/install.md) chapter explains the safe way to share it.

## What "up" means, and what it does not

An address counts as up when it answers within five seconds and the answer is not an error. This tells you the website is reachable from your computer. It does not tell you that:

- the page shows the right content;
- the website works for people elsewhere;
- the website was up between two checks. Checks happen about once a minute.

## What pingboard does not do

- It does not send alerts. You see a problem when you look at the dashboard or run a check. An operator can connect it to a monitoring system; see [Metrics and logs](../operator/monitoring/signals.md).
- It does not check anything while the dashboard is not running, unless you run `pingboard check` yourself.
