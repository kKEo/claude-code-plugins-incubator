# GitHub Actions

The same agent, in your CI. Mention `@claude` in an issue or pull request, or give it a fixed prompt.

```yaml
on:
  issue_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, issues: write, id-token: write }
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

- Fastest setup: run `/install-github-app` inside Claude Code
- With a `prompt` input it runs unattended: review every PR, triage issues
- Only users with write access can trigger it

<small>Source: [GitHub Actions](https://code.claude.com/docs/en/github-actions)</small>
