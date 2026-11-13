# feature-dev-documentalist

Keeps a written record of a feature while you build it. When you say "document this phase", it looks at what changed in git, works out whether you are writing a specification, designing, implementing, deploying or testing, and writes the matching document into a folder named after your branch under `docs/features/`.

![Workflow of feature-dev-documentalist: a hook reminds you, you ask, the skill detects the phase and an agent writes the document](../images/workflow-feature-dev-documentalist.svg)

## What to type

At the end of each phase, on your feature branch, ask for the document. To skip the guess, name the phase:

```
document this phase
/document-phase design
/document-phase deployment
```

When a file for that phase already exists, Claude asks before overwriting it.

## How it works

![How feature-dev-documentalist works: a hook adds a tip, you ask, the skill resolves the feature folder, classifies the phase and dispatches one of five agents, which writes one file into the feature folder](../images/how-feature-dev-documentalist.svg)

The numbers match the picture.

1. **The hook reminds you.** At the end of a turn, on a feature branch with changes and no feature folder yet, it adds a one-line tip.
2. **You ask.** Say "document this phase", or name the phase.
3. **The skill resolves the folder.** It reuses a folder whose name contains the branch name, or creates `docs/features/<date>-<branch>/`.
4. **It classifies the phase** from the paths that changed, and asks you when they span several phases.
5. **It dispatches one agent,** after asking whether to overwrite a file that already exists.
6. **The agent writes one file,** after reading the phase documents already in the folder, so each document builds on the earlier ones.

## Details

It also reminds you. When you are on a feature branch with unsaved changes and no document yet, a short tip appears at the end of a Claude turn suggesting that you document before committing.

## What it reads and writes

It reads the branch name and the changed files through git, and writes only into `docs/features/<date>-<branch>/`. The reminder hook reads no file contents and writes nothing. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install feature-dev-documentalist@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
