# Deprecating a plugin

This page is the procedure for retiring a plugin without breaking the users who installed it.

## 1. Announce

Add a line at the top of the plugin README: what replaces it and the date after which it will be removed. Bump the patch version so `/plugin update` delivers the notice.

## 2. Remove from the manifest

After the date, delete the entry from `plugins` in `.claude-plugin/marketplace.json` and the bullet in `plugins/README.md`. New installs stop; existing installs keep working because Claude Code keeps its copy.

## 3. Remove the directory

In a later commit, delete `plugins/<name>/`. Keep the tag from the last release so the tree stays reachable:

```bash
git tag -l '<name>-v*'
```

## 4. Update the documentation

Remove the plugin from the [user guide](../../user/plugins.md) and from [Inside the three plugins](../intro/components.md), and run the docs check (`make docs-check`), which fails while a documented plugin no longer exists on disk.

## Files in user projects

Nothing is removed from user projects. Feature folders, scaffolded applications and reports stay where they are.
