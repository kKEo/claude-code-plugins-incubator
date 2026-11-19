# Intermediate: ci-watch

Work with no event behind it: a timer polls CI, the status line shows the latest run, and a failure wakes the session.

![How the ci-watch example works. At session start the mod starts a timer at the configured interval. On every tick it runs gh to get the latest workflow run as JSON, pins the status line and compares the state with last time. On a new failure it raises a native notification, and with the wake option on it submits a prompt that starts a turn once the session is idle](../operator/images/example-ci-watch.svg)

<small>Full source: [ci-watch](../operator/mods/example-ci-watch.html), 57 lines</small>
