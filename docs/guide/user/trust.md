# Trust and privacy

This page says what each plugin reads, what it writes and what it runs without being asked, so you know what you can rely on.

## What runs on its own

Only one thing happens without a prompt. **feature-dev-documentalist** registers a small script that runs at the end of each Claude turn. The script asks git for the branch name and whether there are uncommitted changes, and looks for a folder under `docs/features/`. If you are on a feature branch with changes and no folder, it adds a one-line tip to the conversation. It does not read file contents, write files or send anything anywhere. On `main`, `master`, `develop`, `development` and `trunk` it does nothing.

The other two plugins only act when you ask.

## What is written to disk

| Plugin | Writes |
|---|---|
| frontend-scaffold | A new project folder at the location you choose (default: a folder named after the project in the current directory). It also runs `npm install` and `npm run build` there. |
| feature-dev-documentalist | Markdown files under `docs/features/<date>-<branch>/` in the current repository. It asks before overwriting an existing file. |
| gitbook-docs-validator | Nothing, unless you ask it to fix findings or to save a report to a file. |

## What is read

All three plugins read files in the current project through Claude, in the same way Claude reads files when you ask it a question. **gitbook-docs-validator** also runs a Python script that reads the documentation folder and, when asked, the repository's README, Makefile and workflow files.

## Where data goes

Nothing in these plugins talks to a network service of its own. Files that Claude reads are sent to the model as part of the conversation, exactly as they are when you work without plugins. The only network activity is `npm install` in a scaffolded project, which fetches packages from the npm registry.

> **Note.** The validator's Python script needs only Python 3 and its standard library. It installs nothing.
