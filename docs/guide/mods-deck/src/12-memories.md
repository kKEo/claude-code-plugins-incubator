# Three places to keep a value

Choose by how long the value must live. A module variable is gone at the next hot reload, with no warning.

![Three places a mod can keep a value and how long each lasts: a module variable lasts until the next hot reload; a value in $.state survives reloads, lasts until the session ends and is what a drawing reads; a value in $.store lasts across sessions and holds up to 4 MiB of JSON per mod](../operator/images/three-memories.svg)

<small>Source: [State, lifecycle and reloads](../operator/mods/state-lifecycle.html)</small>
