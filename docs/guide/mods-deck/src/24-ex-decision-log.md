# Intermediate: decision-log

Everything together: a tool the model calls, a slash command you type, a pane that lists, and a store that remembers tomorrow.

![How the decision-log example works. At session start the mod registers a tool and a command and loads the decisions kept by earlier sessions. When the model chooses between options it calls the tool with what was decided and why. The mod's tool.run hook answers with a result the model reads, writes session state so the pane is drawn again, and writes the store so the list survives the session. The interface shows the Decisions pane](../operator/images/example-decision-log.svg)

<small>Full source: [decision-log](../operator/mods/example-decision-log.html), 79 lines</small>
