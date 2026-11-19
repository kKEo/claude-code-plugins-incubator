# Plan mode

Design review before the first edit.

1. Enter it: `Shift+Tab`, or start a prompt with `/plan`
2. Claude reads the code and writes a plan. It cannot edit anything
3. You read it, push back, or open it in your editor with `Ctrl+G`
4. Approve, and the work starts from an agreed design

```text
/plan migrate the session store from Redis to Postgres
```

**When to use it:** changes that touch many files, unfamiliar code, anything where a wrong approach costs more than five minutes.

<small>Source: [Permission modes](https://code.claude.com/docs/en/permission-modes)</small>
