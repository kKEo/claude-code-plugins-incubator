# implementation-spec

Writes a specification for a feature that does not exist yet, complete enough to hand to an agent that will build it. Ask Claude to write a spec for a feature, or to spec it out before any code is written, and it explores the repository, asks at most four questions it cannot answer itself, and writes `docs/specs/<date>-<slug>.md`. The spec has numbered requirements, exact contracts, ordered steps, tests and a security section. A readiness reviewer then checks it before it is handed back. Running it again for the same feature updates the same file. It is the forward counterpart of feature-dev-documentalist, which documents work after the code exists.

![Workflow of implementation-spec: you request a spec, an agent explores the codebase, the skill interviews and writes, and a reviewer agent audits the result](../images/workflow-implementation-spec.svg)

## What to type

Describe the feature in a sentence or two:

```
write a spec for CSV export of invoice history
spec this out before we write any code
```

To have an agent build the result, say `Implement docs/specs/<file> exactly as written.`

## How it works

![How implementation-spec works: the skill resolves the spec path, an explorer agent maps the repository, the skill asks you up to four questions and writes the spec file, and a reviewer agent audits it before the report](../images/how-implementation-spec.svg)

The numbers match the picture.

1. **Resolve the spec path.** A second run for the same feature updates the same file.
2. **Explore.** The `spec-context-explorer` agent maps the stack, the commands, the closest precedent and code that can be reused. It writes nothing.
3. **Interview.** Claude asks you at most four questions, in one batch, and only what it cannot work out from the repository.
4. **Write the spec:** numbered requirements, exact contracts, ordered steps, tests and a security section.
5. **Review.** The `spec-readiness-reviewer` agent audits the spec and answers READY or NOT READY. It runs at most twice.
6. **Report:** how much the spec holds, which decisions were made for you, and what still needs your sign-off.

## What it reads and writes

It reads the repository and writes one file, `docs/specs/<date>-<slug>.md`. Its two agents write nothing. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install implementation-spec@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
