# Promoting to the public marketplace

This page shows how a released plugin version gets from this repository, the incubator, into the public marketplace `km-plugins` at [kKEo/claude-code-plugins](https://github.com/kKEo/claude-code-plugins). It takes five minutes once the version is tagged.

## Two repositories, one direction

| | Incubator (this repository) | Public marketplace |
|---|---|---|
| Repository | `kKEo/claude-code-plugins-incubator` | `kKEo/claude-code-plugins` |
| Marketplace name | `km-plugin-registry` | `km-plugins` |
| Holds | every plugin, experiments, the documentation | promoted plugins only |
| Changes when | any commit reaches `master` | someone runs `scripts/promote` and pushes |
| Edited by hand | yes | no |

Work flows one way. Every edit is made here; the public repository is written by `scripts/promote` and nothing else. A bug found in a published plugin is fixed here, released as a new version and promoted again. A fix made by hand in the public repository is overwritten by the next promotion, because the script replaces the whole plugin folder.

The two marketplace names differ so that both can be added to one Claude Code installation: `session-cost@km-plugin-registry` is the working copy, `session-cost@km-plugins` is what users have.

## When a plugin is ready

Promote a version when all of these hold:

- It was released as described in [Releasing a new version](release.md): the version is bumped and the commit is tagged `<name>-v<version>`.
- You have used it from the incubator in real sessions, not only in its tests.
- It has a README and a LICENSE, and its README tells a user how to install and use it.
- The [tester guide](../../tester/) checks pass.

Not every plugin has to graduate. One that stays an experiment is simply never promoted; the public `marketplace.json` is the record of what is published.

## Promote

```bash
scripts/promote session-cost --dry-run   # show what would change, write nothing
scripts/promote session-cost             # copy and stage in ../claude-code-plugins
```

`make promote PLUGIN=session-cost` does the same; pass `ARGS=--dry-run` for the first form.

The script takes the plugin from the tag, not from your working copy, so what ships is what was tagged. In order, it:

1. Reads the version from `plugins/<name>/.claude-plugin/plugin.json` and stops unless the tag `<name>-v<version>` exists.
2. Exports the tagged folder and replaces the incubator's repository and marketplace names with the public ones in every text file, so install lines and manifest URLs point at the public marketplace. It prints each file it rewrites.
3. Runs the gate on that export: a scan for strings that look like keys, `claude plugin validate --profile directory`, and `claude plugin test` when the plugin has `hooks/*.test.ts`.
4. Replaces `plugins/<name>/` in the public checkout, so a file deleted here disappears there.
5. Adds or updates the plugin's entry in the public `marketplace.json`, taking the description and category from this repository's manifest.
6. Runs the public repository's `scripts/check-marketplace`, stages the change and prints the commands that publish it.

| Option | Meaning |
|---|---|
| `--dry-run` | Run the gate and print the file and manifest differences; write nothing to the public checkout. |
| `--version X.Y.Z` | Promote that tagged version instead of the one in the working copy's `plugin.json`. |
| `--target DIR` | The public checkout. Default `../claude-code-plugins`, or `PROMOTE_TARGET` from the environment. |

## Publish

The script stops before anything leaves your machine. Read the staged change, then run the commands it printed:

```bash
cd ../claude-code-plugins
git diff --cached --stat
git commit -m "session-cost: 0.6.0"
git tag session-cost-v0.6.0
git push origin master session-cost-v0.6.0
```

Push the incubator's tag as well, so both repositories name the same release: `git push origin session-cost-v0.6.0`.

Then walk the user path once: `/plugin marketplace update km-plugins`, `/plugin update <name>`, `/reload-plugins`, and trigger the plugin.

## Rolling back

Promote the previous version again:

```bash
scripts/promote session-cost --version 0.5.0
```

The folder goes back to the tree tagged `session-cost-v0.5.0`. Commit and push; the tag already exists in the public repository, so the script leaves the tag step out. Users who took the bad version need `/plugin update <name>` again.

## Removing a published plugin

Follow [Deprecating a plugin](../operations/deprecate.md) here first. In the public checkout, delete `plugins/<name>/` and its entry in `.claude-plugin/marketplace.json`, run `scripts/check-marketplace` and commit. This is the one change made there by hand.

## Troubleshooting

| Message | Cause and fix |
|---|---|
| `tag <name>-v<version> does not exist` | The version was not released. Tag the release commit, or pass `--version` with one that was. |
| `tag ... holds version 'X' in plugin.json` | The tag was put on a commit before the version bump. Move the tag to the right commit before it is pushed, or bump and release again. |
| `the working copy differs from <tag>` | A note, not an error: you have newer commits or uncommitted edits. They are not promoted. |
| `validation failed` | `claude plugin validate plugins/<name> --profile directory` shows the same report on your working copy. Fix, release a new version, promote that. |
| `is already published; nothing to do` | The public checkout already holds exactly this tree. |
