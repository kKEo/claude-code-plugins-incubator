# How a drawing stays current

A render hook is not polled. It runs again when a value it **read while drawing** changes. The read is the subscription.

![How a write to session state redraws the interface: something happens, a tool call, a timer or a button press; a handler writes with update; the host stores the value under a new version and looks up the sites that read it; those sites draw again and their read subscribes them once more](../operator/images/state-loop.svg)

<small>If you know React or signals, this is the same loop. Source: [Build an interface](https://code.claude.com/docs/en/plugins/mods/interface)</small>
