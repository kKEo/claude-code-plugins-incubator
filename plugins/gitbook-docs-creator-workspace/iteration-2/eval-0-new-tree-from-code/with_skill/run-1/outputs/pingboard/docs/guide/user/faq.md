# Questions and troubleshooting

This page answers the questions people ask most often and explains the messages you may see. Each answer starts with the cause and then gives the fix.

## What does `pingboard: a target must start with http:// or https://` mean?

The address you tried to add does not start with `http://` or `https://`. Write the full address, as it appears in your browser's address bar:

```bash
pingboard add https://example.org
```

## What does `pingboard: ... is not in the list` mean?

The address you tried to remove is not written exactly as it is stored. A missing `/` at the end is enough. Run `pingboard list`, copy the address from there, and remove that.

## What does `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` mean?

You asked pingboard to check more often than every 5 seconds, which it does not allow. Use 5 or a larger number. See [Everyday use](everyday-use.md).

## Why is the dashboard empty?

Most often because the list is empty. Run `pingboard list`; if it prints nothing, add a target. If you just started `pingboard serve`, wait a few seconds and reload the page: a target shows up after its first check.

## Why does the dashboard not change?

The page does not update by itself. Reload it. pingboard checks once a minute unless you changed that, so the result can be up to about a minute old.

If reloading shows the same times for many minutes, ask the person who runs pingboard to look at the [Troubleshooting runbook](../operator/operations/troubleshooting.md).

## Why can I not open the dashboard?

Because `pingboard serve` is not running, or you are on another computer. The dashboard works only while the command runs, and out of the box only on the computer where it runs. Start `pingboard serve` and open <http://127.0.0.1:8080> on that same computer.

## Why is a website I removed still on the dashboard?

Because the dashboard keeps the last result of everything it has checked since it started. pingboard no longer checks the website. Stop `pingboard serve` with Ctrl+C and start it again to clear it.

## Why does a website show `DOWN` when it opens fine in my browser?

Usually because it answered too slowly: pingboard waits 5 seconds. Some websites also answer a program differently than a browser. Give it more time as shown in [Everyday use](everyday-use.md), or watch a simpler page of the same website.

## What does `Address already in use` mean?

Another program, perhaps a second pingboard, already uses the same number on your computer. Close the other one, or start the dashboard on another number:

```bash
pingboard serve --port 9090
```

## Does pingboard tell me when something goes down?

No. It shows the state on the dashboard and in `pingboard check`; it sends no message. See [Use cases](use-cases.md) for what it is and is not built for.

## Where is my list kept?

In one small file on your computer. [Trust and privacy](trust.md) says where, and what else pingboard does and does not store.
