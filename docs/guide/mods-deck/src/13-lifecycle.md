# The life of a mod

`register` only adds hooks. Setup belongs in `session.start`, which is awaited before the first prompt.

![The life of a mod inside one session: at load the engine compiles the module and runs register once; session.start is awaited before the first prompt, then each event runs your hook with its own time budget, and timers keep work alive between events; when you save a file a fresh copy loads, state and store stay, module variables and timers are gone; session.end gives one short chance to save](../operator/images/mod-lifecycle.svg)

<small>Source: [State, lifecycle and reloads](../operator/mods/state-lifecycle.html)</small>
