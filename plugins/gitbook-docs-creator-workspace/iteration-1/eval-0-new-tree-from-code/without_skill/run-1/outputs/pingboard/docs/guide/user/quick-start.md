# Quick start

This page takes you from an installed pingboard to a working dashboard. If you
have not installed pingboard yet, follow [Installation](installation.md) first.

## 1. Add targets

    pingboard add https://example.org
    pingboard add https://example.com

A target must start with `http://` or `https://`. The commands print nothing
when they succeed.

## 2. Look at the list

    pingboard list

Output:

    https://example.com
    https://example.org

## 3. Check every target once

    pingboard check

Output:

    up   200   142 ms  https://example.com
    up   200   118 ms  https://example.org

Each line shows the state, the HTTP status code, the response time and the
target. See [Running a one-off check](one-off-check.md) for details.

## 4. Start the dashboard

    pingboard serve

Open <http://127.0.0.1:8080/> in a browser on the same machine. The page lists
each target with its state and response time. pingboard checks the targets
again every 60 seconds; reload the page to see the newest results.

Stop the dashboard with `Ctrl+C`.

## Next steps

- [Managing targets](managing-targets.md) explains how the list behaves.
- [The dashboard](dashboard.md) explains what the page shows and how to change
  the port or the check interval.
