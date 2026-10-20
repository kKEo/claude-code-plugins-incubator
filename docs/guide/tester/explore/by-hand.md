# Testing by hand

This page gives one exploratory session per plugin. Each takes five to fifteen minutes and uses a throwaway directory. Run the relevant one before approving a change to that plugin.

## feature-dev-documentalist

Setup:

```bash
mkdir -p /tmp/docu && cd /tmp/docu && git init -q && git commit -q --allow-empty -m init
git checkout -q -b feature/widgets
mkdir src && echo 'export const a = 1' > src/a.ts
```

1. Open Claude Code in `/tmp/docu`, send `hello`, wait for the turn to end. **Expect** the tip about uncommitted changes and `/document-phase`.
2. Type `document this phase`. **Expect** the skill to classify the change as Implementation without asking, create `docs/features/<today>-feature-widgets/` and write `implementation.md`.
3. Send `hello` again. **Expect** no tip (the folder now exists).
4. Add `tests/a.test.ts` and type `document this phase`. **Expect** the question which phase to document, because paths now span two categories.
5. Type `/document-phase deployment`. **Expect** `deployment.md` written without the question.
6. Type `/document-phase implementation`. **Expect** the overwrite question; answer no and confirm the file is unchanged.

Watch for: a tip on `master` (must never happen), a file written outside the feature folder, an agent inventing content that is not in the diff.

## frontend-scaffold

```bash
mkdir -p /tmp/scaf && cd /tmp/scaf
```

1. In Claude Code, type `Scaffold a Vue 3 dashboard for managing jobs with statuses queued, running, done, failed`. **Expect** a short confirmation of inferred choices, then generation, `npm install`, `npm run build`, and a report with file counts and the `npm run dev` line.
2. `cd` into the project and run `npm run build` yourself. **Expect** exit 0.
3. Type `Validate the frontend project at ./<name>`. **Expect** the `frontend-validator` agent to report structure, pattern, TypeScript, security and accessibility findings, and to not modify files.
4. Open `src/stores/jobs.ts` and `src/router/index.ts`. **Expect** the entity name adapted everywhere (no leftover "deployment" from the reference files).

Watch for: components missing from `src/components/ui/` (the reference lists 25), a router without the auth guard, a store without the loading/error/data pattern.

## gitbook-docs-validator

```bash
cp -r plugins/gitbook-docs-validator/skills/gitbook-docs-validator/evals/fixtures/broken-docs /tmp/broken
```

1. Type `review the docs under /tmp/broken/docs/guide before we publish`. **Expect** a FAIL verdict and all nine faults from [Fixtures and seeded faults](../contributing/fixtures.md) with file paths, grouped into structural failures, deviations, suggestions, not checked.
2. Type `does /tmp/broken/docs/guide have any orphaned pages?`. **Expect** the skill to trigger on "orphaned" and name `user/orphan-page.md`.
3. Fix one fault by hand (add the glossary page and list it) and ask again. **Expect** eight errors.
4. Type `check docs/guide in this repository`. **Expect** PASS with `--repo-root` checks included.

Watch for: errors invented that the script did not report, bash `# comment` lines counted as H1s, the skill editing files without being asked.

## Recording what you found

A finding from a session goes into a GitHub issue with the exact prompt, the expected and the observed behaviour. If it is a validator miss, also add a seeded fault per [Adding tests](../contributing/adding-tests.md).
