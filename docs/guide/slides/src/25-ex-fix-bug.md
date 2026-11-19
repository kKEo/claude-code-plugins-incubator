# Basic: fix a bug with a check

Straight from the shell, with the verification built into the request:

```bash
claude "write tests for the auth module, run them, and fix any failures"
```

Or in a session, test-first:

```text
Users with a plus sign in their email cannot log in.
Reproduce it with a failing test, fix the cause, and show me
the test output before and after.
```

- The test is what closes the loop: gather, act, **verify**
- Not happy with the direction? `Esc` twice rewinds the file edits

<small>Source: [Overview](https://code.claude.com/docs/en/overview)</small>
