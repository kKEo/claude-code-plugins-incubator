---
name: write-implementation-spec
description: "This skill should be used to write an implementation-ready spec for a feature that has not been built yet, so an orchestrator agent can implement the whole thing without asking the user anything further. Use it before any code exists — it explores the codebase, asks one short batch of questions, then writes docs/specs/<date>-<slug>.md; it is not for documenting work that is already in the git diff (that is the document-phase skill). Triggers when the user asks to: write a spec for a new feature, prepare an implementation spec, spec out a feature before coding, plan a feature for an agent to build, turn this feature request into a spec, write a build plan another agent can follow, produce a handoff spec for an orchestrator, define requirements and tests before implementation, write an implementation-ready spec, or spec this out before we write any code."
argument-hint: "[the feature request in a sentence or two, e.g. 'let users export their invoice history as CSV']"
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Agent", "AskUserQuestion"]
---

Write an implementation-ready spec for a feature that does not exist yet. The spec explores the codebase first, asks only the questions it genuinely cannot answer, and lands at `docs/specs/<YYYY-MM-DD>-<slug>.md` — complete enough that an orchestrator agent can implement all of it without coming back to the user.

## Workflow

### Step 1: Capture the feature request

Use the argument if one was given. Otherwise, if the user just described a feature in the current conversation, use that. Otherwise ask in plain prose (not `AskUserQuestion` — a feature request is free text, not a choice among options) for one paragraph covering what should be possible and who it's for, and wait for the answer.

Restate the request back in one sentence to confirm you understood it, then keep the verbatim request text — it is passed to both agents below and becomes the input for the spec's `Summary` section.

### Step 2: Resolve the spec path

```bash
date +%F                        # today, e.g. 2026-09-07
git rev-parse --show-toplevel   # repo root; fall back to $PWD if not a git repo
ls -1 docs/specs 2>/dev/null    # existing specs, if any
```

Derive a slug from the request: lowercase, 2-5 content words, hyphen-separated, `a-z0-9-` only, ≤40 characters, dropping articles and filler (`a`, `the`, `add`, `support`, `for`, `we need`).

| Feature request | Slug |
|---|---|
| "let users export their invoice history as CSV" | `invoice-csv-export` |
| "add rate limiting to the public API" | `public-api-rate-limiting` |
| "we need SSO with Okta for the admin panel" | `admin-okta-sso` |

Then check for an existing spec: `Glob docs/specs/*-<slug>.md`. If a file matches, **reuse that exact path** (keep its original date in the filename) and treat this run as an update, not a new file. If none matches, the target path is `docs/specs/<YYYY-MM-DD>-<slug>.md`; create the `docs/specs/` directory if it doesn't exist yet.

### Step 3: Explore the codebase

Dispatch the `spec-context-explorer` agent once, with exactly this context block:

```
FEATURE_REQUEST: <the request, verbatim, one paragraph>
REPO_ROOT: <absolute path from git rev-parse --show-toplevel>
SPEC_PATH: docs/specs/YYYY-MM-DD-<slug>.md
EXISTING_SPEC: <yes | no>
```

The explorer writes no files; it returns a findings report. Keep the report in full — it is the source for the spec's `Existing Code To Reuse` section, most of `Contracts`, the `Files:` lines in every implementation step, the `How to run` commands, and the candidate question list for the next step.

### Step 4: Ask only what you cannot answer

A question is worth asking only if **all three** hold:

1. The explorer's report does not answer it, and it is not inferable from the closest precedent.
2. Two or more answers are genuinely plausible, **and** they lead to different files, a different data shape, or different user-visible behavior.
3. Guessing wrong would require rework, not just a rename.

