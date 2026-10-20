# Pull-request checklist

This page is the list a reviewer walks before approving, derived from `.github/pull_request_template.md` and extended with the checks that have no CI yet.

## For any change

- [ ] `jq empty .claude-plugin/marketplace.json` passes.
- [ ] `scripts/docs-check` passes (CI runs it when `docs/**` changed; run it anyway when `plugins/**` changed, because the reconciliation step reads the plugins).
- [ ] The diff contains no credentials, tokens or absolute paths to a personal machine. Eval case 0 in `evals.json` is a known exception and is documented in [Adding tests](../contributing/adding-tests.md).

## For a new or changed plugin

- [ ] `plugins/<name>/.claude-plugin/plugin.json` has `name`, `version`, `description`, `author.name`; `name` equals the directory and the marketplace entry.
- [ ] `README.md` and `LICENSE` exist in the plugin directory.
- [ ] `version` was bumped if behaviour changed.
- [ ] Each skill description lists trigger phrases; tried one phrase in a session and the skill fired.
- [ ] Each agent has `<example>` blocks and the narrowest `tools` list that works.
- [ ] Hook scripts are extensionless, called through `run-hook.cmd`, exit 0 on every path, and `bash -n` passes.
- [ ] Ran the plugin's section of [Testing by hand](../explore/by-hand.md).
- [ ] `docs/guide/user/plugins.md`, `everyday-use.md` and `docs/guide/operator/intro/components.md` mention the plugin.

## For a change to the validator

- [ ] `broken-docs` fixture still yields exactly nine ERROR lines and exit 1.
- [ ] `renamed-layout` fixture still yields zero errors and exit 0.
- [ ] A new check has a seeded fault in a fixture that triggers it, and a line in [Fixtures and seeded faults](../contributing/fixtures.md).
- [ ] `references/template.md` explains the rule and its reason; `assets/template.json` carries any new keyword.

## For a change to the documentation

- [ ] New pages are in `SUMMARY.md`.
- [ ] Cross-book links use `../<book>/`; repository files use absolute GitHub URLs.
- [ ] The user book introduces no term that `glossary.md` does not define.
