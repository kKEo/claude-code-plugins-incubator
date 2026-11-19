# Basic: Claude in a pipeline

```bash
git log --oneline -20 | claude -p "summarize these recent commits"

cat build-error.txt | claude -p 'concisely explain the root cause of this build error'

tail -200 app.log | claude -p "Slack me if you see any anomalies"
```

A read-only job for CI, with nothing allowed beyond reading:

```bash
claude --bare -p "Summarize README.md" --allowedTools "Read"
```

- Text in, text out: it composes with `grep`, `jq`, `xargs` and cron
- Add `--output-format json` when a script consumes the answer

<small>Source: [Headless mode](https://code.claude.com/docs/en/headless), [Common workflows](https://code.claude.com/docs/en/common-workflows)</small>
