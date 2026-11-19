# The hook chain

The one idea everything rests on. An event's input travels inward through every hook to the engine's own behaviour; the result travels back out.

![The hook chain: the engine raises an event; its input travels inward through five tiers, prepend, user, append, builtin and core, each link calling next; the result travels back out the same way; mods you install sit in the user tier](../operator/images/hook-chain.svg)

<small>Think of HTTP middleware: `next` is the rest of the stack. Source: [Hook into events](https://code.claude.com/docs/en/plugins/mods/events)</small>
