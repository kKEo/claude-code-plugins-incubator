# Quick start

This page takes you from an empty list to a running dashboard.

## 1. Add a target

```
pingboard add https://example.org
```

The command prints nothing when it succeeds. It only stores the URL; it does not check it yet.

## 2. Check it once

```
pingboard check
```

```
up   200   142 ms  https://example.org
```

The line shows the state, the HTTP status, the response time and the URL.

## 3. Start the dashboard

```
pingboard serve
```

```
2026-11-25 10:00:00,123 INFO listening on http://127.0.0.1:8080
```

Open <http://127.0.0.1:8080/> in a browser. The page shows a table with one row per target. pingboard checks all targets again every 60 seconds; reload the page to see new results.

Stop the dashboard with `Ctrl+C`.

## Where to go next

* [Managing the target list](targets.md) explains how to add and remove more targets.
* [Checking once](checking.md) explains how to use `pingboard check` in a script.
* [The dashboard](dashboard.md) explains how to change the port and the check interval.
