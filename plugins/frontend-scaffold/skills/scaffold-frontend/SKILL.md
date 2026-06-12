---
name: scaffold-frontend
description: "This skill should be used to scaffold a production-grade Vue 3 frontend application with shadcn/ui components, Pinia stores, and a typed API client. Triggers when the user asks to: create a frontend, scaffold a Vue app, generate a dashboard UI, build an admin panel, create a control plane UI, set up a Vue 3 project with Tailwind, generate CRUD views, scaffold frontend, create web UI, generate Vue project, or build a dashboard."
argument-hint: "[description of what the app manages, e.g. 'a dashboard for managing deployments']"
allowed-tools: ["Read", "Write", "Edit", "Bash", "Agent"]
---

Scaffold a complete Vue 3 + TypeScript + Vite frontend application using proven patterns from a production control-plane UI. The generated code is backend-agnostic — it connects to any REST API.

## Workflow

### Step 1: Gather Requirements

Ask the user (if not already clear from their prompt):

1. **Project name** — kebab-case, used for directory and package.json name
2. **Primary entity** — the main thing being managed (e.g. "deployment", "pipeline", "server"). This drives route names, store name, type names, and view names.
3. **Entity fields** — key properties to display in the list table and detail view (e.g. "name, status, region, created_at")
4. **Status enum** — lifecycle states for the entity (e.g. "pending, running, stopped, failed")
5. **API base path** — the prefix for all API calls (e.g. "/api/v1")
6. **Which views to generate** — default is all four: Login, List, Create (wizard), Detail (with tabs)
7. **Which features** — default all: WebSocket event stream, metrics polling panel, status badges, confirmation dialogs
8. **Target directory** — where to create the project (default: `./<project-name>/`)

If the user gave a natural language description (e.g. "scaffold a dashboard for managing ML pipelines"), infer sensible defaults and confirm them briefly before generating.

### Step 2: Generate Project

Create the complete project in the target directory. Use the reference files below for the exact code patterns. Adapt all domain-specific names (entity, fields, statuses, routes) to match the user's requirements.

#### File generation order:

1. **Project config** — use `references/project-config.md` for: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`
2. **App bootstrap** — use `references/app-bootstrap.md` for: `src/main.ts`, `src/App.vue`, `src/lib/utils.ts`, `src/assets/index.css`
3. **UI components** — use `references/ui-components.md` to generate ALL components in `src/components/ui/`. Generate every component listed — they are all needed.
4. **API layer** — use `references/api-client.md` for: `src/api/client.ts` (adapt the base path), `src/api/types.ts` (generate types matching user's entity and fields)
5. **Stores** — use `references/stores.md` for: `src/stores/auth.ts`, `src/stores/<entity>.ts` (adapt to user's entity with CRUD operations)
6. **Router** — use `references/router.md` for: `src/router/index.ts` (adapt routes to user's entity)
7. **Views** — use `references/views.md` for each requested view:
   - `LoginView.vue` — centered card login with token auth
   - `<Entity>ListView.vue` — table with status filter tabs, auto-refresh polling, skeleton loading
   - `Create<Entity>View.vue` — multi-step wizard with progress bar and per-step validation
   - `<Entity>DetailView.vue` — sidebar config card + actions + tabbed content area
8. **App components** — use `references/app-components.md` for:
   - `StatusBadge.vue` — maps entity status to badge variant
   - `EventStream.vue` — WebSocket log viewer (if requested)
   - `MetricsPanel.vue` — polling metrics grid (if requested)

#### Naming conventions:
- **Files**: PascalCase for Vue components, camelCase for TS modules
- **Routes**: kebab-case paths (e.g. `/deployments`, `/deployments/:id`, `/deployments/new`)
- **Types**: PascalCase interfaces (e.g. `Deployment`, `DeploymentSummary`, `DeploymentStatus`)
- **Stores**: `use<Entity>Store` pattern (e.g. `useDeploymentsStore`)

### Step 3: Install Dependencies

After generating all files, run:
```bash
cd <target-dir> && npm install
```

### Step 4: Verify Build

Run the TypeScript check and build:
```bash
cd <target-dir> && npm run build
```

Fix any type errors before reporting success.

### Step 5: Report

Tell the user:
- What was generated (file count, component count)
- How to start development: `cd <dir> && npm run dev`
- What to customize: API types, store logic, view-specific business logic
- Remind them to configure the Vite proxy target in `vite.config.ts` to point at their backend

## Key Patterns to Follow

- All UI components use `cn()` utility from `@/lib/utils` for class merging
- All components use `<script setup lang="ts">` with typed props
- Variants use `class-variance-authority` (`cva()`)
- Radix Vue primitives for Dialog, Select, Tabs, Checkbox, Label, Separator
- Pinia stores use Composition API (`defineStore('name', () => {...})`)
- API client uses a generic `request<T>()` function with bearer token auth
- Mutating requests include `Idempotency-Key` and `If-Match` (ETag) headers
- All async store functions follow loading/error/data tri-state pattern
- Views auto-refresh via `setInterval` with cleanup in `onUnmounted`
- Router guard redirects unauthenticated users to `/login`
