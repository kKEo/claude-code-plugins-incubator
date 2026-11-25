# Questions and troubleshooting

This page answers the questions people ask most, and explains the messages you may see when something does not work. Find the heading that matches your question or your message.

## Why does it say DOWN when the page works in my browser?

pingboard got an error from the website, or waited more than five seconds without an answer.

Run `pingboard check` and look at the number after `DOWN`:

- `0` means there was no answer in time. The website may be slow, or the computer that runs pingboard may not be able to reach it.
- `401` or `403` means the page wants you to log in. pingboard cannot log in, so such a page always shows as `DOWN`.
- `404` means the website has no page at that address. Check the address for a typing mistake.

If the website is simply slow, the person who runs your pingboard can let it wait longer; see the [operator guide](../operator/operations/troubleshooting.md).

## What does "a target must start with http:// or https://" mean?

The address you tried to add is missing its beginning. Type the whole address, including `https://`:

```bash
pingboard add https://example.org
```

## What does "is not in the list" mean?

You asked pingboard to remove an address it is not watching. The address has to match exactly, including a `/` at the end if there is one. Run `pingboard list` and copy the address from there.

## What does "PINGBOARD_INTERVAL must be at least 5 seconds" mean?

pingboard was told to wait less than five seconds between checks, which it refuses. Choose 5 or more, as in [Check more or less often](everyday-use.md#check-more-or-less-often).

## Why is the dashboard empty?

Either you have not added a target yet, or pingboard has only just started. Run `pingboard list` to see your targets, wait a few seconds and reload the page.

## Why do I not see the newest results?

The dashboard does not update by itself. Reload the page in your browser.

## Why can I not open the dashboard?

The dashboard exists only while `pingboard serve` is running. Look at the terminal where you started it:

- If the command has ended, start it again.
- If it is running, use the address from the line that ends in `listening on …`, and open it in a browser on the same computer.

## What does "Address already in use" mean?

Another program, often a pingboard you started earlier, is already using the same place on your computer. Close the other one, or start this one somewhere else and use the new address in your browser:

```bash
pingboard serve --port 9090
```

Then open `http://127.0.0.1:9090`.

## Why is a target I removed still on the dashboard?

A running dashboard keeps showing the last result of a removed target. Stop pingboard with Ctrl+C and start it again.

## What does "command not found" mean when I type pingboard?

The terminal does not know where pingboard is. If you followed the [quick start](quick-start.md), go to the `pingboard` folder and run this, then try again:

```bash
. .venv/bin/activate
```

## Does pingboard warn me when something goes down?

No. pingboard shows the state on the dashboard and in `pingboard check`, and sends no messages. [Trust and privacy](trust.md#what-pingboard-does-not-do) lists what else it does not do.

## Something else is wrong. Where do I ask?

Open an issue at <https://github.com/example/pingboard/issues> and say what you typed and what you saw.
