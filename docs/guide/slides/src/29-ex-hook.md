# Intermediate: a hook that enforces

"Run the type check before you finish" in `CLAUDE.md` is a request. This is a guarantee:

```json
{
  "hooks": {
    "Stop": [ {
      "hooks": [ {
        "type": "command",
        "command": "pnpm tsc --noEmit 1>&2 || exit 2"
      } ]
    } ]
  }
}
```

- `Stop` fires when Claude is about to end its turn
- Exit code `2` blocks the stop and hands the compiler errors back
- Claude keeps working until the type check passes

<small>Source: [Best practices](https://code.claude.com/docs/en/best-practices), [Hooks reference](https://code.claude.com/docs/en/hooks)</small>
