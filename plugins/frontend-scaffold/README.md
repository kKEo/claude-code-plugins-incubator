# frontend-scaffold

A Claude Code plugin that scaffolds production-grade Vue 3 frontend applications with shadcn/ui patterns, Pinia stores, and a typed API client. Backend-agnostic — connects to any REST API.

## Features

- **Complete Vue 3 + TypeScript + Vite project** — ready to run with `npm run dev`
- **25 shadcn/ui-style components** — Button, Card, Table, Dialog, Tabs, Select, Badge, Alert, Progress, Skeleton, and more
- **Pinia stores** — auth store with token persistence + CRUD entity store with ETag concurrency
- **Typed API client** — fetch-based with bearer auth, idempotency keys, WebSocket support
- **4 view patterns** — Login, List (table + filters + polling), Create (multi-step wizard), Detail (sidebar + tabs)
- **Vue Router** — auth guards, lazy loading, catch-all redirect

## Components

### Skill: `scaffold-frontend`

Invoke with `/frontend-scaffold:scaffold-frontend` or describe what you need:

> "Scaffold a Vue dashboard for managing ML pipelines with statuses: queued, running, completed, failed"

The skill asks clarifying questions (or infers from your description), then generates the complete project.

### Agent: `frontend-validator`

Validates scaffolded projects for:
- Pattern conformance (shadcn/ui, Pinia, API client conventions)
- TypeScript correctness
- Security best practices
- Accessibility
- Build verification

## Installation

```bash
# Already installed globally at ~/.claude/plugins/frontend-scaffold/
# Reload to activate:
/reload-plugins
```

## Usage

1. Ask Claude to scaffold a frontend:
   ```
   Scaffold a Vue 3 dashboard for managing deployments
   ```

2. After generation, validate:
   ```
   Validate the frontend project at ./my-dashboard
   ```

3. Start development:
   ```bash
   cd my-dashboard && npm run dev
   ```

4. Customize:
   - Update `src/api/types.ts` with your actual API types
   - Update `src/api/client.ts` endpoint functions
   - Configure the Vite proxy in `vite.config.ts` to point at your backend
