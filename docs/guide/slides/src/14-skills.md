# Skills

A folder with a `SKILL.md`: frontmatter plus instructions.

```markdown
---
name: release-notes
description: Drafts release notes from the commits since the last tag.
---
1. Run `git describe --tags --abbrev=0` to find the last tag.
2. Group the commits since then into Features, Fixes, Internal.
3. Write the result to CHANGELOG.md under a new heading.
```

- Claude loads it **when the description matches the task**, or you type `/release-notes`
- Only the description costs context; the body loads on use
- Personal: `~/.claude/skills/<name>/SKILL.md`. Project: `.claude/skills/<name>/SKILL.md`
- `disable-model-invocation: true` for procedures with side effects, such as a deploy

<small>Source: [Skills](https://code.claude.com/docs/en/skills)</small>
