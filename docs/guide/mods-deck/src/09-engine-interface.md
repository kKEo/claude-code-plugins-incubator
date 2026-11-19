# The engine interface

The module has no `fs`, no `fetch`, no `process`. Everything outside it is reached through one object, `$`.

![The engine interface grouped by what it reaches: draw with ui, theme and audio; remember with state and store; time with clock; reach outside with fs, process, http, mcp and env; the model and the session with model, prompt, session and agent; extend with tool and command; every call is itself an event](images/engine-interface.svg)

<small>Source: [Mods API](https://code.claude.com/docs/en/plugins/mods/api), [Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)</small>
