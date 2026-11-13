# rigorous-review

A strict pre-merge review. Ask Claude to do a rigorous review, review this diff, or stress-test a change before it ships, and it reads the diff against the default branch (or the PR, branch or path you name) and the code around each hunk. It checks logic and edge cases, concurrency and state, security and data integrity, performance and scale, and architecture and over-engineering. Add `--focus <area>` (for example `--focus security`, or any other name such as `extensibility`) to spend the whole review on one area; a critical issue outside it is still reported. Every finding gets a severity, a `file:line`, the failure mode and a minimal fix. It does not praise, does not pad the report with style nitpicks, and replies `No critical issues found.` when the change is clean. It only reads; it never edits files.

![Workflow of rigorous-review: you ask, the skill reads the diff and its context, checks five areas and reports findings](../images/workflow-rigorous-review.svg)

## What to type

Ask in plain words, or use the command with a PR number, a branch or a path:

```
do a rigorous review
/rigorous-review 123
/rigorous-review feature/login
/rigorous-review src/api --focus security
```

With no argument it reviews the current change: the branch against the default branch, or else your uncommitted work.

## How it works

![How rigorous-review works: the skill resolves the target, reads the diff and the surrounding code, checks five areas or the focus you name, and reports findings without editing any file](../images/how-rigorous-review.svg)

The numbers match the picture.

1. **Resolve the target:** a PR number, a branch, a path, or the current change.
2. **Read the diff** against the default branch, together with the code around each hunk.
3. **Check five areas:** logic and edge cases, concurrency and state, security and data integrity, performance and scale, architecture and over-engineering. With `--focus`, the whole review goes to the area you name.
4. **Report findings,** each with a severity, a `file:line`, the failure mode and a minimal fix, or `No critical issues found.`

## What it reads and writes

It only reads: the diff, and the code around it. It never edits a file. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install rigorous-review@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
