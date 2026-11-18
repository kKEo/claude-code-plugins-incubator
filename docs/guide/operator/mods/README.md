# Part II: Writing mods

Eight chapters take you from "what is a mod" to five working examples. Read the first four in order; they take about forty minutes. The rest is reference you return to.

- [What a mod is](what-is-a-mod.md): what is behind the word, how a mod differs from a command hook, and the files it is made of.
- [Your first mod](first-mod.md): three files, validated, loaded and tested in ten minutes.
- [The hook chain](hook-chain.md): `on(event, matcher, hook)`, the `($, e, next)` shape, and the four things a hook can do.
- [Events and the engine interface](events.md): the events worth knowing and what `$` gives you.
- [Drawing in the interface](drawing.md): panes, bands, status lines, toasts, and how a write to state redraws them.
- [State, lifecycle and reloads](state-lifecycle.md): what runs when, and where a value should live.
- [Behaviour and limitations](limits.md): time budgets, what happens when a hook fails, and what a mod cannot do.
- [Example mods](examples.md): five small mods, each built on a different mechanism, with the full source.

Everything in this part was checked against Claude Code 2.1.326. The mod API is early access: when a detail here and the declaration file disagree, the declaration file is right. [Events and the engine interface](events.md) says where that file is.
