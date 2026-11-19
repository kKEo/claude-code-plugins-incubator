# Events over one turn

About fifty events, each with an input and a result. These are the ones most mods hook, in the order a session raises them.

![The events a mod can hook, in the order a session raises them: at session start, register and session.start; when you send a prompt, prompt.submit, prompt.compose and turn.start; while the model works, turn.step, tool.call, tool.check and tool.run; when the turn ends, session.append, turn.complete and session.end; at any time, ui.render, ui.press, ui.input, command.run and timers](../operator/images/mod-events.svg)

<small>Source: [Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)</small>
