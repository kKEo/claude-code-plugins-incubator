# This repo: hook plugins

**memors-hooks** runs a knowledge-base loop around the agent, with nothing to type:

| Event | Hook | Effect |
|---|---|---|
| `SessionStart` | orient | Adds an index of what is already known |
| `PreToolUse` on `Bash` | guard-cli | **Denies** writes to the knowledge base from the shell |
| `PostToolUse` on `WebFetch` | check-known-source | Points at the copy already stored |
| `Stop` | nudge-remember | Reminds Claude to record what it fetched |

**feature-dev-documentalist** pairs a hook with a skill: at the end of a turn on a feature branch the hook suggests documenting, and `document this phase` writes the document from the git diff.

<small>More: [memors-hooks](../user/plugins/memors-hooks.html) and [feature-dev-documentalist](../user/plugins/feature-dev-documentalist.html) in the user guide</small>
