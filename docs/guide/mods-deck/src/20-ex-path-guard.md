# Basic: path-guard

The answer move and the rewrite move: refuse edits to protected files, soften a forced push, and fail closed.

<div class="with-code"></div>

![How the path-guard example works. The model calls Edit or Write with a file path, or Bash with a command. The mod matches the path and answers with a deny, returned without next so nothing beneath runs; for a git push it rewrites the command to use force-with-lease. The edit is refused and the model reads the reason; the softer push runs; if the guard itself breaks, its catch handler refuses the edit](../operator/images/example-path-guard.svg)

```ts
on('tool.call', { tool: 'Edit' }, ($, e, next) =>
  isProtected(e.file_path) ? { deny: 'That file is protected.' } : next(e),
).catch(($, e, next) =>
  next.called ? next(e) : { deny: 'The guard failed, so the edit is refused.' },
)
```

<small>Full source: [path-guard](../operator/mods/example-path-guard.html), 37 lines</small>
