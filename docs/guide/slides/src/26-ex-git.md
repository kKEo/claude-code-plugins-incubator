# Basic: git without the typing

```text
create a new branch called feature/quickstart

commit my changes with a descriptive message

open a pull request and summarize what changed and why
```

Keep the risky step behind a prompt, and let the safe ones through:

```json
{ "permissions": {
    "allow": ["Bash(git add *)", "Bash(git commit *)"],
    "ask":   ["Bash(git push *)"]
} }
```

<small>Source: [Quickstart](https://code.claude.com/docs/en/quickstart), [Permissions](https://code.claude.com/docs/en/permissions)</small>
