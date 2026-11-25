# Further reading

This page points at the documents this guide summarises.

## Claude Code

- Plugins: <https://docs.claude.com/en/docs/claude-code/plugins>
- Plugin marketplaces: <https://docs.claude.com/en/docs/claude-code/plugin-marketplaces>
- Skills: <https://docs.claude.com/en/docs/claude-code/skills>
- Subagents: <https://docs.claude.com/en/docs/claude-code/sub-agents>
- Hooks reference: <https://docs.claude.com/en/docs/claude-code/hooks>

## Mods

- The API declarations: `<mod>/.claude-plugin/types/claude-code/index.d.ts`, written by Claude Code beside a mod it loads from a watched folder. Every event, every `$` call and every element, with doc comments and examples, for exactly the build you run.
- The `plugin-authoring` skill bundled with Claude Code: ask Claude to make or change a mod and it loads the skill, with a long-form reference and complete example modules.
- `claude plugin validate --help` and `claude plugin test --help`.
- The shipped mods, shortest first: [instances-monitor](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/instances-monitor/hooks/register.tsx), [plan-progress](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/plan-progress/hooks/register.tsx), [prompt-coach](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/prompt-coach/hooks/register.tsx), [session-cost](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/session-cost/hooks/register.tsx).

## In this repository

- [CONTRIBUTING.md](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/CONTRIBUTING.md): submission rules. Note that its clone-based install flow predates the marketplace manifest.
- [The documentation template](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/gitbook-docs-validator/skills/gitbook-docs-validator/references/template.md): every rule with its reason.
- [template.json](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/gitbook-docs-validator/skills/gitbook-docs-validator/assets/template.json): roles, aliases, required pages.
- [Documentalist slides](https://github.com/kKEo/claude-code-plugins-incubator/blob/master/plugins/feature-dev-documentalist/slides.md): a presentation of the plugin and a critique of its design.
- [Eval iteration 1](https://github.com/kKEo/claude-code-plugins-incubator/tree/master/plugins/gitbook-docs-validator-workspace/iteration-1): benchmark results for the validator skill with and without the skill loaded.

## Other guides on this site

- [User guide](../../user/): what each plugin does and what to type.
- [Tester guide](../../tester/): how every change is checked.
