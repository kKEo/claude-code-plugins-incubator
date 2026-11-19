# Basic: tool-count

The whole mod. It watches every tool call and pins the count under the prompt.

<div class="with-code"></div>

![How the tool-count mod works: the engine raises tool.call, your hook adds one to a counter, pins the count under the prompt and returns next(e), so the tool runs unchanged](images/tool-count.svg)

```ts
export const register: Register = on => {
  let calls = 0
  on('tool.call', ($, e, next) => {
    calls += 1
    $.ui.status(`${calls} tool calls`)
    return next(e)
  })
}
```

<small>Full walk-through: [Your first mod](../operator/mods/first-mod.html)</small>
