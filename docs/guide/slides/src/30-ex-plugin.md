# Intermediate: your first plugin

Wrap a skill so that other repositories and people can install it.

```bash
mkdir -p my-first-plugin/.claude-plugin my-first-plugin/skills/hello
```

```json
{ "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0" }
```

Save that as `.claude-plugin/plugin.json`, add `skills/hello/SKILL.md`, then:

```bash
claude plugin validate ./my-first-plugin     # ✔ Validation passed
claude --plugin-dir ./my-first-plugin        # load it for one session
```

In the session, run `/my-first-plugin:hello`. After an edit: `/reload-plugins`.

<small>Source: [Create plugins](https://code.claude.com/docs/en/plugins/create)</small>
