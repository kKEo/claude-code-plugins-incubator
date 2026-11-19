# This repo: skill plus agents

**implementation-spec**: a skill that orchestrates two subagents.

```text
write a spec for CSV export of invoice history
```

1. The `spec-context-explorer` agent maps the repository. It writes nothing
2. The skill asks you **at most four questions**, in one batch
3. It writes `docs/specs/<date>-<slug>.md`: requirements, contracts, steps, tests
4. The `spec-readiness-reviewer` agent audits it: READY or NOT READY

Then hand it over: `Implement docs/specs/<file> exactly as written.`

The pattern to copy: **explore in a subagent, decide in the main session, review with fresh eyes.**

<small>More: [implementation-spec](../user/plugins/implementation-spec.html) in the user guide</small>
