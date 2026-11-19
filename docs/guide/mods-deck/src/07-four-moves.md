# The four moves

Every hook has the same shape, `($, e, next)`. What it does with `next` decides what happens to the event.

![The four things a hook can do: pass, return next(e) and the call goes on unchanged; rewrite, call next with a changed input so everything beneath sees your version; answer, return a deny or a result without calling next so nothing beneath runs; react, await next(e), act on the result, then return it](../operator/images/four-moves.svg)

<small>Source: [Hook into events](https://code.claude.com/docs/en/plugins/mods/events), [The hook chain](../operator/mods/hook-chain.html)</small>
