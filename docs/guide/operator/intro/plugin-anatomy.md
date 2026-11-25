# Plugin anatomy

This page describes every file a plugin may contain and the contract each one has with Claude Code.

```
<plugin>/
├── .claude-plugin/plugin.json      # manifest (required)
├── README.md                       # user-facing documentation (required by CONTRIBUTING)
├── LICENSE                         # required by CONTRIBUTING
├── skills/<skill-name>/
│   ├── SKILL.md                    # frontmatter + instructions
│   ├── references/*.md             # optional material the skill reads on demand
│   ├── scripts/*                   # optional executables the skill runs
│   ├── assets/*                    # optional data files
│   └── evals/                      # optional eval cases and fixtures
├── agents/<agent-name>.md          # frontmatter + system prompt
├── hooks/
│   ├── hooks.json                  # event → command registration, or a mod's module
│   ├── <script>                    # the scripts a command hook calls
│   └── register.tsx                # a mod's hooks module
├── types/index.d.ts                # a mod's state contract
├── commands/*.md                   # optional slash commands
└── .mcp.json                       # optional MCP servers
```

If you have not chosen between these yet, read [Ways to extend Claude Code](extension-points.md) first.

## Manifest

`.claude-plugin/plugin.json` carries `name`, `version`, `description`, `author` and `keywords`. The `name` must equal the directory name and the `name` in the marketplace entry. Fields are listed in [plugin.json](../config/plugin-json.md).

## Skills

A skill directory is named after the skill. `SKILL.md` starts with a YAML frontmatter (`name`, `description`, optional `argument-hint` and `allowed-tools`) and continues with Markdown instructions. The description is the trigger: it is the only part Claude sees before deciding whether to use the skill, so it lists the phrases a user would say. See [Skill frontmatter](../config/skill-frontmatter.md).

Large skills keep their bulk out of `SKILL.md`. The `scaffold-frontend` skill has eight files under `references/` (code patterns the skill copies from); the `gitbook-docs-validator` skill has a Python script under `scripts/`, the template JSON under `assets/` and eval cases under `evals/`. `SKILL.md` tells Claude when to open each.

## Agents

An agent file starts with a YAML frontmatter (`name`, `description` with `<example>` blocks, `model`, `color`, `tools`) and continues with the system prompt. The `description` examples teach Claude when to dispatch the agent; the `tools` list limits what it may do. See [Agent frontmatter](../config/agent-frontmatter.md).

## Hooks

`hooks/hooks.json` maps event names to commands. Commands are shell strings; they use `${CLAUDE_PLUGIN_ROOT}` to find scripts in the plugin directory. Scripts are extensionless on purpose so that Windows auto-detection does not prepend `bash` to the command; a polyglot wrapper `run-hook.cmd` finds a bash on either platform. See [Hooks](../config/hooks.md).

## Mods

In a mod, `hooks/hooks.json` holds `{ "modules": ["./register.tsx"] }` instead of a `hooks` key. The module exports `register(on, options)` and adds function hooks to engine events. A mod that keeps session state declares it in `types/index.d.ts` and names that file under `types` in its manifest. Tests live beside the module as `*.test.ts` or `*.test.tsx`. [What a mod is](../mods/what-is-a-mod.md) describes each file's contract.

## Commands

A `commands/<name>.md` file is a slash command: a frontmatter and a prompt. gitbook-docs ships four (`structure`, `links`, `content`, `repo`), called as `/gitbook-docs:<name>`. Skills with a `name` are callable as `/<name>` too (or `/<plugin>:<name>` when the name is not unique), so most plugins need no `commands/` folder. The four mods register their slash commands from their module at session start.

## MCP servers

`.mcp.json` at the plugin root starts MCP servers that give the model tools. memors-hooks is the only shipped plugin with one.
