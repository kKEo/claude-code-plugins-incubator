# Trust and privacy

This page says what pingboard reads and writes on your computer, what it sends over the network and what it never does. Everything here is taken from the code.

## What it stores

pingboard stores one thing: your list of targets. It is a single small file called `targets.json`, in a folder named `.pingboard` in your home folder.

It does not store results. What the dashboard shows is kept only while `pingboard serve` is running and is gone when you stop it. There is no history of past checks.

## What it sends

For every check, pingboard sends one ordinary page request to each target, the same kind your browser sends when you open the address. The request says that it comes from a program called `pingboard`.

That is all it sends. pingboard does not report to its makers, does not check for updates and contains no usage tracking.

## What the websites you watch can see

Each target receives a request from your computer on every check, once a minute unless you change it. Its owner can see those requests in their records, including your network address and the name `pingboard`. Watch only addresses you are allowed to request this often.

## Who can see your dashboard

Out of the box, only someone using your computer. The dashboard is not reachable from other computers unless the person who runs pingboard changes that.

The dashboard has no password. If it is opened up to other computers, everyone who can reach it can see your list of targets and their state.

## What "up" does and does not mean

`up` means: the last time pingboard asked, the website answered without an error. It does not mean that the page shows the right content, that logging in works, or that the website is reachable from other places than your computer.

## What you can rely on

- Your list is saved the moment you add or remove a target, and it is still there after a restart.
- A change to the list never leaves a half-written file behind.
- pingboard changes nothing on the websites it watches. It only reads.

The operator guide has the exact details in [System overview](../operator/intro/overview.md).
