# This repo: instances-monitor

The smallest real mod, 123 lines: a timer, one `ps` call and a pane. Read this one first.

![How instances-monitor works: every three seconds the mod lists the session files Claude Code keeps, checks with one ps call which processes are alive and reads their CPU and memory, and draws the result in the pane](../user/images/how-instances-monitor.svg)

<small>More: [instances-monitor](../user/plugins/instances-monitor.html). Source: `plugins/instances-monitor/hooks/register.tsx`</small>
