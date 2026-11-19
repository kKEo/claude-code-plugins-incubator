# session-cost-installer

One skill that installs the [session-cost](session-cost.md) mod for you. Ask Claude to install session-cost and it checks whether the marketplace `km-plugin-registry` is added, adds it from `kKEo/claude-code-plugins-incubator` when it is not, and installs the mod, or updates it when it is already there. It then tells you the version and the one step left for you.

![Workflow of session-cost-installer: you ask, the skill checks the marketplace and what is installed, installs or updates the mod, and you reload](../images/workflow-session-cost-installer.svg)

## What to type

Ask in plain words, or use the command. The argument is where the mod is installed:

```
install session-cost
/session-cost-installer:install-session-cost
/session-cost-installer:install-session-cost project
/session-cost-installer:install-session-cost local
```

With no argument the mod is installed for you, in every project. `project` puts it into this repository's shared settings, so your team gets it too; `local` keeps it to you in this repository.

When the skill has finished, type `/reload-plugins` and then `/session-cost`. A skill cannot type slash commands, so that step is yours.

## How it works

![How session-cost-installer works: the skill checks the marketplace, checks what is installed, installs or updates the mod with the claude command line, verifies it and reports](../images/how-session-cost-installer.svg)

The numbers match the picture.

1. **Check the marketplace.** It is added when absent and refreshed when present. If the name `km-plugin-registry` points somewhere else, such as a local folder, the skill stops and tells you.
2. **Check what is installed.** If the released copy `session-cost@km-plugins` is enabled, the skill stops: two copies would draw two panes. Disable that copy and ask again.
3. **Install or update,** into the scope you named.
4. **Verify and report:** the plugin is listed and enabled, its version, and what to type next.

If a command fails, the skill shows the error and stops. It does not try another way round.

## What it reads and writes

It runs six `claude plugin` commands and nothing else: two that list, and four that add or refresh the marketplace and install or update the mod. Adding the marketplace downloads this repository from GitHub. The install is recorded in your Claude Code settings for the scope you chose. The skill opens and edits no file itself. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install session-cost-installer@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md). Once it is added you can also install the mod directly with `/plugin install session-cost@km-plugin-registry`; the skill earns its place when Claude does the setup for you.
