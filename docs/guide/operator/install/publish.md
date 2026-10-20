# Publishing a plugin

This page is the checklist for adding a new plugin to the marketplace. Allow an hour for a first plugin, most of it spent on the skill description.

## 1. Create the directory

```
plugins/<plugin-name>/
├── .claude-plugin/plugin.json
├── README.md
├── LICENSE
└── skills/ | agents/ | hooks/   # at least one
```

`<plugin-name>` is kebab-case and unique in the marketplace. The same string goes into `plugin.json` `name` and into the marketplace entry.

## 2. Write the manifest

```json
{
  "name": "<plugin-name>",
  "version": "0.1.0",
  "description": "One line: what it does, for whom",
  "author": { "name": "Your Name" },
  "keywords": ["tag1", "tag2"]
}
```

See [plugin.json](../config/plugin-json.md).

## 3. Write the components

- Skill: `skills/<name>/SKILL.md` with a description that lists trigger phrases. Keep `SKILL.md` short and put bulk into `references/`, `scripts/`, `assets/`.
- Agent: `agents/<name>.md` with `<example>` blocks in the description and the narrowest `tools` list that works.
- Hook: `hooks/hooks.json` plus extensionless scripts called through `run-hook.cmd` (copy the wrapper from `feature-dev-documentalist/hooks/`).

Prefix generic skill names with the plugin name (`scaffold-frontend`, not `scaffold`) so they do not collide with other plugins.

## 4. Write the README

What it does, install line, usage examples, requirements. The [user guide](../../user/plugins.md) summarises each plugin in one paragraph; add a section for yours there and in [Everyday use](../../user/everyday-use.md).

## 5. Add the marketplace entry

In `.claude-plugin/marketplace.json`, append to `plugins`:

```json
{
  "name": "<plugin-name>",
  "description": "Same one line as the manifest",
  "source": "./plugins/<plugin-name>",
  "category": "Development"
}
```

Also add a bullet to `plugins/README.md` under the matching category.

## 6. Check it

```bash
jq empty .claude-plugin/marketplace.json
bash -n plugins/<plugin-name>/hooks/* 2>/dev/null || true
```

Install from your checkout as described in [Local development](local-dev.md) and trigger each component once. The [tester guide](../../tester/) has the full pre-merge list.

## 7. Open a pull request

Fill in `.github/pull_request_template.md`: plugin name, what it does, the checklist. Maintainers check valid JSON, required files, a clear description and the absence of anything that reads or sends data it should not.

> **Note.** `CONTRIBUTING.md` and the root README still describe an older flow where each plugin lives in its own repository and users `git clone` it into `~/.claude/plugins/`. Plugins in this marketplace live in this repository and are installed with `/plugin install`. Follow this page.
