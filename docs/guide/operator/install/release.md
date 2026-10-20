# Releasing a new version

This page is the release procedure for one plugin. It takes ten minutes.

## Versioning

Each plugin has its own semantic version in `plugin.json`. The marketplace has no version of its own; `/plugin marketplace update` always serves the current `master`.

| Change | Bump |
|---|---|
| Fix in a skill body, agent prompt or hook script with the same behaviour | patch |
| New trigger phrases, new reference file, new optional behaviour | minor |
| Renamed skill or agent, changed output file names or locations, removed component | major |

Current versions at the time of writing: `frontend-scaffold` 0.1.0, `feature-dev-documentalist` 0.1.3, `gitbook-docs-validator` 0.1.0.

## Procedure

1. Edit `plugins/<name>/.claude-plugin/plugin.json` and bump `version`.
2. If the change affects what users type or what files appear, update the plugin README and the [user guide](../../user/everyday-use.md).
3. Run the checks in the [tester guide](../../tester/start/running.md).
4. Commit with a message that starts with the plugin name, for example `feature-dev-documentalist: 0.1.4, reuse existing feature folder`.
5. Tag the commit `<name>-v<version>` so a user can find the exact tree that shipped:

```bash
git tag feature-dev-documentalist-v0.1.4
git push origin master --tags
```

Users pick the change up with `/plugin marketplace update` followed by `/plugin update <name>`.

## Rolling back

Revert the commit on `master`; the marketplace serves whatever `master` holds. Users who already updated need `/plugin update <name>` again. Nothing a plugin wrote into user projects is affected by a rollback.
