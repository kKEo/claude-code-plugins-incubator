# Trust and privacy

This page says what pingboard keeps on your computer, what it sends over the network, and what you should know before you let other people see your dashboard.

## What pingboard keeps

pingboard keeps one small file: the list of your targets. By default it is called `targets.json` and sits in a folder named `.pingboard` in your home folder. It contains the addresses you added and nothing else.

The results of the checks are not saved. pingboard remembers only the most recent result for each target, and only while it runs. When you stop it, the results are gone; your list stays.

Removing pingboard does not delete the list. Delete the file yourself if you no longer want it.

## What pingboard sends

pingboard contacts only the addresses on your list. Each check is one plain request for the page, the same kind a browser makes, and it tells the website that the visitor is called `pingboard`.

It sends nothing else. There is no account, no usage reporting and no check for updates.

Keep in mind that the websites you watch can see these visits, like any other visit, and that they happen once a minute by default.

## Who can see the dashboard

The dashboard has no password. Out of the box that is safe, because it can be opened only from the computer pingboard runs on.

It is possible to open the dashboard up to other computers. If someone does that for you, everyone who can reach it can see which addresses you watch and whether they work. Ask the person who runs your pingboard how it is set up; the [operator guide](../operator/install/install.md) explains the choice.

## What pingboard does not do

- It does not tell you when something goes down. There are no emails or other messages; you look at the dashboard or run a check.
- It does not keep a history. You cannot see whether a target was down last night.
- It does not look at what a page says. A page counts as working when the website answers without an error, even if the page is empty or shows the wrong thing.
