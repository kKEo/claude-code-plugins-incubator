# Questions and troubleshooting

This is the page to open when something does not work. Each section is a question or an error message as you see it, with the cause first and then the fix.

## It says "a target must start with http:// or https://"

The address you gave to `pingboard add` does not begin with `http://` or `https://`. Type the full address, as in the address bar of a browser:

```bash
pingboard add https://example.org
```

## It says the address "is not in the list"

`pingboard remove` found no address that matches exactly what you typed. Run `pingboard list` and copy the address from there. A final `/` counts: `https://example.org` and `https://example.org/` are two different addresses.

## It says "PINGBOARD_INTERVAL must be at least 5 seconds"

A setting on your computer asks pingboard to check more often than every five seconds, which it refuses. Every pingboard command stops with this message until the setting is changed. The operator guide explains [the setting](../operator/config/environment.md).

## The dashboard is empty

The dashboard shows a row only after an address has been checked for the first time. Either the list is empty, or pingboard has just started.

Run `pingboard list`. If it prints nothing, add an address. Otherwise wait a few seconds and reload the page.

## I added an address but the dashboard does not show it

The dashboard reads the list about once a minute, and the page does not refresh by itself. Wait a minute, then reload the page.

## I removed an address but the dashboard still shows it

The dashboard keeps the last result of every address it has checked. Stop it with Ctrl+C and start it again with `pingboard serve`.

## An address shows DOWN but the website works in my browser

Run `pingboard check` and look at the number after `DOWN`.

- A number of 400 or more: the website answered pingboard with an error. Some websites answer programs differently from browsers.
- The number 0: no answer arrived within five seconds, or your computer could not reach the website at all.

The operator guide's [Troubleshooting runbook](../operator/operations/troubleshooting.md#a-target-is-down-but-works-in-a-browser) goes further.

## The browser cannot open the dashboard

The dashboard works only while `pingboard serve` is running, and only in a browser on the same computer. Check that the terminal where you started it is still open and shows no error, and that the address in the browser is `http://127.0.0.1:8080/`.

## It says "Address already in use"

Another program, or a second pingboard, is already using the dashboard's address. Close the other one, or start the dashboard on another number:

```bash
pingboard serve --port 9090
```

## Does pingboard tell me when a website goes down?

No. It shows the state on the dashboard and in `pingboard check`; it sends no messages. [Trust and privacy](trust.md) lists what it does and does not do.

## Where can I ask a question or report a problem?

Open an issue at <https://github.com/example/pingboard/issues>.
