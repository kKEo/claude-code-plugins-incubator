# A mod in one picture

A mod is a plugin whose module runs **inside** Claude Code and puts your functions in the path of its events.

![A mod in one picture: the engine raises events such as tool.call and ui.render; your hooks module, loaded once per session, hooks them; through the engine interface a hook draws, remembers, reaches outside and asks a model](images/big-picture.svg)

<small>Source: [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview). The official name of the mechanism is "function hooks".</small>
