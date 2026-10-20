# Everyday use

This page lists what to type for the jobs you will do most often. Each plugin answers to ordinary sentences; the exact wording does not matter as long as the intent is clear.

## Building a web application

Ask for what the application manages, and name the states it goes through if you know them:

```
Scaffold a Vue 3 dashboard for managing ML pipelines with statuses: queued, running, completed, failed
```

Claude confirms a few choices (project name, main object, its fields, where to put the files), then generates the project, installs dependencies and builds it once to check it compiles. When it is done:

```bash
cd my-dashboard && npm run dev
```

To check a generated project later, for example after you changed it:

```
Validate the frontend project at ./my-dashboard
```

You can also call the skill directly with `/frontend-scaffold:scaffold-frontend` followed by a description.

## Documenting a feature as you build it

At the end of each phase, on your feature branch, say:

```
document this phase
```

Claude reads the changed files, decides which phase they belong to and writes the matching file. If the changes could belong to more than one phase, it asks you to choose. To skip the guess, name the phase:

```
/document-phase design
/document-phase deployment
```

The files land in `docs/features/<date>-<branch>/` as `spec.md`, `design.md`, `implementation.md`, `deployment.md` and `testing.md`. You do not have to write all five; write only the ones that matter for the feature.

When a file for that phase already exists, Claude asks before overwriting it.

## Checking documentation

Point Claude at the documentation folder, or let it find it:

```
does our documentation follow the template?
check docs/guide against the three-book layout
which pages are orphaned or unpublished?
```

Claude runs the checks and writes a report with a verdict, a list of things that must be fixed, a list of deviations to discuss and suggestions. It does not change any file unless you ask it to fix the findings.

> **Note.** Prompts that mention `SUMMARY.md`, `.gitbook.yaml`, `book.toml`, mdBook or GitBook also trigger the validator, even when you do not say "validate".
