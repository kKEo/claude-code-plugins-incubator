# Try them

Install the four mods from this marketplace:

```text
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install instances-monitor@km-plugin-registry
/plugin install session-cost@km-plugin-registry
/reload-plugins
/instances
/session-cost
```

Or read one and run it from a clone, with live reload:

```bash
claude plugin validate plugins/instances-monitor    # what it hooks and calls
claude --plugin-dir plugins/instances-monitor       # a session with it loaded
```

<small>More: [Quick start](../user/quick-start.html) in the user guide</small>
