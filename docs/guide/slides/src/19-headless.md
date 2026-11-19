# Headless mode

`claude -p` runs one prompt and exits. A Unix citizen: stdin in, stdout out, exit code set.

```bash
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"

cat build-error.txt | claude -p 'concisely explain the root cause' > output.txt

claude -p "List the TODOs in src/" --output-format json
```

- `--output-format json` returns the result, a session ID and the cost
- `--json-schema` gives you validated structured output
- `--permission-mode dontAsk` plus `--allowedTools`: nothing runs that you did not list
- `--bare` skips hooks, skills, plugins and `CLAUDE.md` for reproducible CI runs

<small>Source: [Headless mode](https://code.claude.com/docs/en/headless)</small>
