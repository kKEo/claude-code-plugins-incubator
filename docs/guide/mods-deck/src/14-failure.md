# When a hook fails

A hook that throws or runs out of time is skipped, and the chain goes on without it. So a broken mod cannot take the session down, and a **guard fails open** unless you add `.catch`.

![What the engine does when a hook fails: without a catch handler the hook is skipped, the chain goes on and the tool runs, so the guard fails open; with a catch handler the handler is asked, gets a second of its own and can refuse, so the guard fails closed; the time budgets are ten seconds of the hook's own time per dispatch and one second for a catch handler](../operator/images/mod-failure.svg)

<small>Source: [Mods reference](https://code.claude.com/docs/en/plugins/mods/reference), [Behaviour and limitations](../operator/mods/limits.html)</small>
