# This repo: session-cost

A streaming hook on `turn.step` sees every model request. Totals go to the pane, a band, the status line and the store.

![How session-cost works: when a model request ends the mod records it, costs it from the /cost total and list prices, adds it to the totals, saves them in the plugin store and draws the pane, the status line and the chip](../user/images/how-session-cost.svg)

<small>More: [session-cost](../user/plugins/session-cost.html)</small>
