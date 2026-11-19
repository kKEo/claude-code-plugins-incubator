---
name: install-session-cost
description: "This skill should be used to install or update the session-cost mod (the pane that lists every model request with its tokens and cost) from the kKEo/claude-code-plugins-incubator marketplace. Triggers when the user asks to: install session-cost, set up the session cost pane, add the cost plugin from the incubator, get the newest session-cost, or update session-cost to the incubator version."
argument-hint: "[user|project|local; defaults to user]"
---

Install the `session-cost` plugin from the incubator marketplace, or update it when it is already installed. Run only the commands on this page; the skill changes nothing else. The skill pre-approves no command: Claude Code asks the user before each one that their settings do not already allow, and that is expected. If the user declines one, say which step was skipped and stop.

| Fact | Value |
|---|---|
| Marketplace source | `kKEo/claude-code-plugins-incubator` (GitHub) |
| Marketplace name | `km-plugin-registry` |
| Plugin id | `session-cost@km-plugin-registry` |

## Scope

The argument is the installation scope: `user` (the default, every project of this user), `project` (this repository's shared settings) or `local` (this repository, this user only). Any other argument is an error: say which values are accepted and stop.

## Steps

1. **Check the marketplace.** Run `claude plugin marketplace list --json` and look for the entry named `km-plugin-registry`.
   - Absent: run `claude plugin marketplace add kKEo/claude-code-plugins-incubator`.
   - Present, and its `repo` or `url` names `kKEo/claude-code-plugins-incubator`: run `claude plugin marketplace update km-plugin-registry`, so the newest version is installed.
   - Present with any other source (a local path, a fork): stop and tell the user what it points at. Installing from it would not be an install from the incubator; they decide whether to remove it first.

2. **Check what is installed.** Run `claude plugin list --json` and look for two ids.
   - `session-cost@km-plugins` installed and enabled: this is the released copy of the same mod from the public marketplace. Two enabled copies draw two panes and two status lines. Stop, say so, and name the way out: `claude plugin disable session-cost@km-plugins`, then run this skill again. Do not disable it yourself.
   - `session-cost@km-plugin-registry` installed: go to step 3 and update.
   - Neither: go to step 3 and install.

3. **Install or update.**
   - Install: `claude plugin install session-cost@km-plugin-registry --scope <scope>`
   - Update: `claude plugin update session-cost@km-plugin-registry`. Note the version before and after from `claude plugin list --json`.

4. **Verify.** Run `claude plugin list --json` again and confirm `session-cost@km-plugin-registry` is there with `"enabled": true`. If the plugin is installed but disabled, say so and give `claude plugin enable session-cost@km-plugin-registry`; do not enable it yourself.

5. **Report**, in a few lines:
   - what happened: installed or updated, the version, the scope, and whether the marketplace was added;
   - what the user does next, since a skill cannot type slash commands: `/reload-plugins` to load the mod into this session, then `/session-cost` to open the pane;
   - that the options (status line, chip above the prompt, History days, cache TTL split, Stats tab) are in `/config`, under the plugin.

## When a command fails

Show the command and its error output as they are, then stop. Do not retry with other flags, clone the repository by hand, copy files into `~/.claude/plugins` or edit a settings file. The usual causes:

| Error | Cause |
|---|---|
| The marketplace cannot be cloned | No network, or no access to GitHub from this machine |
| The plugin is not found in the marketplace | The local copy of the marketplace is stale; `claude plugin marketplace update km-plugin-registry` |
| The scope is refused | `project` and `local` need the session to be inside a project folder |
