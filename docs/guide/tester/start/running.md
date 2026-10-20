# Running the tests

This page runs every deterministic check in the repository. The whole sequence takes about three minutes.

## Prerequisites

Python 3.8 or newer, bash, `jq`, git. Node 18+ and npm only for the scaffold smoke test in [Testing by hand](../explore/by-hand.md).

## 1. The marketplace manifest parses

```bash
jq empty .claude-plugin/marketplace.json && echo ok
for p in plugins/*/.claude-plugin/plugin.json; do jq -e '.name and .version and .description and .author.name' "$p" >/dev/null && echo "ok $p"; done
```

Expected: `ok` for the manifest and one `ok` line per plugin (three).

## 2. Manifest names match directories

```bash
jq -r '.plugins[] | "\(.name) \(.source)"' .claude-plugin/marketplace.json | while read -r name src; do
  [ "$src" = "./plugins/$name" ] && [ "$(jq -r .name "$src/.claude-plugin/plugin.json")" = "$name" ] && echo "ok $name" || echo "MISMATCH $name $src"
done
```

Expected: three `ok` lines.

## 3. Hook scripts parse

```bash
bash -n plugins/feature-dev-documentalist/hooks/check-undocumented && echo ok
bash -n plugins/feature-dev-documentalist/hooks/run-hook.cmd && echo ok
```

Expected: two `ok`. The wrapper's batch half sits inside a quoted heredoc, so `bash -n` accepts it.

## 4. The hook behaves on a clean checkout

```bash
CLAUDE_PLUGIN_ROOT=$PWD/plugins/feature-dev-documentalist \
  bash plugins/feature-dev-documentalist/hooks/check-undocumented; echo "exit $?"
```

Expected on `master` with a clean tree: no output, `exit 0`. On a feature branch with an uncommitted file, a JSON object containing `hookSpecificOutput`.

## 5. The validator script on its fixtures

```bash
V=plugins/gitbook-docs-validator/skills/gitbook-docs-validator/scripts/validate_docs.py
F=plugins/gitbook-docs-validator/skills/gitbook-docs-validator/evals/fixtures
python3 $V $F/broken-docs/docs/guide --quiet; echo "exit $?"
python3 $V $F/renamed-layout/handbook --repo-root $F/renamed-layout --quiet; echo "exit $?"
```

Expected: `broken-docs` reports nine ERROR lines and `exit 1`; `renamed-layout` reports zero errors, four warnings and `exit 0`, mapping `getting-started`, `internals`, `qa` to user, operator, tester. The exact nine faults are listed in [Fixtures and seeded faults](../contributing/fixtures.md).

## 6. The validator on this documentation

```bash
scripts/docs-check; echo "exit $?"
```

Expected: `exit 0`. This runs `validate_docs.py docs/guide --repo-root .` and the reconciliation checks described in [The documentation gate](../gates/docs-gate.md). `make docs-check` is the same thing.

## 7. Evals (optional, needs Claude Code)

The three cases in `plugins/gitbook-docs-validator/skills/gitbook-docs-validator/evals/evals.json` run through the `skill-creator` eval harness, which executes each prompt with and without the skill and grades the assertions. Case 0 points at a repository outside this one and is skipped when it is absent. Results of the last run are in `plugins/gitbook-docs-validator-workspace/iteration-1/benchmark.md`: 100% pass with the skill, 77% without.

## All at once

```bash
make docs-check && echo "docs ok"
```

covers steps 5 and 6 for this repository's docs; steps 1 to 4 are quick enough to paste.
