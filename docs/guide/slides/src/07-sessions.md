# Sessions and checkpoints

**Sessions** are saved locally and can be resumed:

```bash
claude -c          # continue the most recent session in this directory
claude -r          # pick a previous session to resume
```

**Checkpoints** snapshot each file before Claude edits it:

- Press `Esc` twice (or `/rewind`) to go back
- Separate from git, and they cover **file edits only**
- A database migration, a deploy or a `git push` cannot be rewound

Each new session starts with a fresh context window: what must persist belongs in `CLAUDE.md`.

<small>Source: [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)</small>