**Never ask about:** the test framework, test/lint/build commands, directory layout, or naming style (read these from the explorer's report); which of two equivalent implementations the user "prefers"; anything the original request already states; a yes/no you could settle with the safest in-repo default (record that as a `Decisions` row marked `*` instead of asking).

**Always ask, if still unresolved after exploration:** the scope boundary, when the request could reasonably mean a small change or a large one; the ownership/uniqueness model of the primary new piece of data; the user-visible behavior on the main failure path, when the repo has no precedent to copy; a security decision that grants new access and has no in-repo precedent (rank these first — see the security rule below).

**Budget: at most 4 questions, asked in a single `AskUserQuestion` call.** Prefer 2-3. Zero is a good outcome — if exploration answered everything, skip this step entirely and say so in the final report. If more than four questions qualify, keep the four with the largest blast radius and settle the rest yourself as `*`-marked decisions using the safest precedent-matching default.

For each question: a short `header` (a word or two); a one-sentence `question` naming the concrete trade-off; 2-4 `options`, each with a short label and a description of what the implementation would concretely look like. Put the recommended option first and start its description with `Recommended — `. Never offer "you decide" or "not sure" as an option — the tool already accepts free text for anything else.

**Security decisions get special handling.** A decision counts as security-sensitive if it touches: authentication or authorization (who may call this, which permission check applies); secrets and credentials (a new secret, where it lives, how it's injected); data exposure (a new field, endpoint, log line, or error message that could reveal PII, tokens, or internal identifiers); a trust-boundary change (a new inbound listener, a CORS change, a new external runtime dependency, deserializing untrusted input, building shell or SQL from input); cryptography (algorithm, key length, token lifetime, randomness source); a destructive or irreversible operation (delete, a data-dropping migration, a bulk mutation, money movement); or relaxing an existing control (disabling a check, widening a scope, adding an allowlist entry).

If a security question has a strictly-safest answer that matches existing repo practice (e.g. "reuse the `requireAuth` middleware like every other route in `routes.ts`"), that is **not** a reason to halt — record it as a `Decided` row in the spec's `Security` section, citing the precedent. Only ask the user when there is no in-repo precedent to copy, or when the change grants genuinely new access. If the user answers, write it as a `Decided` row. If they decline, answer ambiguously, or a security question surfaces only after the question batch was already sent, do not ask again — write a `HALT` item with a proposed default instead (see the template below). Never leave a security-relevant change with neither a decision nor a HALT item.

### Step 5: Write the spec

Fill in the template below and write it to the resolved spec path.

Rules while filling it in:
- Omit any `Contracts` subsection this feature does not need (e.g. no `Configuration` table if it adds no config). Never leave a heading with a placeholder under it — omit the heading instead.
- Fill each requirement's `Verified by` column **last**, after the test IDs exist, so the cross-references are real rather than guessed.
- Banned in the output — if you're about to write one of these, stop and make the choice instead, recording it as a `Decisions` row: `TBD`, `TODO`, `to be confirmed`, `to be decided`, `consider`, `maybe`, `probably`, `as appropriate`, `if needed`, `either … or`, `and/or`, `we could`, `might`.
- Bias to simple: if an existing file can host the change, that *is* the design — do not create a new module, class, or directory for it. Each `Do:` bullet in an implementation step must name a concrete function, field, or call site in a concrete file, not a description of an outcome.
- Set the header's `Status:` to `Ready to implement`, or `Blocked on HALT (<ids>)` if any HALT items exist.

**If the spec file already exists — update, don't overwrite:**
1. Read it first.
2. Preserve human-authored content — prose, reordering, added requirements, decisions, or test rows a person wrote. Never delete something someone added by hand.
3. Refresh facts that changed (a requirement now implemented differently, a step whose files changed).
4. Never renumber an ID (`R3`, `T5`, `S2`, …) that is already referenced elsewhere — add new IDs at the end of their section instead.
5. Keep the original `Generated:` date in the header and append or refresh `· Updated: YYYY-MM-DD`.
6. Prefer targeted `Edit`s to the sections that changed over a full `Write`. Only use `Write` when creating the file for the first time.

#### The spec template

````markdown
# Spec: <feature name>

> Feature: `<slug>` · Status: Ready to implement · Generated: YYYY-MM-DD

## Summary

**Goal:** <one sentence — what a user can do after this ships that they cannot do today.>

**Problem:** <2-4 sentences: who is blocked today, by what, and what it costs them. No solution talk.>

**Non-goals** — explicitly not built in this change:
- <capability someone might reasonably assume is included, and is not>
- <...>

**Implementation stance:** Write direct, boring code in the files named under Implementation
Steps. Reuse the utilities under Existing Code To Reuse. Do not add abstraction layers,
interfaces, base classes, generic helpers, registries, config-driven switches, or
"for future extensibility" seams — if a step does not name it, do not build it. Every choice
in this spec is already made; implement it as written rather than re-evaluating it.

## Decisions

Every question that had more than one plausible answer is already answered. Implement the
**Chosen** column. Do not re-open the **Rejected** column.

| ID | Question | Chosen | Why | Rejected |
|---|---|---|---|---|
| D1 | <the question> | <the choice> | <one line, ideally "matches `path/to/precedent.ext`"> | <option> — <one-line reason> |
| D2 | <...> | <...> | <...> | <...> |

IDs marked `*` were decided on the requester's behalf rather than answered by them.

## Requirements

Each row is independently verifiable and is cited by ID from Implementation Steps and Tests.
One behavior per row. No adjective without a number (`fast` → `p95 under 300 ms`). No
"should" or "may" — every row is mandatory; anything optional belongs in Non-goals.

| ID | Requirement | Verified by |
|---|---|---|
| R1 | <observable outcome: "<actor> does X and the system does Y"> | T1, T6 |
| R2 | <...> | T2 |

## Existing Code To Reuse

Real paths in this repository, each verified to exist. Prefer these over writing anything new.

**Closest precedent:** `<path>` — build this feature the same way. <One line on what to copy:
layering, file placement, naming, error handling, test layout.>

| What | Path | Use it for |
|---|---|---|
| <utility / type / middleware / validator / test helper> | `path/to/file.ext:symbol` | <where in this feature it applies> |

## Contracts

Concrete shapes, copied verbatim by the implementer. Nothing here is illustrative. Omit any
subsection this feature does not add.

### Data shapes

```<language>
<exact type / struct / schema / migration DDL — field names, types, nullability, defaults,
uniqueness constraints>
```

### Entry points

| Method + path (or exported function) | Request | Success | Errors |
|---|---|---|---|
| `POST /api/v1/<thing>` | `{ "field": string }` | `201` + `{ "id": string }` | `400 invalid_payload`, `409 already_exists` |

### Error codes

| Code | Surfaced as | Raised when | Message |
|---|---|---|---|
| `invalid_payload` | HTTP 400 | <exact condition> | `<literal user-visible string>` |

### Configuration

| Name | Type | Default | Required | Read in |
|---|---|---|---|---|
| `<ENV_VAR>` | string | `<default>` | no | `path/to/config.ext` |

## Implementation Steps

Do these in order. Each step leaves the repository working.

### Step 1 — <imperative title>

- **Implements:** R1, R2
- **Files:** `path/to/new_file.ext` (new), `path/to/existing.ext` (edit)
- **Do:** <2-5 imperative bullets naming exact functions, fields, and call sites; reference the
  precedent — "mirror `path/to/precedent.ext`">
- **Done when:** <checkable without judgment — a named command exits 0, a named function exists
  and is called from a named site, a named test passes>

### Step 2 — <imperative title>

- **Implements:** R3
- **Files:** <...>
- **Do:** <...>
- **Done when:** <...>

## Tests

Add these to `<test dir>`, following `<path/to/existing/test.ext>`. Every requirement has at
least one happy-path case; every error code in Contracts has at least one error case.

### Happy paths

| ID | Given → When | Expect | Covers | Test file |
|---|---|---|---|---|
| T1 | <preconditions> → <action> | <exact assertion: status, value, side effect> | R1 | `<path>` |

### Error handling and edge cases

| ID | Given → When | Expect | Covers | Test file |
|---|---|---|---|---|
| T6 | <invalid input> → <action> | `400 invalid_payload`, nothing persisted | R2 | `<path>` |

Cover each of these or add a row saying why it does not apply: empty or missing input; absent
or already-deleted resource; duplicate or repeated call (idempotency); input over the size
limit; caller without permission; upstream dependency failing or timing out; malformed payload.

### How to run

```bash
<exact command that runs this feature's tests>
<exact lint / typecheck command>
```

## Security

### Decided — implement as written

| ID | Area | Decision | Why |
|---|---|---|---|
| S1 | Authorization | <e.g. reuse `requireRole('admin')` from `path/to/auth.ext`> | Every other route in `path/to/routes.ext` does this |

### Needs human approval — HALT

The items below are the **only** sanctioned reason to stop and ask a human. If this
subsection is absent, implement the entire spec without asking anything.

- [ ] **HALT S9** — <the decision, stated as a question> · **Proposed default:** <the safest
  option> · **Blocks:** Step 4

**Halt protocol for the implementing agent:**

1. Implement every step not named in a **Blocks:** field.
2. Do not implement a blocked step and do not substitute for it — no placeholder credential,
   permission, key, wildcard scope, or "TODO tighten this later".
3. Ask the human **once**, in a single message listing every HALT item with its proposed default.
4. On an answer: replace the HALT line with a row in **Decided**, then implement the blocked step.
5. With no answer: finish the unblocked steps, then stop and report which steps are outstanding
   and why.

## Definition of Done

- [ ] Every requirement R1..R<n> is implemented
- [ ] Every step's "Done when" condition holds
- [ ] Every test T1..T<n> exists and passes
- [ ] `<test command>` passes
- [ ] `<lint / typecheck command>` passes
- [ ] No HALT item is unresolved
- [ ] No abstraction, interface, or config switch was added beyond what the steps name
````

### Step 6: Review for readiness

Dispatch the `spec-readiness-reviewer` agent with exactly this context block:

```
SPEC_PATH: docs/specs/YYYY-MM-DD-<slug>.md
REPO_ROOT: <absolute path>
FEATURE_REQUEST: <the request, verbatim>
DECIDED_WITHOUT_USER: <the *-marked decision IDs, or none>
```

### Step 7: Fold in the findings

| Severity | Action |
|---|---|
| BLOCKER | Fix now with targeted `Edit`s. If a fix needs a fact you don't have, get it — re-read the file or grep the repo; don't paper over it with vaguer wording. |
| WARN | Fix if the fix is local (collapse an abstraction, add the missing error-case row, tighten a "done when"). Otherwise, list it in the final report. |
| INFO | Ignore. |

Then re-dispatch the reviewer **once** — at most two review passes total. If BLOCKERs survive the second pass: those needing a user decision go into one final `AskUserQuestion` batch (≤4 questions) and the answers are applied; security-relevant ones become `HALT` items and the header's `Status:` becomes `Blocked on HALT (...)`; anything else is reported verbatim to the user in chat (not written into the spec). Never loop unbounded, and never delete real content to satisfy the reviewer.

### Step 8: Report

Tell the user:
- The path written, and whether it was created or updated.
- Counts: N requirements, N steps, N tests (N happy / N error).
- Decisions made without asking (`*` IDs), one line each — "tell me if any of these is wrong".
- HALT items needing human sign-off, if any.
- The reviewer's verdict, and any unresolved findings.
- The handoff line: `Implement docs/specs/<file> exactly as written.`
