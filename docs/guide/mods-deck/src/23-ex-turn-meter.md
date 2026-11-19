# Intermediate: turn-meter

State and a drawing: three events write session state, and a band above the prompt reads it, so it redraws by itself.

![How the turn-meter example works. Three engine events feed it: turn.start resets the tool counter, tool.call counts one and passes it on, turn.complete reads the duration. The mod writes the result to session state, the band's render hook reads it and is redrawn on a write, and a toast appears when the turn was slow. The interface shows a row above the prompt with a Hide button whose press writes a flag](../operator/images/example-turn-meter.svg)

<small>Full source: [turn-meter](../operator/mods/example-turn-meter.html), 64 lines</small>
