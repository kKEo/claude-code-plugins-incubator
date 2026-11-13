# frontend-scaffold

Builds a complete, ready-to-run Vue 3 web application from a description such as "a dashboard for managing deployments". The result is a folder with a login page, a list page with filters, a multi-step create form and a detail page, plus the small building blocks (buttons, tables, dialogs) they are made of. The generated application talks to any REST API; you point it at your own backend afterwards.

![Workflow of frontend-scaffold: you describe the app, the skill clarifies and generates the project, the validator agent checks it on request](../images/workflow-frontend-scaffold.svg)

## What to type

Describe what the application manages, and name the states it goes through if you know them:

```
Scaffold a Vue 3 dashboard for managing ML pipelines with statuses: queued, running, completed, failed
Validate the frontend project at ./my-dashboard
```

The second line checks a project that already exists, for example after you changed it. You can also call the skill directly with `/frontend-scaffold:scaffold-frontend` followed by a description.

## How it works

![How frontend-scaffold works: you describe the app, the skill clarifies, generates the project folder in a fixed order and builds it; on request the frontend-validator agent reads and builds the project](../images/how-frontend-scaffold.svg)

The numbers match the picture.

1. **Clarify.** The skill confirms the project name, the main object and its fields, the statuses, the API path and the target folder.
2. **Generate.** It writes the project in a fixed order, following eight pattern references: configuration, bootstrap, UI components, the API layer, stores, router and views.
3. **Install and build.** It runs `npm install` and `npm run build`, and fixes type errors before it reports back.
4. **Check, on request.** The `frontend-validator` agent reads a generated project and reports on structure, patterns, types, security and accessibility, and builds it.

## Details

It also includes a checker that reads a generated project and reports whether it still follows the expected patterns, whether it compiles, and whether basic security and accessibility rules hold.

## What it reads and writes

It writes a new project folder and runs `npm install`, which fetches packages from the npm registry, and `npm run build` inside it. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install frontend-scaffold@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
