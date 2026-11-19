# Prompting like an engineer

Write the prompt you would write in a good ticket.

- **Point at things:** `Explain the logic in @src/utils/auth.js`
- **Say what it cannot see:** constraints, history, the reason behind the task
- **Give it a check to run:** a test, a build, a linter, a screenshot
- **Ask for evidence,** not "all tests pass": the command it ran and its output

```text
The login endpoint returns 500 for emails with a plus sign.
Write a failing test in tests/auth, fix the bug, and show me
the test output before and after.
```

<small>Source: [Best practices](https://code.claude.com/docs/en/best-practices)</small>
