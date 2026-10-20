# Use cases

Three short stories show where each plugin earns its keep. If one of them sounds like your week, install that plugin first.

## A backend team needs an admin screen by Friday

A team has a REST API for deployments and no front-end developer. They install **frontend-scaffold** and ask for "a dashboard for managing deployments with statuses pending, running, stopped, failed". Fifteen minutes later they have a project that logs in, lists deployments with status filters that refresh on their own, creates one through a three-step form and shows one in detail. They point the proxy at their API, change two type definitions, and ship a first version that looks the same as the rest of their tooling.

## A feature took three weeks and nobody remembers why

A developer finishes a long feature branch. Halfway through, the design changed and the reason is lost. With **feature-dev-documentalist**, they would have said "document this phase" at each step. The design document would record the alternatives that were rejected, the implementation document the files that matter and the debt left behind, and the deployment document the new environment variable and the rollback plan. The reminder at the end of each turn makes it hard to forget.

## A documentation site grew without a plan

A project has a `docs/` folder that grew page by page. New readers cannot find the install page; an operator cannot find the configuration reference; nobody knows which pages are actually published. The team adopts the three-book layout and installs **gitbook-docs-validator**. The first report says which pages would move into which book and which required pages are missing. Once the books exist, the validator runs on every pull request that touches the docs, so an orphaned page or a broken link is caught before it is published.
